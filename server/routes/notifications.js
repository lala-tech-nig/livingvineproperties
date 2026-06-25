const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middlewares/authMiddleware');

// @route   GET /api/notifications
// @desc    Get notifications for the logged-in user
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort('-createdAt')
            .limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/notifications/all
// @desc    Get all system-wide notifications (Management/CEO/SuperAdmin)
router.get('/all', protect, async (req, res) => {
    try {
        if (!['superadmin', 'ceo', 'management'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const notifications = await Notification.find({})
            .populate('userId', 'firstName surname email role')
            .sort('-createdAt')
            .limit(100);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all user notifications as read
router.put('/mark-all-read', protect, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
router.delete('/:id', protect, async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
