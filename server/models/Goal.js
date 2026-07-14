const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['weight', 'steps', 'workouts', 'calories', 'water', 'custom'],
        default: 'custom'
    },
    startValue: { type: Number, default: 0 },
    currentValue: { type: Number, default: 0 },
    targetValue: { type: Number, required: true },
    unit: { type: String, default: '' },
    deadline: { type: Date },
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active'
    }
}, { timestamps: true });

// Virtual: progress percentage toward goal
goalSchema.virtual('progressPercent').get(function () {
    const span = this.targetValue - this.startValue;
    if (span === 0) return 100;
    const pct = ((this.currentValue - this.startValue) / span) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
});

goalSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);