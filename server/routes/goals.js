const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

// GET /api/goals - all goals for the user (active first)
router.get('/', auth, async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user._id }).sort({ status: 1, createdAt: -1 });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching goals' });
    }
});

// POST /api/goals - create a new goal
router.post('/', auth, async (req, res) => {
    try {
        const { title, type, startValue, currentValue, targetValue, unit, deadline } = req.body;
        const goal = new Goal({
            user: req.user._id,
            title,
            type,
            startValue: startValue || 0,
            currentValue: currentValue ?? startValue ?? 0,
            targetValue,
            unit,
            deadline
        });
        await goal.save();
        res.status(201).json(goal);
    } catch (err) {
        res.status(500).json({ message: 'Error creating goal' });
    }
});

// PUT /api/goals/:id - update progress or details
router.put('/:id', auth, async (req, res) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });

        const updatable = ['title', 'currentValue', 'targetValue', 'deadline', 'status'];
        updatable.forEach(field => {
            if (req.body[field] !== undefined) goal[field] = req.body[field];
        });

        // Auto-complete when target reached
        if (goal.status === 'active') {
            const reached = goal.targetValue >= goal.startValue
                ? goal.currentValue >= goal.targetValue
                : goal.currentValue <= goal.targetValue;
            if (reached) goal.status = 'completed';
        }

        await goal.save();
        res.json(goal);
    } catch (err) {
        res.status(500).json({ message: 'Error updating goal' });
    }
});

// DELETE /api/goals/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ message: 'Goal deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting goal' });
    }
});

module.exports = router;