const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    try {
        const { email, firstName, surname, phoneNumber, password, role, referredByEmail, gender, religion, state } = req.body;

        if (!email || !firstName || !surname || !phoneNumber || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Resolve account officer from referral email (must be active staff, not an investor)
        let accountOfficerId = null;
        let resolvedReferredEmail = null;
        if (referredByEmail && referredByEmail.trim() !== '') {
            const cleanEmail = referredByEmail.trim().toLowerCase();
            if (cleanEmail !== email.trim().toLowerCase()) {
                const referringStaff = await User.findOne({
                    email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') },
                    role: { $ne: 'investor' },
                    isActive: true,
                });
                if (referringStaff) {
                    accountOfficerId = referringStaff._id;
                    resolvedReferredEmail = cleanEmail;
                }
                // If no matching staff found, we still save the email they entered but don't assign an officer
                if (!referringStaff) {
                    resolvedReferredEmail = cleanEmail;
                }
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            email,
            firstName,
            surname,
            phoneNumber,
            password: hashedPassword,
            role: role || 'investor',
            referredByEmail: resolvedReferredEmail,
            accountOfficer: accountOfficerId,
            gender: gender || undefined,
            religion: religion || undefined,
            state: state || undefined,
        });

        if (user) {
            // Populate accountOfficer for the response
            const populatedUser = await User.findById(user._id)
                .select('-password')
                .populate('accountOfficer', 'firstName surname email phoneNumber role');

            res.status(201).json({
                _id: populatedUser.id,
                email: populatedUser.email,
                firstName: populatedUser.firstName,
                surname: populatedUser.surname,
                role: populatedUser.role,
                accountOfficer: populatedUser.accountOfficer,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate a user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).populate('accountOfficer', 'firstName surname email phoneNumber role');

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isActive) {
                return res.status(403).json({ message: 'Account is suspended. Please contact admin.' });
            }

            res.json({
                _id: user.id,
                email: user.email,
                firstName: user.firstName,
                surname: user.surname,
                role: user.role,
                accountOfficer: user.accountOfficer,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

module.exports = router;

