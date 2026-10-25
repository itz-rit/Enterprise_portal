const express = require('express');
const router = express.Router();
const { getMyProfile } = require('../../controllers/userController');
const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getMyProfile);

module.exports = router;
