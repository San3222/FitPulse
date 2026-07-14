const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  inviteCode: {
    type: String,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  // --- Profile fields (used for BMR/TDEE + nutrition targets) ---
  age: { type: Number, default: null },
  gender: { type: String, enum: ['male', 'female', 'other', null], default: null },
  height: { type: Number, default: null }, // cm
  weight: { type: Number, default: null }, // kg (latest known weight)
  targetWeight: { type: Number, default: null }, // kg
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    default: 'moderate'
  },
  goal: {
    type: String,
    enum: ['lose_weight', 'maintain', 'gain_muscle', 'endurance'],
    default: 'maintain'
  },
  dailyWaterGoalMl: { type: Number, default: 2500 },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // Generate invite code
  if (!this.inviteCode) {
    this.inviteCode = 'FIT-' + this.name.split(' ')[0].toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);