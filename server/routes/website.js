const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
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

// --- Public Endpoints ---
router.get('/hero', getHeroSlides);
router.get('/services', getServices);
router.get('/projects', getProjects);
router.get('/settings', getSettings);
router.post('/inquiries', submitInquiry);

// --- Protected Manager Content Editing Endpoints ---
// Only Manager (management), CEO (ceo), and Super Admin (superadmin) can edit content
const contentAdmins = ['management', 'ceo', 'superadmin'];

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
// All staff members can read and archive inquiries (for sales/marketing/mgt)
const allStaff = ['sales', 'marketing', 'hr', 'management', 'ceo', 'superadmin'];

router.route('/inquiries')
    .get(protect, authorize(...allStaff), getInquiries);
router.route('/inquiries/:id')
    .patch(protect, authorize(...allStaff), updateInquiryStatus);

module.exports = router;
