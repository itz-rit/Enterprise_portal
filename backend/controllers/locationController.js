const Location = require('../models/Location');
const User = require('../models/User');

// @desc    Save employee location
// @route   POST /api/location
// @access  Private (Staff)
const saveLocation = async (req, res) => {
  try {
    const { latitude, longitude, timestamp } = req.body;
    const employeeId = req.user._id;

    const location = await Location.create({
      employeeId,
      latitude,
      longitude,
      timestamp: timestamp || Date.now()
    });

    // Update User's last location
    const updatedUser = await User.findByIdAndUpdate(employeeId, {
      'location.lat': latitude,
      'location.lng': longitude,
      lastLocationTimestamp: timestamp || Date.now()
    }, { new: true });

    // Emitting redundancy: If the direct socket fails, the HTTP heartbeat refreshes the map
    const io = req.app.get('io');
    if (io) {
      io.emit('locationUpdated', {
        employeeId,
        latitude,
        longitude,
        timestamp: timestamp || new Date().toISOString()
      });
    }

    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all active users (Staff & Admin) with their last location
// @route   GET /api/v1/location/staff
// @access  Private (Admin)
const getAllStaffLocations = async (req, res) => {
  try {
    // Return all users who have coordinates set
    const users = await User.find({ 
      'location.lat': { $exists: true } 
    }).select('name _id location lastLocationTimestamp status phone role');
      
    res.json(users);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get location history for a specific employee
// @route   GET /api/location/:employeeId
// @access  Private (Admin)
const getLocationHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    // Get today's logs
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const logs = await Location.find({
      employeeId,
      timestamp: { $gte: startOfDay }
    }).sort({ timestamp: 1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  saveLocation,
  getAllStaffLocations,
  getLocationHistory
};
