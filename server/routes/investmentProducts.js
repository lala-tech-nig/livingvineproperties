const express = require('express');
const router = express.Router();
const InvestmentProduct = require('../models/InvestmentProduct');
const { protect, authorize } = require('../middlewares/authMiddleware');

const staffRoles = ['management', 'ceo', 'superadmin'];

// @route   GET /api/investment-products
// @desc    Get all active investment products
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const products = await InvestmentProduct.find({ isActive: true }).sort({ durationInMonths: 1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/investment-products/admin
// @desc    Get all products (both active and inactive) for management
// @access  Private/Admin
router.get('/admin', protect, authorize(...staffRoles), async (req, res) => {
    try {
        const products = await InvestmentProduct.find().sort({ durationInMonths: 1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/investment-products
// @desc    Create a new investment product
// @access  Private/Admin
router.post('/', protect, authorize(...staffRoles), async (req, res) => {
    try {
        const { name, durationInMonths, roiPercent, description, principalOptions, isActive } = req.body;
        
        if (!name || !durationInMonths || !roiPercent || !description) {
            return res.status(400).json({ message: 'Name, duration, ROI%, and description are required' });
        }

        const product = await InvestmentProduct.create({
            name,
            durationInMonths,
            roiPercent,
            description,
            principalOptions,
            isActive
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/investment-products/:id
// @desc    Update an investment product
// @access  Private/Admin
router.put('/:id', protect, authorize(...staffRoles), async (req, res) => {
    try {
        const { name, durationInMonths, roiPercent, description, principalOptions, isActive } = req.body;

        const product = await InvestmentProduct.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.name = name !== undefined ? name : product.name;
        product.durationInMonths = durationInMonths !== undefined ? durationInMonths : product.durationInMonths;
        product.roiPercent = roiPercent !== undefined ? roiPercent : product.roiPercent;
        product.description = description !== undefined ? description : product.description;
        product.principalOptions = principalOptions !== undefined ? principalOptions : product.principalOptions;
        product.isActive = isActive !== undefined ? isActive : product.isActive;

        const updated = await product.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/investment-products/:id
// @desc    Delete an investment product
// @access  Private/Admin
router.delete('/:id', protect, authorize(...staffRoles), async (req, res) => {
    try {
        const product = await InvestmentProduct.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await product.deleteOne();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
