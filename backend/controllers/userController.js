const { validationResult } = require('express-validator');
const User = require('../models/User');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const Transaction = require('../models/Transaction');

// ── ADMIN CONTROLLERS ──────────────────────────────────────────────────

// @desc    Get all staff (admin only)
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { area } = req.query;
    const filter = {};
    if (area) filter.area = area;
    
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single user (admin only)
// @route   GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create staff member (admin only)
// @route   POST /api/admin/users
const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const { name, phone, password, role, base_salary, area, status } = req.body;
    const exists = await User.findOne({ phone });
    if (exists) return res.status(400).json({ message: 'Phone number already registered' });

    const user = await User.create({ name, phone, password, role: role || 'Staff', base_salary: base_salary || 0, advanceOutstanding: req.body.advanceOutstanding || 0, area: area || '', status: status || 'Available' });
    res.status(201).json({
      _id: user._id, name: user.name, phone: user.phone, role: user.role, base_salary: user.base_salary, advanceOutstanding: user.advanceOutstanding, area: user.area, status: user.status
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update staff member (admin only)
// @route   PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, phone, role, base_salary, advanceOutstanding, isActive, area, status } = req.body;
    console.log(`[updateUser] Updating user ${req.params.id}. New advanceOutstanding: ${advanceOutstanding}`);
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (base_salary !== undefined) user.base_salary = base_salary;
    if (advanceOutstanding !== undefined) user.advanceOutstanding = advanceOutstanding;
    if (isActive !== undefined) user.isActive = isActive;
    if (area !== undefined) user.area = area;
    if (status !== undefined) user.status = status;
    if (req.body.password) user.password = req.body.password;

    await user.save();
    const updated = await User.findById(user._id).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete staff member (admin only)
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'Admin') return res.status(400).json({ message: 'Cannot delete admin account' });

    // Cascading deletion
    await Promise.all([
      Task.deleteMany({ assignedTo: user._id }),
      Attendance.deleteMany({ userId: user._id }),
      Transaction.deleteMany({ userId: user._id }),
    ]);

    await user.deleteOne();
    res.json({ message: 'Staff member and all related records removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── STAFF CONTROLLERS ──────────────────────────────────────────────────

// @desc    Get own profile (staff only)
// @route   GET /api/staff/profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, getMyProfile };
