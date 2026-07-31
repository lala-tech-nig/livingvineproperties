const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const { notifyWebsiteEditorChanges } = require('../services/activityNotificationService');
const {
    getHeroSlides,
    getServices,
    getProjects,
    getSettings,
    submitInquiry,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    addService,
    updateService,
    deleteService,
    addProject,
    updateProject,
    deleteProject,
    updateSettings,
    getInquiries,
    updateInquiryStatus
} = require('../controllers/websiteController');

// Multer + Cloudinary configuration
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memory storage — avoids multer-storage-cloudinary v1/v2 API mismatch
const upload = multer({ storage: multer.memoryStorage() });

// Helper: stream a buffer to Cloudinary and return the result
const uploadBufferToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'livingvine', allowed_formats: ['jpg', 'png', 'jpeg', 'webp'] },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        Readable.from(buffer).pipe(stream);
    });
};

// --- Protected Manager Content Editing Endpoints ---
const contentAdmins = ['management', 'ceo', 'superadmin'];

const VisitorLog = require('../models/VisitorLog');
const { resolveLocation } = require('../services/activityNotificationService');

// --- Public Endpoints ---
router.get('/hero', getHeroSlides);
router.get('/services', getServices);
router.get('/projects', getProjects);
router.get('/settings', getSettings);
router.post('/inquiries', submitInquiry);

// Public visitor tracking endpoint
router.post('/track-visit', async (req, res) => {
    try {
        const { page } = req.body || {};
        const location = resolveLocation(req, null);
        const clientCity = req.headers['x-client-city'] || req.headers['cf-ipcity'] || null;
        const clientCountry = req.headers['x-client-country'] || req.headers['cf-ipcountry'] || null;
        let ip = 'Unknown';
        if (req.headers['x-forwarded-for']) {
            ip = req.headers['x-forwarded-for'].split(',')[0].trim();
        } else if (req.socket?.remoteAddress) {
            ip = req.socket.remoteAddress;
        }

        await VisitorLog.create({
            ip,
            city: clientCity,
            country: clientCountry,
            location,
            userAgent: req.headers['user-agent'] || 'Unknown',
            page: page || '/'
        });

        res.json({ status: 'ok' });
    } catch (err) {
        // Non-blocking for frontend
        res.json({ status: 'error', message: err.message });
    }
});

// Upload Endpoint (multipart form)
router.post('/upload', protect, authorize(...contentAdmins), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const result = await uploadBufferToCloudinary(req.file.buffer);
        if (req.user) {
            notifyWebsiteEditorChanges(req, req.user, 'Website Media Uploads', 'Uploaded Asset File', { url: result.secure_url }).catch(err => console.error('Upload activity alert error:', err));
        }
        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Upload Endpoint (base64) — used by website-content editor for team photos etc.
router.post('/upload-image', protect, authorize(...contentAdmins), async (req, res) => {
    try {
        const { imageBase64, folder } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ message: 'No image data provided.' });
        }
        const uploadFolder = folder ? `livingvine/${folder}` : 'livingvine';
        const result = await cloudinary.uploader.upload(imageBase64, {
            folder: uploadFolder,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
        });
        if (req.user) {
            notifyWebsiteEditorChanges(req, req.user, 'Website Media Uploads', 'Uploaded Base64 Asset Image', { url: result.secure_url, folder: uploadFolder }).catch(err => console.error('Upload activity alert error:', err));
        }
        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('Cloudinary base64 upload error:', error);
        res.status(500).json({ message: error.message });
    }
});


router.route('/hero')
    .post(protect, authorize(...contentAdmins), addHeroSlide);
router.route('/hero/:id')
    .put(protect, authorize(...contentAdmins), updateHeroSlide)
    .delete(protect, authorize(...contentAdmins), deleteHeroSlide);

router.route('/services')
    .post(protect, authorize(...contentAdmins), addService);
router.route('/services/:id')
    .put(protect, authorize(...contentAdmins), updateService)
    .delete(protect, authorize(...contentAdmins), deleteService);

router.route('/projects')
    .post(protect, authorize(...contentAdmins), addProject);
router.route('/projects/:id')
    .put(protect, authorize(...contentAdmins), updateProject)
    .delete(protect, authorize(...contentAdmins), deleteProject);

router.route('/settings')
    .put(protect, authorize(...contentAdmins), updateSettings);

// --- Protected Inquiries Browsing Endpoints ---
const allStaff = ['sales', 'marketing', 'hr', 'management', 'ceo', 'superadmin'];

router.route('/inquiries')
    .get(protect, authorize(...allStaff), getInquiries);
router.route('/inquiries/:id')
    .patch(protect, authorize(...allStaff), updateInquiryStatus);

module.exports = router;
