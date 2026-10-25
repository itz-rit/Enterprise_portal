const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    clientName: { type: String, default: 'N/A' },
    contactNumber: { type: String, default: 'N/A' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    notes: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    area: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    completedAt: { type: Date },
    completionLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    proofImageURL: { type: String },
    // Append-only update history from staff
    updates: [
      {
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: String,
        notes: String,
        location: { lat: Number, lng: Number },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    // History of task reassignments
    transferHistory: [
      {
        fromStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        toStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        transferredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The admin
        note: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
