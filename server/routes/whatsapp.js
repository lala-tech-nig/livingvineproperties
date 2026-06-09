const express = require('express');
const router = express.Router();
const User = require('../models/User');
const WhatsAppContact = require('../models/WhatsAppContact');
const { protect, authorize } = require('../middlewares/authMiddleware');
const XLSX = require('xlsx');

// Helper to get date boundaries
const getDateBoundaries = () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    return { todayStart, weekStart, monthStart };
};

// @route   POST /api/whatsapp/contacts/bulk
// @desc    Bulk ingest harvested contacts with deduplication
// @access  Private (Staff and managers)
router.post('/contacts/bulk', protect, async (req, res) => {
    try {
        const { contacts } = req.body;
        if (!contacts || !Array.isArray(contacts)) {
            return res.status(400).json({ message: 'Invalid payload. Expecting an array of contacts.' });
        }

        // Normalize & clean
        const normalized = contacts.map(c => {
            // strip non-digits for phoneNumber
            const rawPhone = String(c.phoneNumber || '');
            const cleanPhone = rawPhone.replace(/\D/g, '');
            
            // extract country code if possible (e.g. from raw phone starting with +)
            let countryCode = c.countryCode || '';
            if (!countryCode && rawPhone.startsWith('+')) {
                // e.g. +234 803 -> 234
                const matches = rawPhone.match(/^\+(\d+)/);
                if (matches) countryCode = matches[1];
            }

            return {
                displayName: (c.displayName || '').trim() || 'Unknown',
                phoneNumber: cleanPhone,
                countryCode: countryCode.trim(),
                groupName: (c.groupName || '').trim() || 'WhatsApp Group',
                collectedBy: req.user.id
            };
        }).filter(c => c.phoneNumber.length >= 7); // minimum length for a valid phone number

        if (normalized.length === 0) {
            return res.status(200).json({ insertedCount: 0, skippedCount: contacts.length, message: 'No valid contacts found.' });
        }

        // De-duplicate within the payload
        const uniquePayloadMap = {};
        normalized.forEach(c => {
            uniquePayloadMap[c.phoneNumber] = c;
        });
        const uniquePayload = Object.values(uniquePayloadMap);

        // Check against database
        const phoneNumbers = uniquePayload.map(c => c.phoneNumber);
        const existingInDb = await WhatsAppContact.find({ phoneNumber: { $in: phoneNumbers } }).select('phoneNumber');
        const existingSet = new Set(existingInDb.map(c => c.phoneNumber));

        // Filter out existing
        const toInsert = uniquePayload.filter(c => !existingSet.has(c.phoneNumber));

        let insertedCount = 0;
        if (toInsert.length > 0) {
            const result = await WhatsAppContact.insertMany(toInsert);
            insertedCount = result.length;
        }

        const totalSkipped = contacts.length - insertedCount;

        res.status(201).json({
            insertedCount,
            skippedCount: totalSkipped,
            message: `Successfully uploaded ${insertedCount} contacts. Skipped ${totalSkipped} duplicates.`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/whatsapp/contacts/mine
// @desc    Retrieve contacts collected by the logged in staff member
// @access  Private (Staff specific)
router.get('/contacts/mine', protect, async (req, res) => {
    try {
        const { search, page = 1, limit = 20, period } = req.query;
        let query = { collectedBy: req.user.id };

        // Search filter
        if (search) {
            query.$or = [
                { displayName: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
                { groupName: { $regex: search, $options: 'i' } }
            ];
        }

        // Period filter
        const { todayStart, weekStart, monthStart } = getDateBoundaries();
        if (period === 'today') {
            query.createdAt = { $gte: todayStart };
        } else if (period === 'week') {
            query.createdAt = { $gte: weekStart };
        } else if (period === 'month') {
            query.createdAt = { $gte: monthStart };
        }

        const skip = (page - 1) * limit;
        const total = await WhatsAppContact.countDocuments(query);
        const contacts = await WhatsAppContact.find(query)
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        res.json({
            contacts,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/whatsapp/contacts/stats
// @desc    Get contacts count stats (Today, Week, Month, Total) for the logged in staff
// @access  Private
router.get('/contacts/stats', protect, async (req, res) => {
    try {
        const { todayStart, weekStart, monthStart } = getDateBoundaries();
        const userId = req.user.id;

        const total = await WhatsAppContact.countDocuments({ collectedBy: userId });
        const today = await WhatsAppContact.countDocuments({ collectedBy: userId, createdAt: { $gte: todayStart } });
        const week = await WhatsAppContact.countDocuments({ collectedBy: userId, createdAt: { $gte: weekStart } });
        const month = await WhatsAppContact.countDocuments({ collectedBy: userId, createdAt: { $gte: monthStart } });

        res.json({ today, week, month, total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/whatsapp/contacts/all
// @desc    Retrieve all contacts collected across the company
// @access  Private (Managers only)
router.get('/contacts/all', protect, authorize('management', 'ceo', 'superadmin'), async (req, res) => {
    try {
        const { search, staffId, page = 1, limit = 20 } = req.query;
        let query = {};

        if (staffId) {
            query.collectedBy = staffId;
        }

        if (search) {
            query.$or = [
                { displayName: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
                { groupName: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const total = await WhatsAppContact.countDocuments(query);
        const contacts = await WhatsAppContact.find(query)
            .populate('collectedBy', 'firstName surname email role')
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        res.json({
            contacts,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/whatsapp/contacts/staff-performance
// @desc    Retrieve performance metrics for all staff members
// @access  Private (Managers only)
router.get('/contacts/staff-performance', protect, authorize('management', 'ceo', 'superadmin'), async (req, res) => {
    try {
        const { todayStart, weekStart, monthStart } = getDateBoundaries();

        // Find all staff users (non-investors)
        const staffMembers = await User.find({ role: { $in: ['sales', 'marketing', 'hr', 'management', 'ceo', 'superadmin'] } })
            .select('firstName surname email role isActive');

        // Run groupings
        const totalCounts = await WhatsAppContact.aggregate([
            { $group: { _id: '$collectedBy', count: { $sum: 1 } } }
        ]);

        const todayCounts = await WhatsAppContact.aggregate([
            { $match: { createdAt: { $gte: todayStart } } },
            { $group: { _id: '$collectedBy', count: { $sum: 1 } } }
        ]);

        const weekCounts = await WhatsAppContact.aggregate([
            { $match: { createdAt: { $gte: weekStart } } },
            { $group: { _id: '$collectedBy', count: { $sum: 1 } } }
        ]);

        const monthCounts = await WhatsAppContact.aggregate([
            { $match: { createdAt: { $gte: monthStart } } },
            { $group: { _id: '$collectedBy', count: { $sum: 1 } } }
        ]);

        // Convert to maps for easy lookup
        const totalMap = {};
        totalCounts.forEach(c => { if (c._id) totalMap[c._id.toString()] = c.count; });

        const todayMap = {};
        todayCounts.forEach(c => { if (c._id) todayMap[c._id.toString()] = c.count; });

        const weekMap = {};
        weekCounts.forEach(c => { if (c._id) weekMap[c._id.toString()] = c.count; });

        const monthMap = {};
        monthCounts.forEach(c => { if (c._id) monthMap[c._id.toString()] = c.count; });

        const performance = staffMembers.map(staff => {
            const idStr = staff._id.toString();
            return {
                _id: staff._id,
                firstName: staff.firstName,
                surname: staff.surname,
                email: staff.email,
                role: staff.role,
                isActive: staff.isActive,
                today: todayMap[idStr] || 0,
                week: weekMap[idStr] || 0,
                month: monthMap[idStr] || 0,
                total: totalMap[idStr] || 0
            };
        });

        res.json(performance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/whatsapp/contacts/export
// @desc    Export contacts as Excel sheet
// @access  Private (Staff exports their own; manager exports queried/all)
router.get('/contacts/export', protect, async (req, res) => {
    try {
        const isManager = ['management', 'ceo', 'superadmin'].includes(req.user.role);
        let query = {};

        if (!isManager) {
            query = { collectedBy: req.user.id };
        } else if (req.query.staffId) {
            query = { collectedBy: req.query.staffId };
        }

        const contacts = await WhatsAppContact.find(query).populate('collectedBy', 'firstName surname email');

        const excelData = contacts.map(c => ({
            'Display Name': c.displayName,
            'Phone Number': c.phoneNumber,
            'Country Code': c.countryCode || '',
            'Group Name': c.groupName,
            'Collected By': c.collectedBy ? `${c.collectedBy.firstName} ${c.collectedBy.surname}` : 'System',
            'Collector Email': c.collectedBy ? c.collectedBy.email : '',
            'Date Harvested': c.createdAt.toLocaleString()
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'WhatsApp Contacts');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="whatsapp_contacts.xlsx"');
        res.end(buffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/whatsapp/create-staff
// @desc    Register a new staff account (manager/CEO/superadmin only)
// @access  Private (Managers only)
router.post('/create-staff', protect, authorize('management', 'ceo', 'superadmin'), async (req, res) => {
    try {
        const { email, firstName, surname, phoneNumber, password, role } = req.body;
        if (!email || !firstName || !surname || !phoneNumber || !password || !role) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Validate role is staff
        const staffRoles = ['sales', 'marketing', 'hr', 'management'];
        if (!staffRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid staff role specified' });
        }

        // Hash password
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            email,
            firstName,
            surname,
            phoneNumber,
            password: hashedPassword,
            role,
            isActive: true
        });

        res.status(201).json({
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            surname: user.surname,
            role: user.role,
            isActive: user.isActive,
            message: 'Staff account created successfully.'
        });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

module.exports = router;
