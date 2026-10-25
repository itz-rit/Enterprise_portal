const mongoose = require('mongoose');

const staffStockRecordSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['ISSUE', 'RETURN', 'REMOVED_BY_ADMIN'], // ISSUE: Admin gives to Staff, RETURN: Staff returns to Admin
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Index for efficient history lookups per staff
staffStockRecordSchema.index({ staffId: 1, createdAt: -1 });

module.exports = mongoose.model('StaffStockRecord', staffStockRecordSchema);
