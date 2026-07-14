const mongoose = require('mongoose');

const bodyMetricSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    weight: { type: Number }, // kg
    bodyFat: { type: Number }, // %
    measurements: {
        chest: { type: Number },   // cm
        waist: { type: Number },
        hips: { type: Number },
        arms: { type: Number },
        thighs: { type: Number }
    },
    photoUrl: { type: String, default: '' },
    notes: { type: String, default: '' }
}, { timestamps: true });

bodyMetricSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('BodyMetric', bodyMetricSchema);