const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    amountMl: {
        type: Number,
        required: true
    }
}, { timestamps: true });

waterLogSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('WaterLog', waterLogSchema);