const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail, templates } = require('../services/emailService');
const { protect } = require('../middlewares/authMiddleware');
const {
    notifyInvestorLogin,
    notifyStaffLogin,
    notifyManagerLogin,
    notifyPasswordActivity
} = require('../services/activityNotificationService');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Generate a 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Strong password validation
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('At least one number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) errors.push('At least one special character (!@#$%^&* etc.)');
    return errors;
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    try {
        const {
            email, firstName, surname, phoneNumber, password,
            role, referredByEmail, gender, religion, state, acceptedTerms
        } = req.body;

        if (!email || !firstName || !surname || !phoneNumber || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Terms & Conditions must be accepted for investors
        if ((!role || role === 'investor') && !acceptedTerms) {
            return res.status(400).json({ message: 'You must accept the Terms and Conditions to register.' });
        }

        // Strong password validation
        const pwErrors = validatePassword(password);
        if (pwErrors.length > 0) {
            return res.status(400).json({ message: `Password too weak: ${pwErrors.join(', ')}.` });
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
                if (!referringStaff) {
                    resolvedReferredEmail = cleanEmail;
                }
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate email OTP
        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

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
            isEmailVerified: false,
            emailOtp: otp,
            emailOtpExpiry: otpExpiry,
        });

        // Send OTP email (non-blocking)
        sendEmail(
            email,
            `Verify your email — ${process.env.EMAIL_FROM_NAME || 'LIVING VINE PROPERTIES INVESTMENT LIMITED'}`,
            templates.emailVerificationOtp(`${firstName} ${surname}`, otp)
        ).catch(err => console.error('OTP email error:', err));

        res.status(201).json({
            message: 'Registration successful! Please check your email for the verification OTP.',
            email: user.email,
            firstName: user.firstName,
        });

    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with OTP
router.post('/verify-email', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email is already verified. Please login.' });
        }

        if (!user.emailOtp || user.emailOtp !== otp.trim()) {
            return res.status(400).json({ message: 'Invalid OTP. Please check your email or request a new code.' });
        }

        if (new Date() > user.emailOtpExpiry) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        user.isEmailVerified = true;
        user.emailOtp = null;
        user.emailOtpExpiry = null;
        await user.save();

        res.json({ message: 'Email verified successfully! You can now login.' });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP to email
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified.' });

        const otp = generateOtp();
        user.emailOtp = otp;
        user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendEmail(
            email,
            `Your new verification OTP — LIVING VINE PROPERTIES INVESTMENT LIMITED`,
            templates.emailVerificationOtp(`${user.firstName} ${user.surname}`, otp)
        );

        res.json({ message: 'A new OTP has been sent to your email.' });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate a user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Case-insensitive email lookup
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } })
            .populate('accountOfficer', 'firstName surname email phoneNumber role');

        if (!user) {
            console.warn(`[Login] No account found for email: ${email}`);
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.warn(`[Login] Wrong password for: ${user.email}`);
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is suspended. Please contact admin.' });
        }

        // For investor accounts, require email verification
        if (user.role === 'investor' && !user.isEmailVerified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in.',
                requiresVerification: true,
                email: user.email,
            });
        }

        // Send login notification email to user (non-blocking)
        try {
            const userAgent = req.headers['user-agent'] || 'Unknown Browser';
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
            const time = new Date().toLocaleString('en-NG', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
            });
            sendEmail(
                user.email,
                'New login to your LIVING VINE PROPERTIES INVESTMENT LIMITED account',
                templates.loginNotification(`${user.firstName} ${user.surname}`, userAgent, ip, time, 'Nigeria')
            ).catch(err => console.error('Login notification email error:', err));
        } catch (_) { /* non-blocking */ }

        // Send activity notification email to administrators (non-blocking)
        try {
            const rolesList = [user.role, ...(Array.isArray(user.roles) ? user.roles : [])];
            const isManager = rolesList.some(r => ['superadmin', 'ceo', 'management'].includes(r));
            const isStaff = !isManager && rolesList.some(r => ['sales', 'marketing', 'hr'].includes(r));

            if (isManager) {
                notifyManagerLogin(req, user).catch(err => console.error('Manager login activity alert error:', err));
            } else if (isStaff) {
                notifyStaffLogin(req, user).catch(err => console.error('Staff login activity alert error:', err));
            } else {
                notifyInvestorLogin(req, user).catch(err => console.error('Investor login activity alert error:', err));
            }
        } catch (_) { /* non-blocking */ }

        // Build the full list of roles this user has access to
        // Combine primary role + any extra roles assigned, deduplicated
        const primaryRole = user.role;
        const extraRoles = Array.isArray(user.roles) ? user.roles : [];
        const allRoles = [...new Set([primaryRole, ...extraRoles])];

        // Staff roles that can use the management/CRM portal
        const staffRoles = ['sales', 'marketing', 'hr', 'management', 'ceo', 'superadmin'];
        const userStaffRoles = allRoles.filter(r => staffRoles.includes(r));

        // If user has more than one staff role, require them to pick a dashboard
        const requiresRoleSelection = userStaffRoles.length > 1;

        res.json({
            _id: user.id,
            email: user.email,
            firstName: user.firstName,
            surname: user.surname,
            role: user.role,
            roles: allRoles,
            requiresRoleSelection,
            accountOfficer: user.accountOfficer,
            profileImage: user.profileImage || null,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset link to email
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });

        const user = await User.findOne({ email });
        // Always return 200 to prevent email enumeration
        if (!user) {
            return res.json({ message: 'If that email exists, a reset link has been sent.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = resetToken;
        user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const resetLink = `${clientUrl}/investor/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        await sendEmail(
            email,
            'Reset your LIVING VINE PROPERTIES INVESTMENT LIMITED password',
            templates.passwordResetEmail(`${user.firstName} ${user.surname}`, resetLink)
        );

        // Activity Notification alert
        notifyPasswordActivity(req, user, 'Password Recovery Requested').catch(err => console.error('Forgot password activity email error:', err));

        res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
router.post('/reset-password', async (req, res) => {
    try {
        const { email, token, password } = req.body;
        if (!email || !token || !password) {
            return res.status(400).json({ message: 'Email, token, and new password are required.' });
        }

        // Strong password validation
        const pwErrors = validatePassword(password);
        if (pwErrors.length > 0) {
            return res.status(400).json({ message: `Password too weak: ${pwErrors.join(', ')}.` });
        }

        const user = await User.findOne({ email, passwordResetToken: token });
        if (!user) return res.status(400).json({ message: 'Invalid or expired reset link.' });

        if (new Date() > user.passwordResetExpiry) {
            return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.passwordResetToken = null;
        user.passwordResetExpiry = null;
        await user.save();

        // Activity Notification alert
        notifyPasswordActivity(req, user, 'Password Reset Completed').catch(err => console.error('Reset password activity email error:', err));

        res.json({ message: 'Password reset successful! You can now login with your new password.' });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   POST /api/auth/change-password
// @desc    Change password while logged in
// @access  Private
router.post('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required.' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(401).json({ message: 'Incorrect current password.' });

        const pwErrors = validatePassword(newPassword);
        if (pwErrors.length > 0) {
            return res.status(400).json({ message: `New password too weak: ${pwErrors.join(', ')}.` });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        // Activity Notification alert
        notifyPasswordActivity(req, user, 'Password Changed').catch(err => console.error('Change password activity email error:', err));

        res.json({ message: 'Password changed successfully.' });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   POST /api/auth/admin/verify-all-investors
// @desc    One-time admin fix: mark all existing investors as email-verified
//          Use when investors were created before email verification was enforced
router.post('/admin/verify-all-investors', async (req, res) => {
    try {
        const { adminSecret } = req.body;
        if (adminSecret !== process.env.JWT_SECRET) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const result = await User.updateMany(
            { role: 'investor', isEmailVerified: false },
            { $set: { isEmailVerified: true } }
        );
        res.json({ message: `Marked ${result.modifiedCount} investor(s) as email-verified.` });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

module.exports = router;
