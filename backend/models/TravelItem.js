const mongoose = require('mongoose');

const travelItemSchema = new mongoose.Schema({
  travelPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TravelPlan',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  itemType: {
    type: String,
    required: true,
    enum: ['activities', 'hotels', 'restaurants', 'attractions', 'transportation'],
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  locationData: {
    type: mongoose.Schema.Types.Mixed,
  },
  date: {
    type: Date,
  },
  checkIn: {
    type: Date,
  },
  checkOut: {
    type: Date,
  },
  price: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
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

travelItemSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
travelItemSchema.index({ travelPlanId: 1, itemType: 1 });

module.exports = mongoose.model('TravelItem', travelItemSchema);
