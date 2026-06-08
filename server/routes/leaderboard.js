const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

// GET /api/leaderboard/weekly
router.get('/weekly', auth, async (req, res) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyProgress = await Progress.aggregate([
      { $match: { date: { $gte: startOfWeek } } },
      { $group: { _id: '$user', weeklyPoints: { $sum: '$pointsEarned' }, weeklySteps: { $sum: '$totalSteps' }, weeklyCalories: { $sum: '$totalCalories' } } },
      { $sort: { weeklyPoints: -1 } },
      { $limit: 10 }
    ]);

    const populated = await User.populate(weeklyProgress, { path: '_id', select: 'name avatar' });
    
    const leaderboard = populated.map((entry, idx) => ({
      rank: idx + 1,
      user: entry._id,
      points: entry.weeklyPoints,
      steps: entry.weeklySteps,
      calories: entry.weeklyCalories
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// GET /api/leaderboard/all-time
router.get('/all-time', auth, async (req, res) => {
  try {
    const users = await User.find({})
      .select('name avatar totalPoints')
      .sort({ totalPoints: -1 })
      .limit(10);

    const leaderboard = users.map((user, idx) => ({
      rank: idx + 1,
      user: { _id: user._id, name: user.name, avatar: user.avatar },
      points: user.totalPoints
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching all-time leaderboard' });
  }
});

module.exports = router;
