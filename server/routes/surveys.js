const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const { protect, authorize } = require('../middlewares/authMiddleware');

const staffRoles = ['marketing', 'management', 'ceo', 'superadmin'];

// @route   GET /api/surveys/active
// @desc    Get current active survey, indicating if logged in user has already responded
// @access  Private (Investor)
router.get('/active', protect, async (req, res) => {
    try {
        const survey = await Survey.findOne({ isActive: true });
        if (!survey) {
            return res.json({ survey: null, alreadyAnswered: false });
        }

        // Check if user has already responded
        const hasResponded = survey.responses.some(resp => resp.user.toString() === req.user._id.toString());
        
        if (hasResponded) {
            return res.json({ survey: null, alreadyAnswered: true });
        }

        res.json({
            survey: {
                _id: survey._id,
                question: survey.question
            },
            alreadyAnswered: false
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/surveys/response
// @desc    Submit feedback response for active survey
// @access  Private (Investor)
router.post('/response', protect, async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        if (!rating) {
            return res.status(400).json({ message: 'Rating is required' });
        }

        const survey = await Survey.findOne({ isActive: true });
        if (!survey) {
            return res.status(404).json({ message: 'No active survey found to respond to' });
        }

        // Check duplicate response
        const hasResponded = survey.responses.some(resp => resp.user.toString() === req.user._id.toString());
        if (hasResponded) {
            return res.status(400).json({ message: 'You have already submitted a response to this survey' });
        }

        survey.responses.push({
            user: req.user._id,
            userName: `${req.user.firstName} ${req.user.surname}`,
            rating,
            feedback
        });

        await survey.save();
        res.json({ message: 'Thank you for your feedback!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/surveys
// @desc    Create a new survey or update active survey question
// @access  Private (Marketing/Staff)
router.post('/', protect, authorize(...staffRoles), async (req, res) => {
    try {
        const { question, isActive } = req.body;
        if (!question) {
            return res.status(400).json({ message: 'Question is required' });
        }

        // Deactivate all other surveys if this one is going to be active
        if (isActive) {
            await Survey.updateMany({}, { isActive: false });
        }

        const survey = await Survey.create({
            question,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json(survey);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/surveys/responses
// @desc    Get all surveys and responses for dashboard
// @access  Private (Marketing/Staff)
router.get('/responses', protect, authorize(...staffRoles), async (req, res) => {
    try {
        const surveys = await Survey.find().sort({ createdAt: -1 });
        res.json(surveys);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/surveys/:id/toggle
// @desc    Toggle survey active status
// @access  Private (Marketing/Staff)
router.put('/:id/toggle', protect, authorize(...staffRoles), async (req, res) => {
    try {
        const survey = await Survey.findById(req.params.id);
        if (!survey) {
            return res.status(404).json({ message: 'Survey not found' });
        }

        const newStatus = !survey.isActive;
        
        if (newStatus === true) {
            // Deactivate all others first
            await Survey.updateMany({}, { isActive: false });
        }

        survey.isActive = newStatus;
        await survey.save();

        res.json(survey);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/surveys/:id
// @desc    Delete survey
// @access  Private (Marketing/Staff)
router.delete('/:id', protect, authorize(...staffRoles), async (req, res) => {
    try {
        const survey = await Survey.findById(req.params.id);
        if (!survey) {
            return res.status(404).json({ message: 'Survey not found' });
        }
        await survey.deleteOne();
        res.json({ message: 'Survey deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
