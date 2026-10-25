const express = require('express');
const router = express.Router();
const { getStaffPerformance, getAllStaffPerformance } = require('../controllers/performanceController');
const { protect, admin } = require('../middleware/authMiddleware');

// Get performance for all staff (summary)
router.get('/', protect, admin, getAllStaffPerformance);

// Get detailed performance for a specific staff member
router.get('/:userId', protect, admin, getStaffPerformance);

module.exports = router;
