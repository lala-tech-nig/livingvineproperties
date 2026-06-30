const express = require('express');
const router = express.Router();
const LedgerRecord = require('../models/LedgerRecord');
const { protect, authorize } = require('../middlewares/authMiddleware');

const LEDGER_ROLES = ['hr', 'ceo', 'superadmin'];

// @route   GET /api/ledger
// @desc    Get all ledger records with filtering, searching and pagination
// @access  Private (HR, CEO, Superadmin)
router.get('/', protect, authorize(...LEDGER_ROLES), async (req, res) => {
    try {
        const { search, type, account, category, startDate, endDate } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { voucherNo: { $regex: search, $options: 'i' } },
                { particulars: { $regex: search, $options: 'i' } }
            ];
        }

        if (type) query.type = type;
        if (account) query.account = account;
        if (category) query.category = category;

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const records = await LedgerRecord.find(query)
            .populate('createdBy', 'firstName surname role')
            .sort({ date: -1, createdAt: -1 });

        res.json(records);
    } catch (err) {
        res.status(500).json({ message: `Server Error: ${err.message}` });
    }
});

// @route   GET /api/ledger/summary
// @desc    Get account balances and category breakdown
// @access  Private (HR, CEO, Superadmin)
router.get('/summary', protect, authorize(...LEDGER_ROLES), async (req, res) => {
    try {
        const records = await LedgerRecord.find({});
        
        // Initialize bank accounts balances
        const accounts = {
            FBN: { income: 0, expenditure: 0, balance: 0 },
            UBA: { income: 0, expenditure: 0, balance: 0 },
            GTBANK: { income: 0, expenditure: 0, balance: 0 },
            CASH: { income: 0, expenditure: 0, balance: 0 }
        };

        const categoryBreakdown = {};

        records.forEach(rec => {
            const amt = rec.amount || 0;
            if (rec.type === 'income') {
                if (accounts[rec.account]) {
                    accounts[rec.account].income += amt;
                    accounts[rec.account].balance += amt;
                }
            } else if (rec.type === 'expenditure') {
                if (accounts[rec.account]) {
                    accounts[rec.account].expenditure += amt;
                    accounts[rec.account].balance -= amt;
                }
                // Group expenditures by category
                if (rec.category) {
                    categoryBreakdown[rec.category] = (categoryBreakdown[rec.category] || 0) + amt;
                }
            }
        });

        // Compute total combined balance
        const totalBalance = Object.values(accounts).reduce((sum, acc) => sum + acc.balance, 0);

        res.json({
            accounts,
            totalBalance,
            categoryBreakdown
        });
    } catch (err) {
        res.status(500).json({ message: `Server Error: ${err.message}` });
    }
});

// @route   POST /api/ledger
// @desc    Create a new ledger record
// @access  Private (HR, CEO, Superadmin)
router.post('/', protect, authorize(...LEDGER_ROLES), async (req, res) => {
    try {
        const { date, voucherNo, particulars, type, account, category, amount } = req.body;

        if (!date || !voucherNo || !particulars || !type || !account || !category || !amount) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newRecord = await LedgerRecord.create({
            date: new Date(date),
            voucherNo: voucherNo.trim(),
            particulars: particulars.trim(),
            type,
            account,
            category,
            amount: parseFloat(amount),
            createdBy: req.user._id
        });

        res.status(201).json(newRecord);
    } catch (err) {
        res.status(500).json({ message: `Server Error: ${err.message}` });
    }
});

// @route   DELETE /api/ledger/:id
// @desc    Delete a ledger record
// @access  Private (HR, CEO, Superadmin)
router.delete('/:id', protect, authorize(...LEDGER_ROLES), async (req, res) => {
    try {
        const record = await LedgerRecord.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        await record.deleteOne();
        res.json({ message: 'Record deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: `Server Error: ${err.message}` });
    }
});

module.exports = router;
