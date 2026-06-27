const express = require('express');
const router = express.Router();
const BankAccount = require('../models/BankAccount');
const { protect, authorize } = require('../middlewares/authMiddleware');

const CEO_ROLES = ['ceo', 'superadmin'];

// ─────────────────────────────────────────────────────────────
// GET /api/finance/accounts  — list all company bank accounts
// ─────────────────────────────────────────────────────────────
router.get('/accounts', protect, async (req, res) => {
    try {
        const accounts = await BankAccount.find({ isActive: true })
            .select('-transactions')
            .sort('-createdAt');
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// GET /api/finance/accounts/:id — single account with transactions
// ─────────────────────────────────────────────────────────────
router.get('/accounts/:id', protect, authorize(...CEO_ROLES), async (req, res) => {
    try {
        const account = await BankAccount.findById(req.params.id)
            .populate('transactions.performedBy', 'firstName surname role');
        if (!account) return res.status(404).json({ message: 'Account not found' });
        res.json(account);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// POST /api/finance/accounts — add a new company bank account
// ─────────────────────────────────────────────────────────────
router.post('/accounts', protect, authorize(...CEO_ROLES), async (req, res) => {
    try {
        const { bankName, accountNumber, accountName, openingBalance } = req.body;
        if (!bankName || !accountNumber || !accountName) {
            return res.status(400).json({ message: 'bankName, accountNumber and accountName are required.' });
        }

        const existing = await BankAccount.findOne({ accountNumber });
        if (existing) return res.status(400).json({ message: 'An account with this number already exists.' });

        const balance = parseFloat(openingBalance) || 0;
        const account = await BankAccount.create({
            bankName, accountNumber, accountName,
            balance,
            addedBy: req.user._id,
            transactions: balance > 0 ? [{
                type: 'credit',
                amount: balance,
                description: 'Opening balance',
                performedBy: req.user._id,
            }] : []
        });
        res.status(201).json(account);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/finance/accounts/:id — deactivate account
// ─────────────────────────────────────────────────────────────
router.delete('/accounts/:id', protect, authorize(...CEO_ROLES), async (req, res) => {
    try {
        const account = await BankAccount.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!account) return res.status(404).json({ message: 'Account not found' });
        res.json({ message: 'Account deactivated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// POST /api/finance/accounts/:id/credit
// ─────────────────────────────────────────────────────────────
router.post('/accounts/:id/credit', protect, authorize(...CEO_ROLES), async (req, res) => {
    try {
        const { amount, description, reference } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });

        const account = await BankAccount.findById(req.params.id);
        if (!account) return res.status(404).json({ message: 'Account not found' });

        account.balance += parseFloat(amount);
        account.transactions.push({
            type: 'credit', amount: parseFloat(amount),
            description: description || 'Manual credit',
            reference, performedBy: req.user._id
        });
        await account.save();
        res.json(account);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// POST /api/finance/accounts/:id/debit
// ─────────────────────────────────────────────────────────────
router.post('/accounts/:id/debit', protect, authorize(...CEO_ROLES), async (req, res) => {
    try {
        const { amount, description, reference } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });

        const account = await BankAccount.findById(req.params.id);
        if (!account) return res.status(404).json({ message: 'Account not found' });

        account.balance -= parseFloat(amount);
        account.transactions.push({
            type: 'debit', amount: parseFloat(amount),
            description: description || 'Manual debit',
            reference, performedBy: req.user._id
        });
        await account.save();
        res.json(account);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
