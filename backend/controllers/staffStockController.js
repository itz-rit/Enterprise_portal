const StaffStock = require('../models/StaffStock');
const StaffStockRecord = require('../models/StaffStockRecord');
const Stock = require('../models/Stock');
const User = require('../models/User');

// @desc    Issue stock to staff (Admin Only)
// @route   POST /api/admin/staff-stock/issue
// @access  Private (Admin)
const issueStockToStaff = async (req, res) => {
  try {
    const { staffId, stockId, quantity } = req.body;
    
    if (!staffId || !stockId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Missing or invalid fields' });
    }

    // Check if item exists and has enough stock
    const stock = await Stock.findById(stockId);
    if (!stock) return res.status(404).json({ message: 'Stock item not found' });
    if (stock.quantity < quantity) {
      return res.status(400).json({ message: `Insufficient inventory. Available: ${stock.quantity}` });
    }

    // Check if staff exists
    const staff = await User.findById(staffId);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    // TRANSACTION LOGIC
    // 1. Subtract from warehouse inventory
    stock.quantity -= quantity;
    await stock.save();

    // 2. Update staff's private on-hand balance
    let staffStock = await StaffStock.findOne({ staffId, stockId });
    if (!staffStock) {
      staffStock = new StaffStock({
        staffId,
        stockId,
        itemName: stock.itemName,
        balanceQuantity: quantity
      });
    } else {
      staffStock.balanceQuantity += quantity;
    }
    await staffStock.save();

    // 3. Log history
    await StaffStockRecord.create({
      staffId,
      stockId,
      itemName: stock.itemName,
      quantity,
      type: 'ISSUE',
      adminId: req.user._id
    });

    res.status(201).json({ 
      success: true, 
      message: `Issued ${quantity} ${stock.itemName} to ${staff.name}`,
      updatedWarehouseStock: stock.quantity,
      newStaffBalance: staffStock.balanceQuantity
    });

  } catch (error) {
    console.error('Issue Stock Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Receive return from staff (Admin Only)
// @route   POST /api/admin/staff-stock/return
// @access  Private (Admin)
const receiveReturnFromStaff = async (req, res) => {
  try {
    const { staffId, stockId, quantity } = req.body;
    
    if (!staffId || !stockId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Missing or invalid fields' });
    }

    // Check if staff has enough stock to return
    const staffStock = await StaffStock.findOne({ staffId, stockId });
    if (!staffStock || staffStock.balanceQuantity < quantity) {
      return res.status(400).json({ message: 'Staff does not have enough on-hand to return that quantity' });
    }

    // TRANSACTION LOGIC
    // 1. Add back to warehouse inventory
    const stock = await Stock.findById(stockId);
    if (!stock) return res.status(404).json({ message: 'Main stock record for this item is missing' });
    stock.quantity += quantity;
    await stock.save();

    // 2. Subtract from staff's on-hand balance
    staffStock.balanceQuantity -= quantity;
    await staffStock.save();

    // 3. Log history
    await StaffStockRecord.create({
      staffId,
      stockId,
      itemName: stock.itemName,
      quantity,
      type: 'RETURN',
      adminId: req.user._id
    });

    res.json({ 
      success: true, 
      message: `Received ${quantity} ${stock.itemName} back from staff`,
      updatedWarehouseStock: stock.quantity,
      newStaffBalance: staffStock.balanceQuantity
    });

  } catch (error) {
    console.error('Return Stock Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get staff's private inventory (Staff View Only)
// @route   GET /api/staff/stock/my-bag
// @access  Private (Staff)
const getMyBag = async (req, res) => {
  try {
    const myStock = await StaffStock.find({ staffId: req.user._id }).sort({ updatedAt: -1 });
    res.json(myStock.filter(s => s.balanceQuantity > 0));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all staff on-hand stock (Admin summary)
// @route   GET /api/admin/staff-stock/summary
// @access  Private (Admin)
const getStaffStockSummary = async (req, res) => {
  try {
    const summary = await StaffStock.find({})
      .populate('staffId', 'name phone')
      .sort({ updatedAt: -1 });
    // Filter for active staff only & check for deleted records (staffId === null)
    res.json(summary.filter(s => s.balanceQuantity > 0 && s.staffId !== null));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a staff stock record (Admin Only)
// @route   DELETE /api/v1/staff-stock/:id
// @access  Private (Admin)
const deleteStaffStock = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await StaffStock.findById(id);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    // LOG HISTORY BEFORE DELETING
    await StaffStockRecord.create({
      staffId: record.staffId,
      stockId: record.stockId,
      itemName: record.itemName,
      quantity: record.balanceQuantity,
      type: 'REMOVED_BY_ADMIN',
      adminId: req.user._id
    });

    await StaffStock.findByIdAndDelete(id);
    res.json({ success: true, message: 'Stock record permanently removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  issueStockToStaff,
  receiveReturnFromStaff,
  getMyBag,
  getStaffStockSummary,
  deleteStaffStock
};
