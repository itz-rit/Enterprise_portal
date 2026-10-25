const express = require('express');
const router = express.Router();
const { createTransaction, getTransactions } = require('../controllers/transactionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTransactions).post(protect, admin, createTransaction);

module.exports = router;
