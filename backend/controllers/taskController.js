const { validationResult } = require('express-validator');
const Task = require('../models/Task');

// ── ADMIN CONTROLLERS ──────────────────────────────────────────────────

// @desc    Get all tasks (admin)
// @route   GET /api/admin/tasks
const getAllTasks = async (req, res) => {
  try {
    const { status, assignedTo, startDate, endDate } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Date range filtering
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name phone')
      .sort({ date: -1 });

    // Calculate metrics for the filtered set
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;

    res.json({
      tasks,
      totalTasks,
      pendingTasks,
      completedTasks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create task (admin)
// @route   POST /api/admin/tasks
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const { title, description, staffId, area, priority, clientName, contactNumber, assignedTo, notes, date } = req.body;
    
    // Support both new flow (title, description, staffId) and old flow (clientName, notes, assignedTo)
    const finalTitle = title || clientName;
    const finalDescription = description || notes;
    const finalStaffId = staffId || assignedTo;
    
    if (!finalTitle || !finalStaffId) {
      return res.status(400).json({ message: 'Title/clientName and StaffId/assignedTo are required' });
    }
    
    const task = await Task.create({ 
      title: finalTitle,
      clientName: finalTitle, // keep for backwards compatibility
      description: finalDescription,
      notes: finalDescription, // keep for backwards compatibility
      contactNumber: contactNumber || 'N/A', 
      assignedTo: finalStaffId, 
      area: area || '',
      priority: priority || 'Medium',
      date: date || Date.now() 
    });
    const populated = await task.populate('assignedTo', 'name phone area status');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Admin update task (status, assignedTo, etc.)
// @route   PUT /api/admin/tasks/:id
const adminUpdateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, area, priority, clientName, contactNumber, assignedTo, status, notes, date } = req.body;
    
    if (title !== undefined) { task.title = title; task.clientName = title; }
    if (clientName !== undefined) task.clientName = clientName;
    
    if (description !== undefined) { task.description = description; task.notes = description; }
    if (notes !== undefined) task.notes = notes;
    
    if (contactNumber !== undefined) task.contactNumber = contactNumber;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (status !== undefined) task.status = status;
    if (date !== undefined) task.date = date;
    if (area !== undefined) task.area = area;
    if (priority !== undefined) task.priority = priority;

    await task.save();
    const updated = await Task.findById(task._id).populate('assignedTo', 'name phone area status');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete task (admin)
// @route   DELETE /api/admin/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── STAFF CONTROLLERS ──────────────────────────────────────────────────

// @desc    Get MY tasks only (staff) — IDOR protected
// @route   GET /api/staff/tasks
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id }).sort({ date: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Staff updates task status/notes/location ONLY — no clientName, no reassign
// @route   PUT /api/staff/tasks/:id
const staffUpdateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found or not assigned to you' });

    // Staff can ONLY update these fields
    const { status, notes, location } = req.body;
    const allowedStatuses = ['Pending', 'In Progress', 'Completed'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    if (status !== undefined) task.status = status;
    if (notes !== undefined) task.notes = notes;
    if (location !== undefined) task.location = location;
    if (status === 'Completed') {
      task.completedAt = new Date();
      if (location !== undefined) task.completionLocation = location;
    } else if (status !== undefined && status !== 'Completed') {
      task.completedAt = undefined;
      task.completionLocation = undefined;
    }

    // Append to update history
    task.updates = task.updates || [];
    task.updates.push({
      updatedBy: req.user._id,
      status: task.status,
      notes: notes || '',
      location: location || {},
      timestamp: new Date(),
    });

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Transfer task to another staff (admin)
// @route   PUT /api/admin/tasks/:id/transfer
const transferTask = async (req, res) => {
  try {
    const { newStaffId, note } = req.body;
    if (!newStaffId) return res.status(400).json({ message: 'newStaffId is required' });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const previousStaff = task.assignedTo;
    
    // Check if transferring to same person
    if (previousStaff.toString() === newStaffId) {
      return res.status(400).json({ message: 'Task is already assigned to this staff member' });
    }

    // Update task
    task.assignedTo = newStaffId;
    
    // Add to history
    task.transferHistory = task.transferHistory || [];
    task.transferHistory.push({
      fromStaff: previousStaff,
      toStaff: newStaffId,
      transferredBy: req.user._id,
      note: note || 'Task reassigned by admin',
      timestamp: new Date()
    });

    await task.save();
    
    const updated = await Task.findById(task._id).populate('assignedTo', 'name phone');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllTasks, createTask, adminUpdateTask, deleteTask, getMyTasks, staffUpdateTask, transferTask };
