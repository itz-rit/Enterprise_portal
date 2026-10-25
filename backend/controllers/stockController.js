const Stock = require('../models/Stock');

// @desc    Get all stocks (admin)
// @route   GET /api/admin/stocks
const getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find({}).sort({ createdAt: -1 });
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create stock item (admin)
// @route   POST /api/admin/stocks
const createStock = async (req, res) => {
  try {
    const { itemName, quantity, price, minLevel } = req.body;
    if (!itemName || quantity === undefined || price === undefined) {
      return res.status(400).json({ message: 'itemName, quantity, and price are required' });
    }
    const stock = await Stock.create({ itemName, quantity, price, minLevel: minLevel || 5 });
    res.status(201).json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update stock item (admin)
// @route   PUT /api/admin/stocks/:id
const updateStock = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ message: 'Stock item not found' });

    const { itemName, quantity, price, minLevel } = req.body;
    if (itemName !== undefined) stock.itemName = itemName;
    if (quantity !== undefined) stock.quantity = quantity;
    if (price !== undefined) stock.price = price;
    if (minLevel !== undefined) stock.minLevel = minLevel;

    await stock.save();
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete stock item (admin)
// @route   DELETE /api/admin/stocks/:id
const deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ message: 'Stock item not found' });
    await stock.deleteOne();
    res.json({ message: 'Stock item removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllStocks, createStock, updateStock, deleteStock };
