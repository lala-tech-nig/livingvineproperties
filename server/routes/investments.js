const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Investment = require('../models/Investment');
const InvestmentProduct = require('../models/InvestmentProduct');
const { protect, authorize } = require('../middlewares/authMiddleware');

// @route   GET /api/investments/verify-identity
// @desc    Verify NIN or BVN using local db.json records
// @access  Private
router.get('/verify-identity', protect, async (req, res) => {
    try {
        const { type, number } = req.query;
        if (!type || !number) {
            return res.status(400).json({ message: 'Type (nin or bvn) and identity number are required.' });
        }

        const dbPath = path.join(__dirname, '../data/db.json');
        if (!fs.existsSync(dbPath)) {
            return res.status(500).json({ message: 'Identity validation registry not found on server.' });
        }

        const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        let record = null;

        if (type.toLowerCase() === 'nin') {
            record = dbContent.nins && dbContent.nins[number];
        } else if (type.toLowerCase() === 'bvn') {
            record = dbContent.bvns && dbContent.bvns[number];
        } else {
            return res.status(400).json({ message: 'Invalid identity type. Must be "nin" or "bvn".' });
        }

        if (!record) {
            return res.status(404).json({ message: 'Invalid NIN/BVN. Identity verification failed.' });
        }

        res.json(record);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   POST /api/investments
// @desc    Create a new investment
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            name, email, contactAddress, phoneNumber, amountToInvest,
            durationInMonths, principalActionAfterMaturity, nin, bvn,
            accountDetails, nextOfKin, date, productId, roiPercent
        } = req.body;

        // Calculate dynamic expected ROI
        let actualRoiPercent = roiPercent || 24;
        if (productId) {
            const product = await InvestmentProduct.findById(productId);
            if (product) {
                actualRoiPercent = product.roiPercent;
            }
        }
        
        const expectedROI = amountToInvest * (1 + (actualRoiPercent / 100));

        const investment = await Investment.create({
            user: req.user._id,
            name, email, contactAddress, phoneNumber, amountToInvest,
            durationInMonths, principalActionAfterMaturity, nin, bvn,
            accountDetails, nextOfKin,
            startDate: date ? new Date(date) : new Date(),
            expectedROI,
            status: 'reviewing'
        });

        // Persist NIN to user profile for future investment auto-fill (first time only)
        const User = require('../models/User');
        const userDoc = await User.findById(req.user._id);
        if (userDoc && nin && !userDoc.nin) {
            userDoc.nin = nin;
            await userDoc.save();
        }

        res.status(201).json(investment);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});


// @route   GET /api/investments/my
// @desc    Get logged in user investments
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const investments = await Investment.find({ user: req.user._id }).sort('-createdAt');
        res.json(investments);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   GET /api/investments
// @desc    Get all investments (management / ceo)
// @access  Private/Admin
router.get('/', protect, authorize('management', 'ceo'), async (req, res) => {
    try {
        const investments = await Investment.find({}).populate('user', 'id firstName surname email').sort('-createdAt');
        res.json(investments);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   GET /api/investments/:id
// @desc    Get investment by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const investment = await Investment.findById(req.params.id).populate('user', 'id firstName surname email');
        if (investment) {
            res.json(investment);
        } else {
            res.status(404).json({ message: 'Investment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   PUT /api/investments/:id/status
// @desc    Update investment status
// @access  CEO/Superadmin for approvals; Management for review-level updates only
router.put('/:id/status', protect, authorize('management', 'ceo', 'superadmin'), async (req, res) => {
    try {
        const { status, companyAccountId } = req.body;
        const isCEO = ['ceo', 'superadmin'].includes(req.user.role);

        // Management cannot approve or decline — CEO only
        const ceoOnlyStatuses = ['approved', 'declined', 'active', 'liquidated'];
        if (!isCEO && ceoOnlyStatuses.includes(status)) {
            return res.status(403).json({
                message: 'Only the CEO can approve, decline, activate or liquidate investments.'
            });
        }

        const investment = await Investment.findById(req.params.id);
        if (!investment) return res.status(404).json({ message: 'Investment not found' });
        const wasActive = investment.status === 'active';
        investment.status = status || investment.status;

        // Save selected company bank account (the account investor should pay into)
        let selectedAccountId = companyAccountId || (investment.ceoPaymentAccount && investment.ceoPaymentAccount.accountId);
        if (isCEO && companyAccountId) {
            const BankAccount = require('../models/BankAccount');
            const account = await BankAccount.findById(companyAccountId);
            if (account) {
                investment.ceoPaymentAccount = {
                    bankName:      account.bankName,
                    accountNumber: account.accountNumber,
                    accountName:   account.accountName,
                    accountId:     account._id,
                };
                selectedAccountId = account._id;
            }
        }

        // Auto-credit company bank account if transitioning to active
        if (status === 'active' && !wasActive && selectedAccountId) {
            try {
                const BankAccount = require('../models/BankAccount');
                const account = await BankAccount.findById(selectedAccountId);
                if (account) {
                    account.balance += parseFloat(investment.amountToInvest || 0);
                    account.transactions.push({
                        type: 'credit',
                        amount: parseFloat(investment.amountToInvest || 0),
                        description: `Investment payment received from ${investment.name}`,
                        reference: investment._id.toString(),
                        performedBy: req.user._id
                    });
                    await account.save();
                }
            } catch (err) {
                console.error('Error auto-crediting bank account:', err);
            }
        }

        const updatedInvestment = await investment.save();

        // Create notification for the investor
        try {
            const Notification = require('../models/Notification');
            const statusMessages = {
                approved:   'Your investment has been approved! Please proceed with payment to the provided account.',
                declined:   'Your investment application has been declined. Contact your account officer for details.',
                active:     'Your investment is now active and generating returns.',
                liquidated: 'Your investment has been liquidated. Returns have been processed.',
                retreated:  'Your investment has been marked as retreated.',
            };
            if (statusMessages[status]) {
                await Notification.create({
                    userId:  investment.user,
                    title:   `Investment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                    message: statusMessages[status],
                });
            }
        } catch (_) { /* non-blocking */ }

        res.json(updatedInvestment);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

module.exports = router;
