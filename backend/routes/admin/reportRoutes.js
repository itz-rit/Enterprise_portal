const express = require('express');
const router = express.Router();
const { getStaffReport } = require('../../controllers/reportController');
const { protect, admin } = require('../../middleware/authMiddleware');

router.get('/:id', protect, admin, getStaffReport);

module.exports = router;
