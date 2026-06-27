const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const { protect, authorize } = require('../middlewares/authMiddleware');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const TIERS = { superadmin: 100, ceo: 80, management: 60, hr: 40, sales: 20, marketing: 20, investor: 0 };

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('accountOfficer', 'firstName surname email phoneNumber role');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   PUT /api/users/profile
// @desc    Update investor account settings (celebration dates, demographics, address, etc.)
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const allowed = ['gender', 'religion', 'state', 'address', 'occupation', 'dob', 'age', 'celebrationDates', 'profileImage'];
        const updates = {};
        allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

        const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true })
            .select('-password')
            .populate('accountOfficer', 'firstName surname email phoneNumber role');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   POST /api/users/profile/photo
// @desc    Upload profile photo to Cloudinary and save URL
// @access  Private
router.post('/profile/photo', protect, async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) return res.status(400).json({ message: 'No image data provided.' });

        const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
            folder: 'livingvine/profiles',
            transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { profileImage: uploadResponse.secure_url },
            { new: true }
        ).select('-password');

        res.json({ profileImage: uploadResponse.secure_url, user });
    } catch (error) {
        res.status(500).json({ message: `Upload failed: ${error.message}` });
    }
});

// @route   GET /api/users/profile/completion
// @desc    Return profile completion percentage for the logged-in investor
// @access  Private
router.get('/profile/completion', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const checks = [
            { key: 'profileImage',     label: 'Profile Photo',          done: !!user.profileImage },
            { key: 'dob',              label: 'Date of Birth',           done: !!user.dob },
            { key: 'gender',           label: 'Gender',                  done: !!user.gender },
            { key: 'religion',         label: 'Religion',                done: !!user.religion },
            { key: 'state',            label: 'State / Location',        done: !!user.state },
            { key: 'address',          label: 'Home Address',            done: !!user.address },
            { key: 'occupation',       label: 'Occupation',              done: !!user.occupation },
            { key: 'nin',              label: 'NIN Verified',            done: !!user.nin },
            { key: 'celebrationDates', label: 'Anniversary Dates',       done: user.celebrationDates && user.celebrationDates.length > 0 },
        ];

        const done = checks.filter(c => c.done).length;
        const percent = Math.round((done / checks.length) * 100);

        res.json({ percent, total: checks.length, done, checks });
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

// @route   GET /api/users/investors
// @desc    Get all investor accounts with optional demographic filters
// @access  Private (any staff)
router.get('/investors', protect, async (req, res) => {
    try {
        if (req.user.role === 'investor') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const filter = { role: 'investor' };
        if (req.query.religion) filter.religion = req.query.religion;
        if (req.query.gender) filter.gender = req.query.gender;
        if (req.query.state) filter.state = { $regex: new RegExp(req.query.state, 'i') };
        if (req.query.ageMin || req.query.ageMax) {
            filter.age = {};
            if (req.query.ageMin) filter.age.$gte = Number(req.query.ageMin);
            if (req.query.ageMax) filter.age.$lte = Number(req.query.ageMax);
        }

        const investors = await User.find(filter)
            .select('-password')
            .populate('accountOfficer', 'firstName surname email phoneNumber role')
            .sort({ createdAt: -1 });
        res.json(investors);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   GET /api/users/my-investors
// @desc    Get investors where current staff is the accountOfficer
// @access  Private (any staff)
router.get('/my-investors', protect, async (req, res) => {
    try {
        if (req.user.role === 'investor') {
            return res.status(403).json({ message: 'Investors cannot have sub-accounts' });
        }
        const investors = await User.find({ role: 'investor', accountOfficer: req.user._id })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(investors);
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

        const currentTier = TIERS[req.user.role] || 0;
        const targetTier = TIERS[targetUser.role] || 0;

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

// @route   PUT /api/users/:id/role
// @desc    Update user role (Tiered access)
// @access  Private
router.put('/:id/role', protect, async (req, res) => {
    try {
        const { role } = req.body;
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        const currentTier = TIERS[req.user.role] || 0;
        const targetTier = TIERS[targetUser.role] || 0;
        const newTier = TIERS[role] || 0;

        if (currentTier <= targetTier || currentTier <= newTier) {
            return res.status(401).json({ message: 'Insufficient permissions to modify this role' });
        }

        targetUser.role = role;
        await targetUser.save();
        res.json({ message: 'Role updated successfully', user: targetUser });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   POST /api/users/:id/transfer-accounts
// @desc    Transfer all assigned accounts from one staff to another
// @access  Private (Management / CEO / Superadmin)
router.post('/:id/transfer-accounts', protect, async (req, res) => {
    try {
        if (!['management', 'ceo', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Only management and above can transfer accounts' });
        }

        const { targetStaffId } = req.body;
        if (!targetStaffId) return res.status(400).json({ message: 'Please provide targetStaffId' });

        const sourceStaff = await User.findById(req.params.id);
        if (!sourceStaff) return res.status(404).json({ message: 'Source staff member not found' });
        if (sourceStaff.role === 'investor') return res.status(400).json({ message: 'Source must be a staff member' });

        const currentTier = TIERS[req.user.role] || 0;
        const sourceTier = TIERS[sourceStaff.role] || 0;
        if (currentTier <= sourceTier) {
            return res.status(401).json({ message: 'Insufficient permissions to transfer from this staff tier' });
        }

        if (targetStaffId === req.params.id) return res.status(400).json({ message: 'Source and target must be different' });

        const targetStaff = await User.findById(targetStaffId);
        if (!targetStaff) return res.status(404).json({ message: 'Target staff member not found' });
        if (!targetStaff.isActive) return res.status(400).json({ message: 'Target staff must be active' });
        if (targetStaff.role === 'investor') return res.status(400).json({ message: 'Target must be a staff member' });

        const [customerResult, leadResult, investorResult] = await Promise.all([
            Customer.updateMany({ assignedTo: sourceStaff._id }, { $set: { assignedTo: targetStaff._id } }),
            Lead.updateMany({ assignedTo: sourceStaff._id }, { $set: { assignedTo: targetStaff._id } }),
            User.updateMany({ accountOfficer: sourceStaff._id, role: 'investor' }, { $set: { accountOfficer: targetStaff._id } }),
        ]);

        res.json({
            message: `Accounts transferred from ${sourceStaff.firstName} ${sourceStaff.surname} to ${targetStaff.firstName} ${targetStaff.surname}`,
            transferred: {
                customers: customerResult.modifiedCount,
                leads: leadResult.modifiedCount,
                investors: investorResult.modifiedCount,
            }
        });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Superadmin only)
router.delete('/:id', protect, async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') {
            return res.status(401).json({ message: 'Only superadmin can delete users' });
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

module.exports = router;
