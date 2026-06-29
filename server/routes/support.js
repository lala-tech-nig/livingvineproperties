const express = require('express');
const router = express.Router();
const SupportMessage = require('../models/SupportMessage');
const User = require('../models/User');
const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/support/messages
// @desc    Send a support message (investor to support, or staff reply)
// @access  Private
router.post('/messages', protect, async (req, res) => {
    try {
        const { message, investorId } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message content is required.' });
        }

        const isStaff = ['management', 'ceo', 'superadmin', 'sales', 'marketing', 'hr'].includes(req.user.role);
        
        let targetInvestorId;
        let isAdminReply = false;

        if (isStaff) {
            if (!investorId) {
                return res.status(400).json({ message: 'investorId is required for staff replies.' });
            }
            targetInvestorId = investorId;
            isAdminReply = true;
        } else {
            targetInvestorId = req.user._id;
        }

        const newMessage = await SupportMessage.create({
            investorId: targetInvestorId,
            sender: req.user._id,
            message,
            isAdminReply
        });

        const populated = await SupportMessage.findById(newMessage._id)
            .populate('sender', 'firstName surname profileImage role');

        // Send Notification
        try {
            const Notification = require('../models/Notification');
            if (isAdminReply) {
                // Notify the investor
                await Notification.create({
                    userId: targetInvestorId,
                    title: 'New Support Message',
                    message: 'You have received a reply from the support team. Check the Support tab.',
                });
            } else {
                // Investor sent a message. Find their account officer (if any)
                const investorUser = await User.findById(req.user._id).populate('accountOfficer');
                if (investorUser && investorUser.accountOfficer) {
                    await Notification.create({
                        userId: investorUser.accountOfficer._id,
                        title: 'New Support Message',
                        message: `${investorUser.firstName} ${investorUser.surname} has sent a support message.`,
                    });
                } else {
                    // Notify all management/admins
                    const admins = await User.find({ role: { $in: ['management', 'ceo', 'superadmin'] } }).select('_id');
                    await Promise.all(admins.map(admin =>
                        Notification.create({
                            userId: admin._id,
                            title: 'New General Support Message',
                            message: `${investorUser.firstName} ${investorUser.surname} has sent a support message.`,
                        })
                    ));
                }
            }
        } catch (err) {
            console.error('Error sending support message notification:', err);
        }

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   GET /api/support/messages
// @desc    Get support messages for a thread
// @access  Private
router.get('/messages', protect, async (req, res) => {
    try {
        const isStaff = ['management', 'ceo', 'superadmin', 'sales', 'marketing', 'hr'].includes(req.user.role);
        let targetInvestorId;

        if (isStaff) {
            targetInvestorId = req.query.investorId;
            if (!targetInvestorId) {
                return res.status(400).json({ message: 'investorId query parameter is required for staff.' });
            }
        } else {
            targetInvestorId = req.user._id;
        }

        const messages = await SupportMessage.find({ investorId: targetInvestorId })
            .populate('sender', 'firstName surname profileImage role')
            .sort('createdAt');

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   GET /api/support/threads
// @desc    Get all active support threads (Staff only)
// @access  Private (Staff only)
router.get('/threads', protect, async (req, res) => {
    try {
        const isStaff = ['management', 'ceo', 'superadmin', 'sales', 'marketing', 'hr'].includes(req.user.role);
        if (!isStaff) {
            return res.status(403).json({ message: 'Not authorized.' });
        }

        // Aggregate unique investorIds, get latest message
        const threads = await SupportMessage.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$investorId',
                    latestMessage: { $first: '$message' },
                    latestSender: { $first: '$sender' },
                    lastActive: { $first: '$createdAt' }
                }
            },
            { $sort: { lastActive: -1 } }
        ]);

        // Populate investor details
        const populatedThreads = await Promise.all(threads.map(async (t) => {
            const investor = await User.findById(t._id).select('firstName surname email phoneNumber profileImage');
            const sender = await User.findById(t.latestSender).select('firstName surname role');
            return {
                investor,
                latestMessage: t.latestMessage,
                latestSender: sender,
                lastActive: t.lastActive
            };
        }));

        res.json(populatedThreads.filter(t => t.investor !== null));
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

module.exports = router;
