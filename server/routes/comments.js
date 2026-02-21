const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/comments/:investmentId
// @desc    Add a comment to an investment
// @access  Private
router.post('/:investmentId', protect, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Comment missing' });
        }

        const comment = await Comment.create({
            investmentId: req.params.investmentId,
            userId: req.user._id,
            message,
            role: req.user.role
        });

        // Populate user to get name/profile info on frontend
        const newComment = await Comment.findById(comment._id).populate('userId', 'firstName surname profileImage');

        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   GET /api/comments/:investmentId
// @desc    Get comments for an investment
// @access  Private
router.get('/:investmentId', protect, async (req, res) => {
    try {
        const comments = await Comment.find({ investmentId: req.params.investmentId })
            .populate('userId', 'firstName surname profileImage')
            .sort('createdAt');

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

module.exports = router;
