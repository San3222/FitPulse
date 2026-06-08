const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const Progress = require('../models/Progress');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/workouts - Get all workouts for user
router.get('/', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id })
      .sort({ scheduledDate: 1 });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching workouts' });
  }
});

// GET /api/workouts/upcoming - Get upcoming workouts
router.get('/upcoming', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({
      user: req.user._id,
      status: 'scheduled',
      scheduledDate: { $gte: new Date() }
    }).sort({ scheduledDate: 1 }).limit(5);
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching upcoming workouts' });
  }
});

// POST /api/workouts - Create new workout
router.post('/', auth, async (req, res) => {
  try {
    const workout = new Workout({
      user: req.user._id,
      ...req.body
    });
    await workout.save();
    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ message: 'Error creating workout' });
  }
});

// PUT /api/workouts/:id/complete - Complete a workout
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const { calories, steps, heartRate, laps, duration } = req.body;
    
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
    if (!workout) return res.status(404).json({ message: 'Workout not found' });

    workout.status = 'completed';
    workout.calories = calories || 0;
    workout.steps = steps || 0;
    workout.heartRate = heartRate || 0;
    workout.laps = laps || [];
    workout.duration = duration || workout.duration;
    workout.completedAt = new Date();
    
    await workout.save();

    // Update or create progress for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = days[today.getDay()];

    let progress = await Progress.findOne({ user: req.user._id, date: today });
    if (!progress) {
      progress = new Progress({ user: req.user._id, date: today, dayOfWeek });
    }
    progress.totalCalories += calories || 0;
    progress.totalSteps += steps || 0;
    progress.totalDuration += duration || 0;
    progress.workoutsCompleted += 1;
    progress.pointsEarned += workout.points;
    await progress.save();

    // Update user total points
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalPoints: workout.points }
    });

    res.json(workout);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error completing workout' });
  }
});

// DELETE /api/workouts/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting workout' });
  }
});

module.exports = router;
