const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficiently fetching location history
locationSchema.index({ employeeId: 1, timestamp: -1 });

module.exports = mongoose.model('Location', locationSchema);
