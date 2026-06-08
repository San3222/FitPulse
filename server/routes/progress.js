const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

// GET /api/progress/weekly - Get weekly progress
router.get('/weekly', auth, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const progress = await Progress.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });

    // Build full week with defaults for missing days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekData = days.map(day => {
      const found = progress.find(p => p.dayOfWeek === day);
      return {
        day,
        calories: found ? found.totalCalories : 0,
        steps: found ? found.totalSteps : 0,
        duration: found ? found.totalDuration : 0,
        points: found ? found.pointsEarned : 0,
        workouts: found ? found.workoutsCompleted : 0
      };
    });

    res.json(weekData);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching progress' });
  }
});

// GET /api/progress/stats - Get overall stats
router.get('/stats', auth, async (req, res) => {
  try {
    const allProgress = await Progress.find({ user: req.user._id });
    
    const stats = allProgress.reduce((acc, day) => ({
      totalCalories: acc.totalCalories + day.totalCalories,
      totalSteps: acc.totalSteps + day.totalSteps,
      totalWorkouts: acc.totalWorkouts + day.workoutsCompleted,
      totalDuration: acc.totalDuration + day.totalDuration
    }), { totalCalories: 0, totalSteps: 0, totalWorkouts: 0, totalDuration: 0 });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;
