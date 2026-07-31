const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Investment = require('../models/Investment');
const InvestmentProduct = require('../models/InvestmentProduct');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { sendEmail, templates, baseTemplate, generateReceiptHTML, generateCertificateHTML } = require('../services/emailService');
const {
    notifyNewInvestmentInitiation,
    notifyInvestmentApproval,
    notifyReceiptUpload,
    notifyLiquidationRequest
} = require('../services/activityNotificationService');

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage: multer.memoryStorage() });

const uploadBufferToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'livingvine', allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'] },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        Readable.from(buffer).pipe(stream);
    });
};

// @route   GET /api/investments/verify-identity
// @desc    Verify NIN or BVN using local db.json records
// @access  Private
router.get('/verify-identity', protect, async (req, res) => {
    try {
        const { type, number } = req.query;
        if (!type || !number) {
            return res.status(400).json({ message: 'Type (nin or bvn) and identity number are required.' });
        }

        const dbPath = path.join(__dirname, '../data/db.json');
        if (!fs.existsSync(dbPath)) {
            return res.status(500).json({ message: 'Identity validation registry not found on server.' });
        }

        const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        let record = null;

        if (type.toLowerCase() === 'nin') {
            record = dbContent.nins && dbContent.nins[number];
        } else if (type.toLowerCase() === 'bvn') {
            record = dbContent.bvns && dbContent.bvns[number];
        } else {
            return res.status(400).json({ message: 'Invalid identity type. Must be "nin" or "bvn".' });
        }

        if (!record) {
            return res.status(404).json({ message: 'Invalid NIN/BVN. Identity verification failed.' });
        }

        res.json(record);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   POST /api/investments
// @desc    Create a new investment
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            name, email, contactAddress, phoneNumber, amountToInvest,
            durationInMonths, principalActionAfterMaturity, nin, bvn,
            accountDetails, nextOfKin, date, productId, roiPercent
        } = req.body;

        // Resolve product details (name + ROI %) from the selected product
        let actualRoiPercent = roiPercent || 24;
        let actualProductName = 'Investment Plan';
        if (productId) {
            const product = await InvestmentProduct.findById(productId);
            if (product) {
                actualRoiPercent = product.roiPercent;
                actualProductName = product.name || actualProductName;
            }
        }
        
        const expectedROI = amountToInvest * (1 + (actualRoiPercent / 100));

        const investment = await Investment.create({
            user: req.user._id,
            name, email, contactAddress, phoneNumber, amountToInvest,
            durationInMonths, principalActionAfterMaturity, nin, bvn,
            accountDetails, nextOfKin,
            startDate: date ? new Date(date) : new Date(),
            expectedROI,
            productName: actualProductName,
            roiPercent: actualRoiPercent,
            status: 'reviewing'
        });

        // Persist NIN to user profile for future investment auto-fill (first time only)
        const User = require('../models/User');
        const userDoc = await User.findById(req.user._id);
        if (userDoc && nin && !userDoc.nin) {
            userDoc.nin = nin;
            await userDoc.save();
        }

        // Send Activity Alert email to administrators (non-blocking)
        notifyNewInvestmentInitiation(investment, req.user).catch(err => console.error('New investment activity alert error:', err));

        res.status(201).json(investment);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});


// @route   GET /api/investments/my
// @desc    Get logged in user investments
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const investments = await Investment.find({ user: req.user._id }).sort('-createdAt');
        res.json(investments);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   GET /api/investments/my-last
