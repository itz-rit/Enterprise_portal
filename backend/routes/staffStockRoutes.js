const express = require('express');
const router = express.Router();
const { 
  issueStockToStaff, 
  receiveReturnFromStaff, 
  getMyBag, 
  getStaffStockSummary,
  deleteStaffStock
} = require('../controllers/staffStockController');
const { protect, admin } = require('../middleware/authMiddleware');

// ADMIN ROUTES
// Issue from warehouse to staff
router.post('/issue', protect, admin, issueStockToStaff);
// Return from staff to warehouse
router.post('/return', protect, admin, receiveReturnFromStaff);
// View all staff-held stock
router.get('/summary', protect, admin, getStaffStockSummary);
// Delete a specific stock record permanently
router.delete('/:id', protect, admin, deleteStaffStock);

// STAFF ROUTES
// View my own 'bag'
router.get('/my-bag', protect, getMyBag);

module.exports = router;
