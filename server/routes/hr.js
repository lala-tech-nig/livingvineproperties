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

// @route   GET /api/hr/attendance/my
// @desc    Get current user's own attendance history
router.get('/attendance/my', protect, async (req, res) => {
    try {
        const records = await Attendance.find({ userId: req.user.id })
            .sort('-date')
            .limit(30);
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/hr/attendance/all
// @desc    Get all attendance records (HR/Management/CEO/SuperAdmin)
router.get('/attendance/all', protect, async (req, res) => {
    try {
        if (!['hr', 'management', 'ceo', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const records = await Attendance.find({})
            .populate('userId', 'firstName surname email role')
            .sort('-date')
            .limit(100);
        res.json(records);
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

// @route   POST /api/hr/payroll
// @desc    Create a new payroll record (HR/Management only)
router.post('/payroll', protect, async (req, res) => {
    try {
        if (!['hr', 'management', 'ceo', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Only HR and above can create payroll records' });
        }
        const { userId, month, year, baseSalary, bonuses = 0, deductions = 0, notes } = req.body;
        const netPay = baseSalary + bonuses - deductions;

        const payroll = new Payroll({
            userId, month, year, baseSalary, bonuses, deductions, netPay, notes, status: 'pending'
        });
        await payroll.save();
        const populated = await Payroll.findById(payroll._id).populate('userId', 'firstName surname email');
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   PUT /api/hr/payroll/:id
// @desc    Update payroll status (mark paid, processed)
router.put('/payroll/:id', protect, async (req, res) => {
    try {
        if (!['hr', 'management', 'ceo', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('userId', 'firstName surname email');
        if (!payroll) return res.status(404).json({ message: 'Payroll record not found' });
        res.json(payroll);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
