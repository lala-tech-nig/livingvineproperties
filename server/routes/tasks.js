const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middlewares/authMiddleware');

// @route   GET /api/tasks
// @desc    Get all tasks for the logged in user
router.get('/', protect, async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user.id });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/tasks
// @desc    Create a new task
router.post('/', protect, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            assignedTo: req.user.id
        });
        const savedTask = await task.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   PUT /api/tasks/:id
// @desc    Update task status (for Kanban)
router.put('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        
        // Ensure user owns task or is manager/admin
        if (task.assignedTo.toString() !== req.user.id && !['management', 'ceo', 'superadmin'].includes(req.user.role)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
