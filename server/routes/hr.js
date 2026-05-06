const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/hr/attendance/check-in
// @desc    Staff daily check-in
router.post('/attendance/check-in', protect, async (req, res) => {
    try {
        const today = new Date().setHours(0, 0, 0, 0);
        const existing = await Attendance.findOne({ userId: req.user.id, date: today });
        
        if (existing) {
            return res.status(400).json({ message: 'Already checked in today' });
        }

        const attendance = new Attendance({
            userId: req.user.id,
            date: today,
            checkIn: new Date(),
        });

        await attendance.save();
        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/hr/attendance/check-out
// @desc    Staff daily check-out
router.post('/attendance/check-out', protect, async (req, res) => {
    try {
        const today = new Date().setHours(0, 0, 0, 0);
        const attendance = await Attendance.findOne({ userId: req.user.id, date: today });
        
        if (!attendance) {
            return res.status(400).json({ message: 'No check-in record found for today' });
        }

        attendance.checkOut = new Date();
        await attendance.save();
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/hr/payroll
// @desc    Get staff payroll (Staff sees their own, HR/Admin sees all)
router.get('/payroll', protect, async (req, res) => {
    try {
        let query = { userId: req.user.id };
        if (['hr', 'management', 'ceo', 'superadmin'].includes(req.user.role)) {
            query = {}; // See all
        }
        
        const payrolls = await Payroll.find(query).populate('userId', 'firstName surname email');
        res.json(payrolls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
