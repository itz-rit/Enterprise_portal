const Transaction = require('../models/Transaction');

// @desc    Get all transactions (admin)
// @route   GET /api/admin/transactions
const getAllTransactions = async (req, res) => {
  try {
    const { userId, type } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (type) filter.type = type;

    const txns = await Transaction.find(filter)
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });
    res.json(txns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create transaction (admin)
// @route   POST /api/admin/transactions
const createTransaction = async (req, res) => {
  try {
    const { userId, amount, type, description } = req.body;
    if (!userId || !amount || !type) {
      return res.status(400).json({ message: 'userId, amount, and type are required' });
    }
    const txn = await Transaction.create({ userId, amount, type, description });
    const populated = await txn.populate('userId', 'name phone');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get own transactions (staff — IDOR protected)
// @route   GET /api/staff/transactions
const getMyTransactions = async (req, res) => {
  try {
    const txns = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(txns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete transaction (admin)
// @route   DELETE /api/admin/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const txn = await Transaction.findById(req.params.id);
    if (!txn) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    await Transaction.deleteOne({ _id: txn._id });
    res.json({ message: 'Transaction removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllTransactions, createTransaction, getMyTransactions, deleteTransaction };
