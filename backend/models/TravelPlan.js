const mongoose = require('mongoose');

const travelPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Travel plan name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  startLocation: {
    type: String,
    required: [true, 'Start location is required'],
    trim: true,
  },
  startLocationData: {
    type: mongoose.Schema.Types.Mixed,
  },
  endLocation: {
    type: String,
    required: [true, 'End location is required'],
    trim: true,
  },
  endLocationData: {
    type: mongoose.Schema.Types.Mixed,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  travelers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Traveler',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

travelPlanSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TravelPlan', travelPlanSchema);
