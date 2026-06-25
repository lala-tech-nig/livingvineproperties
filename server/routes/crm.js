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

// @route   PUT /api/crm/customers/:id
// @desc    Update a customer record
router.put('/customers/:id', protect, async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/crm/customers/:id
// @desc    Delete a customer
router.delete('/customers/:id', protect, async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json({ message: 'Customer deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

// @route   PUT /api/crm/leads/:id
// @desc    Update a lead status
router.put('/leads/:id', protect, async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!lead) return res.status(404).json({ message: 'Lead not found' });
        res.json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/crm/leads/:id
// @desc    Delete a lead
router.delete('/leads/:id', protect, async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });
        res.json({ message: 'Lead deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
