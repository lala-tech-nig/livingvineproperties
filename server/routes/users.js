const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middlewares/authMiddleware');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   GET /api/users/all
// @desc    Get all users (Admin/Management only)
// @access  Private
router.get('/all', protect, async (req, res) => {
    try {
        if (!['superadmin', 'ceo', 'management', 'hr'].includes(req.user.role)) {
            return res.status(401).json({ message: 'Not authorized to view all users' });
        }
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   PUT /api/users/:id/suspend
// @desc    Toggle user active status (suspend/activate)
// @access  Private (Tiered access)
router.put('/:id/suspend', protect, async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        const currentUser = req.user;
        
        // Tiered Permission Logic
        const tiers = {
            'superadmin': 100,
            'ceo': 80,
            'management': 60,
            'hr': 40,
            'sales': 20,
            'marketing': 20,
            'investor': 0
        };

        const currentTier = tiers[currentUser.role] || 0;
        const targetTier = tiers[targetUser.role] || 0;

        // Current user must have a higher tier than target user
        if (currentTier <= targetTier) {
            return res.status(401).json({ message: 'Insufficient permissions to suspend this account level' });
        }

        targetUser.isActive = !targetUser.isActive;
        const updatedUser = await targetUser.save();
        
        res.json({
            _id: updatedUser._id,
            isActive: updatedUser.isActive,
            message: `Account ${updatedUser.isActive ? 'activated' : 'suspended'} successfully`
        });

    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

module.exports = router;
