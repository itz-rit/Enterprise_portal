const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
