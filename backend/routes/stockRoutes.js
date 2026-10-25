const express = require('express');
const router = express.Router();
const { createStock, getStocks, updateStock } = require('../controllers/stockController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getStocks).post(protect, admin, createStock);
router.route('/:id').put(protect, admin, updateStock);

module.exports = router;
