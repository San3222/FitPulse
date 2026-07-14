const express = require('express');
const router = express.Router();
const FoodLog = require('../models/FoodLog');
const WaterLog = require('../models/WaterLog');
const auth = require('../middleware/auth');

const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
};

const GOAL_ADJUSTMENT = {
    lose_weight: -500,
    maintain: 0,
    gain_muscle: 300,
    endurance: 200
};

function dayRange(dateStr) {
    const start = dateStr ? new Date(dateStr) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

// Compute BMR (Mifflin-St Jeor), TDEE, calorie goal and macro targets from user profile
function computeTargets(user) {
    const { age, gender, height, weight, activityLevel, goal } = user;

    if (!age || !gender || !height || !weight) {
        return { profileComplete: false };
    }

    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === 'female') {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 78;
    }

    const tdee = bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55);
    const calorieGoal = Math.round(tdee + (GOAL_ADJUSTMENT[goal] ?? 0));

    // Protein: higher for weight loss / muscle gain
    const proteinPerKg = (goal === 'lose_weight' || goal === 'gain_muscle') ? 1.8 : 1.2;
    const proteinG = Math.round(weight * proteinPerKg);
    const proteinCals = proteinG * 4;

    const fatCals = Math.round(calorieGoal * 0.25);
    const fatG = Math.round(fatCals / 9);

    const carbCals = Math.max(calorieGoal - proteinCals - fatCals, 0);
    const carbG = Math.round(carbCals / 4);

    return {
        profileComplete: true,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        calorieGoal,
        macros: { protein: proteinG, carbs: carbG, fats: fatG },
        waterGoalMl: user.dailyWaterGoalMl || 2500
    };
}

// GET /api/nutrition/targets - BMR/TDEE + daily calorie & macro targets
router.get('/targets', auth, async (req, res) => {
    try {
        const targets = computeTargets(req.user);
        res.json(targets);
    } catch (err) {
        res.status(500).json({ message: 'Error computing nutrition targets' });
    }
});

// GET /api/nutrition/logs?date=YYYY-MM-DD - food logs for a given day
router.get('/logs', auth, async (req, res) => {
    try {
        const { start, end } = dayRange(req.query.date);
        const logs = await FoodLog.find({
            user: req.user._id,
            date: { $gte: start, $lte: end }
        }).sort({ createdAt: 1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching food logs' });
    }
});

// POST /api/nutrition/logs - add a food entry
router.post('/logs', auth, async (req, res) => {
    try {
        const { mealType, foodName, quantity, unit, calories, protein, carbs, fats, date } = req.body;
        const log = new FoodLog({
            user: req.user._id,
            date: date ? new Date(date) : new Date(),
            mealType, foodName, quantity, unit, calories, protein, carbs, fats
        });
        await log.save();
        res.status(201).json(log);
    } catch (err) {
        res.status(500).json({ message: 'Error adding food log' });
    }
});

// DELETE /api/nutrition/logs/:id
router.delete('/logs/:id', auth, async (req, res) => {
    try {
        await FoodLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ message: 'Food log deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting food log' });
    }
});

// GET /api/nutrition/summary?date=YYYY-MM-DD - totals vs targets for the day
router.get('/summary', auth, async (req, res) => {
    try {
        const { start, end } = dayRange(req.query.date);
        const logs = await FoodLog.find({ user: req.user._id, date: { $gte: start, $lte: end } });

        const consumed = logs.reduce((acc, l) => ({
            calories: acc.calories + (l.calories || 0),
            protein: acc.protein + (l.protein || 0),
            carbs: acc.carbs + (l.carbs || 0),
            fats: acc.fats + (l.fats || 0)
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

        const water = await WaterLog.find({ user: req.user._id, date: { $gte: start, $lte: end } });
        const waterMl = water.reduce((sum, w) => sum + w.amountMl, 0);

        const targets = computeTargets(req.user);

        res.json({ consumed, waterMl, targets, mealsLogged: logs.length });
    } catch (err) {
        res.status(500).json({ message: 'Error building nutrition summary' });
    }
});

// GET /api/nutrition/water?date=YYYY-MM-DD - total water intake for the day
router.get('/water', auth, async (req, res) => {
    try {
        const { start, end } = dayRange(req.query.date);
        const logs = await WaterLog.find({ user: req.user._id, date: { $gte: start, $lte: end } });
        const totalMl = logs.reduce((sum, w) => sum + w.amountMl, 0);
        res.json({ totalMl, goalMl: req.user.dailyWaterGoalMl || 2500, entries: logs.length });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching water logs' });
    }
});

// POST /api/nutrition/water - log a water intake entry (e.g. +250ml)
router.post('/water', auth, async (req, res) => {
    try {
        const { amountMl, date } = req.body;
        const log = new WaterLog({
            user: req.user._id,
            date: date ? new Date(date) : new Date(),
            amountMl
        });
        await log.save();
        res.status(201).json(log);
    } catch (err) {
        res.status(500).json({ message: 'Error logging water' });
    }
});

module.exports = router;