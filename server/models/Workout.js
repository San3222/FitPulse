const mongoose = require('mongoose');

const lapSchema = new mongoose.Schema({
  lapNumber: Number,
  time: String,
  seconds: Number
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['cardio', 'strength', 'yoga', 'hiit', 'cycling', 'running'],
    default: 'cardio'
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  calories: {
    type: Number,
    default: 0
  },
  steps: {
    type: Number,
    default: 0
  },
  heartRate: {
    type: Number,
    default: 0
  },
  laps: [lapSchema],
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  scheduledDate: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  points: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Calculate points when workout is completed
workoutSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.points) {
    this.points = Math.floor(this.calories * 0.1 + this.duration * 2 + this.steps * 0.001);
  }
  next();
});

module.exports = mongoose.model('Workout', workoutSchema);
