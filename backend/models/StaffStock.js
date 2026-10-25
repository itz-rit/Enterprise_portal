const mongoose = require('mongoose');

const staffStockSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  balanceQuantity: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

// Ensure unique index so we only have one record per staff-item pair
staffStockSchema.index({ staffId: 1, stockId: 1 }, { unique: true });

module.exports = mongoose.model('StaffStock', staffStockSchema);
