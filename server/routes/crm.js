const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const { protect } = require('../middlewares/authMiddleware');

// @route   GET /api/crm/customers
// @desc    Get all customers
router.get('/customers', protect, async (req, res) => {
    try {
        const customers = await Customer.find().populate('assignedTo', 'firstName surname');
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/crm/customers
// @desc    Create a new customer
router.post('/customers', protect, async (req, res) => {
    try {
        const customer = new Customer(req.body);
        const savedCustomer = await customer.save();
        res.status(201).json(savedCustomer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   GET /api/crm/leads
// @desc    Get all leads
router.get('/leads', protect, async (req, res) => {
    try {
        const leads = await Lead.find().populate('assignedTo', 'firstName surname');
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/crm/leads
// @desc    Create a new lead
router.post('/leads', protect, async (req, res) => {
    try {
        const lead = new Lead(req.body);
        const savedLead = await lead.save();
        res.status(201).json(savedLead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
