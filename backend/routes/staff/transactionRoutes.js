const express = require('express');
const router = express.Router();
const { getMyTransactions } = require('../../controllers/transactionController');
const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getMyTransactions);

module.exports = router;
