const express = require('express');
const router = express.Router();
const { getAllStocks, createStock, updateStock, deleteStock } = require('../../controllers/stockController');
const { protect, admin } = require('../../middleware/authMiddleware');

router.use(protect, admin);

router.route('/').get(getAllStocks).post(createStock);
router.route('/:id').put(updateStock).delete(deleteStock);

module.exports = router;
