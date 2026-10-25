const express = require('express');
const router = express.Router();
const {
  saveLocation,
  getAllStaffLocations,
  getLocationHistory
} = require('../controllers/locationController');
const { protect, admin } = require('../middleware/authMiddleware');

// Staff saving their own location
router.post('/', protect, saveLocation);

// Admin getting all staff locations
router.get('/staff', protect, admin, getAllStaffLocations);

// Admin getting specific staff history
router.get('/history/:employeeId', protect, admin, getLocationHistory);

module.exports = router;
