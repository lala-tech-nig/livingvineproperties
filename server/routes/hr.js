const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const User = require('../models/User');
const Loan = require('../models/Loan');
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
        const existingPayroll = await Payroll.findById(req.params.id);
        if (!existingPayroll) return res.status(404).json({ message: 'Payroll record not found' });

        // If status is updated to 'paid' and it wasn't paid before, apply loan payment logic
        if (req.body.status === 'paid' && existingPayroll.status !== 'paid') {
            if (existingPayroll.loanId && existingPayroll.loanDeduction > 0) {
                const loan = await Loan.findById(existingPayroll.loanId);
                if (loan && loan.status === 'active') {
                    loan.totalPaid += existingPayroll.loanDeduction;
                    if (loan.totalPaid >= loan.totalPayable) {
                        loan.status = 'paid';
                    }
                    await loan.save();
                }
            }
        }

        const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('userId', 'firstName surname email role idNumber age joiningDate');
        res.json(payroll);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   GET /api/hr/loans
// @desc    Get staff loans (staff sees own, HR/management sees all)
router.get('/loans', protect, async (req, res) => {
    try {
        let query = { userId: req.user.id };
        if (['hr', 'management', 'ceo', 'superadmin'].includes(req.user.role)) {
            query = {};
        }
        const loans = await Loan.find(query).populate('userId', 'firstName surname email role');
        res.json(loans);
    } catch (error) {
        res.status(550).json({ message: error.message });
    }
});

// @route   POST /api/hr/loans
// @desc    Create a new loan record (HR/management only)
router.post('/loans', protect, async (req, res) => {
    try {
        if (!['hr', 'management', 'ceo', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Only HR and above can record loans' });
        }
        const { userId, amount, totalPayable, monthlyInstallment, repaymentPlan } = req.body;
        if (!userId || !amount || !totalPayable || !monthlyInstallment || !repaymentPlan) {
            return res.status(400).json({ message: 'Please provide all loan fields' });
        }
        const loan = new Loan({
            userId,
            amount: Number(amount),
            totalPayable: Number(totalPayable),
            monthlyInstallment: Number(monthlyInstallment),
            repaymentPlan,
            totalPaid: 0,
            status: 'active'
        });
        await loan.save();
        const populated = await Loan.findById(loan._id).populate('userId', 'firstName surname email role');
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   POST /api/hr/payroll/generate
// @desc    Auto-generate monthly payroll for all staff
router.post('/payroll/generate', protect, async (req, res) => {
    try {
        if (!['hr', 'management', 'ceo', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Only HR and above can generate payroll' });
        }
        const { month, year } = req.body;
        if (!month || !year) {
            return res.status(400).json({ message: 'Please provide month and year' });
        }

        const staff = await User.find({ role: { $ne: 'investor' } });
        const generatedRecords = [];

        for (const u of staff) {
            // Check if payroll already exists
            const existing = await Payroll.findOne({ userId: u._id, month, year });
            if (existing) {
                generatedRecords.push(existing);
                continue;
            }

            const baseSalary = u.basicSalary || 0;
            const bonuses = u.bonuses || 0;
            let deductions = 0;
            let loanDeduction = 0;
            let loanRemainingBalance = 0;
            let loanId = undefined;
            let noteList = [];

            // Check active loan
            const activeLoan = await Loan.findOne({ userId: u._id, status: 'active' });
            if (activeLoan) {
                const unpaidAmount = activeLoan.totalPayable - activeLoan.totalPaid;
                if (unpaidAmount > 0) {
                    loanDeduction = Math.min(activeLoan.monthlyInstallment, unpaidAmount);
                    deductions += loanDeduction;
                    loanRemainingBalance = unpaidAmount - loanDeduction;
                    loanId = activeLoan._id;
                    noteList.push(`Auto-deducted loan installment of ₦${loanDeduction.toLocaleString()}. Remaining: ₦${loanRemainingBalance.toLocaleString()}.`);
                }
            }

            const netPay = baseSalary + bonuses - deductions;
            const payroll = new Payroll({
                userId: u._id,
                month,
                year,
                baseSalary,
                bonuses,
                deductions,
                netPay,
                status: 'pending',
                loanDeduction,
                loanRemainingBalance,
                loanId,
                notes: noteList.join(' ') || 'Auto-generated payroll.'
            });

            await payroll.save();
            generatedRecords.push(payroll);
        }

        // Return the full populated list for that period
        const allPayrolls = await Payroll.find({ month, year }).populate('userId', 'firstName surname email role idNumber age joiningDate');
        res.json(allPayrolls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
