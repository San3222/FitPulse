const express = require('express');
const router = express.Router();
const BodyMetric = require('../models/BodyMetric');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/bodymetrics - full history, oldest to newest
router.get('/', auth, async (req, res) => {
    try {
        const entries = await BodyMetric.find({ user: req.user._id }).sort({ date: 1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching body metrics' });
    }
});

// GET /api/bodymetrics/latest - most recent entry
router.get('/latest', auth, async (req, res) => {
    try {
        const entry = await BodyMetric.findOne({ user: req.user._id }).sort({ date: -1 });
        res.json(entry || null);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching latest body metric' });
    }
});

// POST /api/bodymetrics - add a new entry (also syncs latest weight onto User profile)
router.post('/', auth, async (req, res) => {
    try {
        const { weight, bodyFat, measurements, photoUrl, notes, date } = req.body;

        const entry = new BodyMetric({
            user: req.user._id,
            date: date ? new Date(date) : new Date(),
            weight, bodyFat, measurements, photoUrl, notes
        });
        await entry.save();

        if (weight) {
            await User.findByIdAndUpdate(req.user._id, { weight });
        }

        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ message: 'Error adding body metric entry' });
    }
});

// DELETE /api/bodymetrics/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        await BodyMetric.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ message: 'Entry deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting entry' });
    }
});

module.exports = router;