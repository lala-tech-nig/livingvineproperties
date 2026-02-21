const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');
const { protect, authorize } = require('../middlewares/authMiddleware');

// @route   POST /api/investments
// @desc    Create a new investment
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            name, email, contactAddress, phoneNumber, amountToInvest,
            durationInMonths, principalActionAfterMaturity, nin, bvn,
            accountDetails, nextOfKin, date
        } = req.body;

        // Set expected ROI to a flat 26% (Total Returns = Capital + 26% Profit)
        const expectedROI = amountToInvest * 1.26;

        const investment = await Investment.create({
            user: req.user._id,
            name, email, contactAddress, phoneNumber, amountToInvest,
            durationInMonths, principalActionAfterMaturity, nin, bvn,
            accountDetails, nextOfKin,
            startDate: date ? new Date(date) : new Date(),
            expectedROI,
            status: 'reviewing'
        });

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
// @access  Private (Management/CEO depending on status)
router.put('/:id/status', protect, authorize('management', 'ceo'), async (req, res) => {
    try {
        const { status, ceoPaymentAccount } = req.body;
        const investment = await Investment.findById(req.params.id);

        if (investment) {
            investment.status = status || investment.status;

            if (ceoPaymentAccount && req.user.role === 'ceo') {
                investment.ceoPaymentAccount = ceoPaymentAccount;
            }

            const updatedInvestment = await investment.save();
            res.json(updatedInvestment);
        } else {
            res.status(404).json({ message: 'Investment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

module.exports = router;
