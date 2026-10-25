const express = require('express');
const router = express.Router();
const { getAllAttendance, getTodayAttendanceSummary } = require('../../controllers/attendanceController');
const { protect, admin } = require('../../middleware/authMiddleware');

router.use(protect, admin);

router.route('/').get(getAllAttendance);
router.route('/today-summary').get(getTodayAttendanceSummary);

module.exports = router;