// @desc    Get the most recent investment for the current investor (for NOK + bank reuse)
// @access  Private
router.get('/my-last', protect, async (req, res) => {
    try {
        const investment = await Investment.findOne({ user: req.user._id })
            .sort('-createdAt')
            .select('nextOfKin accountDetails');
        if (!investment) return res.status(404).json({ message: 'No previous investments found.' });
        res.json({
            nextOfKin: investment.nextOfKin || null,
            accountDetails: investment.accountDetails || null,
        });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});


// @route   GET /api/investments
// @desc    Get all investments (management / ceo)
// @access  Private/Admin
router.get('/', protect, authorize('management', 'ceo', 'superadmin'), async (req, res) => {
    try {
        const investments = await Investment.find({}).populate('user', 'id firstName surname email').sort('-createdAt');
        res.json(investments);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   GET /api/investments/:id
// @desc    Get investment by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const investment = await Investment.findById(req.params.id).populate('user', 'id firstName surname email');
        if (investment) {
            res.json(investment);
        } else {
            res.status(404).json({ message: 'Investment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   PUT /api/investments/:id/status
// @desc    Update investment status
// @access  CEO/Superadmin for approvals; Management for review-level updates only
router.put('/:id/status', protect, authorize('management', 'ceo', 'superadmin'), async (req, res) => {
    try {
        const { status, companyAccountId } = req.body;
        const isCEO = req.hasRole('ceo', 'superadmin', 'management');
        const isManager = req.hasRole('management');

        // Management can now approve, decline or liquidate — same as CEO
        const ceoOnlyStatuses = ['approved', 'declined', 'liquidated'];
        if (!isCEO && ceoOnlyStatuses.includes(status)) {
            return res.status(403).json({
                message: 'Only the CEO can approve, decline, or liquidate investments.'
            });
        }

        // Managers activating — must have a payment receipt
        if (isManager && status === 'active') {
            const inv = await Investment.findById(req.params.id);
            if (!inv) return res.status(404).json({ message: 'Investment not found' });
            if (!inv.paymentReceipt) {
                return res.status(400).json({ message: 'Cannot start investment: investor has not uploaded a payment receipt yet.' });
            }
        }

        const investment = await Investment.findById(req.params.id);
        if (!investment) return res.status(404).json({ message: 'Investment not found' });
        const wasActive = investment.status === 'active';
        investment.status = status || investment.status;

        // Save selected company bank account (the account investor should pay into)
        let selectedAccountId = companyAccountId || (investment.ceoPaymentAccount && investment.ceoPaymentAccount.accountId);
        if (isCEO && companyAccountId) {
            const BankAccount = require('../models/BankAccount');
            const account = await BankAccount.findById(companyAccountId);
            if (account) {
                investment.ceoPaymentAccount = {
                    bankName:      account.bankName,
                    accountNumber: account.accountNumber,
                    accountName:   account.accountName,
                    accountId:     account._id,
                };
                selectedAccountId = account._id;
            }
        }

        // Auto-credit company bank account if transitioning to active
        if (status === 'active' && !wasActive && selectedAccountId) {
            try {
                const BankAccount = require('../models/BankAccount');
                const account = await BankAccount.findById(selectedAccountId);
                if (account) {
                    account.balance += parseFloat(investment.amountToInvest || 0);
                    account.transactions.push({
                        type: 'credit',
                        amount: parseFloat(investment.amountToInvest || 0),
                        description: `Investment payment received from ${investment.name}`,
                        reference: investment._id.toString(),
                        performedBy: req.user._id
                    });
                    await account.save();
                }
            } catch (err) {
                console.error('Error auto-crediting bank account:', err);
            }
        }

        // Set startDate, approvedAt, liquidatedAt timestamps
        if (status === 'active' && !wasActive) {
            investment.startDate = new Date();
        }
        if ((status === 'approved' || status === 'active') && !investment.approvedAt) {
            investment.approvedAt = new Date();
        }
        if (status === 'liquidated' && !investment.liquidatedAt) {
            investment.liquidatedAt = new Date();
        }

        const updatedInvestment = await investment.save();

        // Create notification for the investor
        try {
            const Notification = require('../models/Notification');
            const User = require('../models/User');
            const statusMessages = {
                approved:   'Your investment has been approved! Please proceed with payment to the provided account.',
                declined:   'Your investment application has been declined. Contact your account officer for details.',
                active:     'Your investment is now active and generating returns.',
                liquidated: 'Your investment has been liquidated. Returns have been processed.',
                retreated:  'Your investment has been marked as retreated.',
            };
            if (statusMessages[status]) {
                await Notification.create({
                    userId:  investment.user,
                    title:   `Investment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                    message: statusMessages[status],
                });
            }

            // Send email notification to investor
            const investorUser = await User.findById(investment.user).select('email firstName surname');
            if (investorUser) {
                const WebsiteSetting = require('../models/WebsiteSetting');
                const settings = await WebsiteSetting.findOne() || {};

                const investorData = {
                    name: investment.name || `${investorUser.firstName} ${investorUser.surname}`,
                    amountToInvest: investment.amountToInvest,
                    durationInMonths: investment.durationInMonths,
                    expectedROI: investment.expectedROI,
                    startDate: investment.startDate,
                    maturityDate: investment.startDate
                        ? new Date(new Date(investment.startDate).setMonth(new Date(investment.startDate).getMonth() + (investment.durationInMonths || 0))).toLocaleDateString('en-NG', { year:'numeric', month:'long', day:'numeric' })
                        : 'See portal',
                };

                if (status === 'approved') {
                    const receiptHtml = generateReceiptHTML(investment, settings);
                    const certHtml = generateCertificateHTML(investment, settings);
                    
                    (async () => {
                        try {
                            const { htmlToPdfBuffer } = require('../services/emailService');
                            const receiptPdf = await htmlToPdfBuffer(receiptHtml, { landscape: false });
                            const certPdf = await htmlToPdfBuffer(certHtml, { landscape: true });
                            
                            await sendEmail(
                                investorUser.email,
                                'Your Investment Has Been Approved — LIVING VINE PROPERTIES INVESTMENT LIMITED',
                                templates.investmentApproved(investorData),
                                [
                                    { filename: 'LVP-Receipt.pdf', content: receiptPdf },
                                    { filename: 'LVP-Certificate.pdf', content: certPdf }
                                ]
                            );
                        } catch (pdfErr) {
                            console.error('Failed to generate PDF attachments:', pdfErr);
                            // Send approval email without attachments if PDF fails, but do not send HTML attachments
                            await sendEmail(
                                investorUser.email,
                                'Your Investment Has Been Approved — LIVING VINE PROPERTIES INVESTMENT LIMITED',
                                templates.investmentApproved(investorData)
                            );
                        }
                    })().catch(err => console.error('Investment approval email error:', err));
                    
                } else if (status === 'active') {
                    const certHtml = generateCertificateHTML(investment, settings);
                    
                    (async () => {
                        try {
                            const { htmlToPdfBuffer } = require('../services/emailService');
                            const certPdf = await htmlToPdfBuffer(certHtml, { landscape: true });
                            
                            await sendEmail(
                                investorUser.email,
                                'Your Investment is Now Active — LIVING VINE PROPERTIES INVESTMENT LIMITED',
                                templates.investmentActive(investorData),
                                [
                                    { filename: 'LVP-Certificate.pdf', content: certPdf }
                                ]
                            );
                        } catch (pdfErr) {
                            console.error('Failed to generate PDF attachment:', pdfErr);
                            // Send active email without attachments if PDF fails, but do not send HTML attachments
                            await sendEmail(
                                investorUser.email,
                                'Your Investment is Now Active — LIVING VINE PROPERTIES INVESTMENT LIMITED',
                                templates.investmentActive(investorData)
                            );
                        }
                    })().catch(err => console.error('Investment active email error:', err));
                }
            }
        } catch (_) { /* non-blocking */ }

        // Send Activity Alert email to administrators (non-blocking)
        try {
            if (['approved', 'active'].includes(status)) {
                notifyInvestmentApproval(updatedInvestment, req.user, status).catch(err => console.error('Approval activity alert error:', err));
            } else if (status === 'liquidated') {
                notifyLiquidationRequest(updatedInvestment, req.user).catch(err => console.error('Liquidation activity alert error:', err));
            }
        } catch (_) { /* non-blocking */ }

        res.json(updatedInvestment);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   PUT /api/investments/:id/duration
// @desc    Management edits investment duration
// @access  Private (management / ceo / superadmin)
router.put('/:id/duration', protect, authorize('management', 'ceo', 'superadmin'), async (req, res) => {
    try {
        const { durationInMonths } = req.body;
        if (!durationInMonths || isNaN(durationInMonths) || Number(durationInMonths) < 1) {
            return res.status(400).json({ message: 'A valid duration (months) is required.' });
        }

        const investment = await Investment.findById(req.params.id);
        if (!investment) return res.status(404).json({ message: 'Investment not found.' });

        investment.durationInMonths = Number(durationInMonths);
        const updated = await investment.save();

        // Notify investor of duration change
        try {
            const Notification = require('../models/Notification');
            await Notification.create({
                userId: investment.user,
                title: 'Investment Duration Updated',
                message: `Your investment duration has been updated to ${durationInMonths} months.`,
            });
        } catch (_) { /* non-blocking */ }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   POST /api/investments/:id/send-documents
// @desc    Manager sends receipt/certificate email to investor
// @access  Private (management / ceo / superadmin)
router.post('/:id/send-documents', protect, authorize('management', 'ceo', 'superadmin'), async (req, res) => {
    try {
        const investment = await Investment.findById(req.params.id).populate('user', 'email firstName surname');
        if (!investment) return res.status(404).json({ message: 'Investment not found.' });

        const investorName = investment.name || `${investment.user.firstName} ${investment.user.surname}`;
        const receiptNo = `LVP-${investment._id.toString().slice(-6).toUpperCase()}`;
        const certNo    = `LVP-CERT-${investment._id.toString().slice(-6).toUpperCase()}`;
        const maturity  = investment.startDate
            ? new Date(new Date(investment.startDate).setMonth(new Date(investment.startDate).getMonth() + (investment.durationInMonths || 0)))
                .toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
            : 'See investor portal';
        const fmtAmt    = (n) => `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

        const html = baseTemplate(`
            <div style="text-align:center; padding: 20px 0 10px;">
                <div style="font-size:40px; margin-bottom:8px;">📄</div>
                <h2 style="color:#1a1a1a; font-size:22px; font-weight:800; margin:0;">Your Investment Documents</h2>
                <p style="color:#888; font-size:13px; margin-top:4px;">Official receipt and certificate are ready for download</p>
            </div>

            <p style="color:#444; font-size:14px; line-height:1.7; margin-bottom:20px;">
                Dear <strong>${investorName}</strong>,<br/>
                We are pleased to confirm that your investment has been processed. 
                Please find your official investment details below. You can also download your 
                <strong>Receipt</strong> and <strong>Certificate of Investment</strong> directly from your investor portal.
            </p>

            <div style="background:linear-gradient(135deg,#de1f25,#b0181d); border-radius:16px; padding:24px; margin-bottom:20px; color:white; text-align:center;">
                <div style="font-size:11px; text-transform:uppercase; letter-spacing:2px; opacity:0.8; margin-bottom:4px;">Principal Investment</div>
                <div style="font-size:36px; font-weight:900; margin-bottom:4px;">${fmtAmt(investment.amountToInvest)}</div>
                <div style="font-size:13px; opacity:0.9;">Expected Return: <strong>${fmtAmt(investment.expectedROI)}</strong></div>
            </div>

            <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
                ${[
                    ['Receipt Number', receiptNo],
                    ['Certificate Number', certNo],
                    ['Duration', `${investment.durationInMonths || '—'} months`],
                    ['Start Date', investment.startDate ? new Date(investment.startDate).toLocaleDateString('en-NG', { year:'numeric', month:'long', day:'numeric' }) : '—'],
                    ['Maturity Date', maturity],
                    ['Status', (investment.status || '').toUpperCase()],
                ].map(([label, value]) => `
                    <tr style="border-bottom:1px solid #f3f4f6;">
                        <td style="padding:10px 12px; font-size:13px; color:#888; font-weight:600;">${label}</td>
                        <td style="padding:10px 12px; font-size:13px; color:#1a1a1a; font-weight:700; text-align:right;">${value}</td>
                    </tr>
                `).join('')}
            </table>

            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:16px; margin-bottom:20px;">
                <p style="margin:0; font-size:13px; color:#166534;">
                    🔒 <strong>Security Notice:</strong> Log in to your investor portal to download official copies of your Receipt and Certificate of Investment. Keep these documents safe.
                </p>
            </div>

            <div style="text-align:center; margin-top:24px;">
                <a href="${process.env.CLIENT_URL || 'https://livingvinepropertiesinvestment.com'}/investor/login" 
                   style="display:inline-block; background:#de1f25; color:white; padding:14px 32px; border-radius:12px; font-weight:700; font-size:14px; text-decoration:none;">
                    View Documents in Portal →
                </a>
            </div>
        `);

        // Load settings and attach documents as PDFs (with HTML fallback)
        const WebsiteSetting = require('../models/WebsiteSetting');
        const settings = await WebsiteSetting.findOne() || {};
        
        const receiptHtml = generateReceiptHTML(investment, settings);
        const certHtml = generateCertificateHTML(investment, settings);

        try {
            const { htmlToPdfBuffer } = require('../services/emailService');
            const receiptPdf = await htmlToPdfBuffer(receiptHtml, { landscape: false });
            const certPdf = await htmlToPdfBuffer(certHtml, { landscape: true });

            await sendEmail(
                investment.user.email,
                `Your Investment Documents — Receipt ${receiptNo}`,
                html,
                [
                    { filename: 'LVP-Receipt.pdf', content: receiptPdf },
                    { filename: 'LVP-Certificate.pdf', content: certPdf }
                ]
            );
        } catch (pdfErr) {
            console.error('Failed to generate PDF attachments:', pdfErr);
            // Send email without attachments if PDF fails, but do not send HTML attachments
            await sendEmail(
                investment.user.email,
                `Your Investment Documents — Receipt ${receiptNo}`,
                html
            );
        }

        res.json({ message: `Documents sent successfully to ${investment.user.email}.` });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});


// @route   PUT /api/investments/:id/receipt
// @desc    Investor uploads payment receipt for their investment
// @access  Private (investor only — must own the investment)
router.put('/:id/receipt', protect, upload.single('receipt'), async (req, res) => {
    try {
        const investment = await Investment.findById(req.params.id);
        if (!investment) return res.status(404).json({ message: 'Investment not found' });

        // Only the investor who owns this investment can attach a receipt
        if (investment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        // Investment must be approved before receipt can be uploaded
        if (investment.status !== 'approved') {
            return res.status(400).json({ message: 'Receipt can only be uploaded for approved investments.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // Upload to Cloudinary
        const result = await uploadBufferToCloudinary(req.file.buffer);
        investment.paymentReceipt = result.secure_url;
        investment.receiptUploadedAt = new Date();

        await investment.save();

        // Notify management/CEO about the receipt
        try {
            const Notification = require('../models/Notification');
            const User = require('../models/User');
            const admins = await User.find({ role: { $in: ['management', 'ceo', 'superadmin'] } }).select('_id');
            await Promise.all(admins.map(admin =>
                Notification.create({
                    userId: admin._id,
                    title: 'Payment Receipt Uploaded',
                    message: `${investment.name} has uploaded a payment receipt for their investment of ₦${investment.amountToInvest?.toLocaleString()}. Please review and start the investment.`,
                })
            ));
        } catch (_) { /* non-blocking */ }

        // Activity Alert email to administrators (non-blocking)
        notifyReceiptUpload(investment, req.user).catch(err => console.error('Receipt upload activity alert error:', err));

        res.json({ message: 'Receipt uploaded successfully.', paymentReceipt: result.secure_url });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// @route   POST /api/investments/trigger-daily-emails
// @desc    Manually trigger daily activities report & daily investor update emails (Management/Superadmin)
// @access  Private
router.post('/trigger-daily-emails', protect, authorize('management', 'ceo', 'superadmin'), async (req, res) => {
    try {
        const { sendDailyActivitiesReport } = require('../services/activityNotificationService');
        const { sendDailyInvestorUpdates } = require('../services/investorDailyUpdateService');

        const activityReportRes = await sendDailyActivitiesReport();
        const investorUpdateRes = await sendDailyInvestorUpdates();

        res.json({
            message: 'Daily emails triggered successfully!',
            activityReport: activityReportRes,
            investorUpdates: investorUpdateRes
        });
    } catch (error) {
        console.error('Trigger daily emails error:', error);
        res.status(500).json({ message: `Failed to trigger daily emails: ${error.message}` });
    }
});

module.exports = router;
