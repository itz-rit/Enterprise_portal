const express = require('express');
const router = express.Router();
const { markAttendance, getMyAttendance } = require('../../controllers/attendanceController');
const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getMyAttendance).post(markAttendance);

module.exports = router;
