const mongoose = require('mongoose');

const foodLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        default: 'snack'
    },
    foodName: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: 'serving' },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 }, // grams
    carbs: { type: Number, default: 0 },   // grams
    fats: { type: Number, default: 0 }     // grams
}, { timestamps: true });

foodLogSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('FoodLog', foodLogSchema);