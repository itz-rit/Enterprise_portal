const express = require('express');
const router = express.Router();
const Reward = require('../models/Reward');
const Notice = require('../models/Notice');
const Task = require('../models/Task');
const { protect, admin } = require('../middleware/authMiddleware');

// --- REWARDS ---

// @desc    Get today's reward
// @route   GET /api/v1/communi/rewards/today
// @access  Public
router.get('/rewards/today', async (req, res) => {
  try {
    const dateStr = req.query.date;
    let today, tomorrow;

    if (dateStr) {
      const dt = new Date(dateStr);
      today = new Date(dt.setHours(0, 0, 0, 0));
      tomorrow = new Date(dt.setHours(23, 59, 59, 999));
    } else {
      const now = new Date();
      today = new Date(now.setHours(0, 0, 0, 0));
      tomorrow = new Date(now.setHours(23, 59, 59, 999));
    }

    const reward = await Reward.findOne({
      date: { $gte: today, $lte: tomorrow }
    });

    if (!reward) {
      return res.status(404).json({ message: 'No reward set for this date' });
    }

    res.json(reward);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Upsert today's reward
// @route   POST /api/v1/communi/rewards
// @access  Private/Admin
router.post('/rewards', protect, admin, async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    const today = new Date(targetDate.setHours(0, 0, 0, 0));
    const tomorrow = new Date(targetDate.setHours(23, 59, 59, 999));

    let reward = await Reward.findOne({
      date: { $gte: today, $lte: tomorrow }
    });

    if (reward) {
      reward.title = title;
      reward.description = description;
      reward.created_at = new Date();
      await reward.save();
    } else {
      reward = await Reward.create({
        title,
        description,
        date: today,
        created_at: new Date()
      });
    }

    res.status(201).json(reward);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- NOTICES ---

// @desc    Get all notices
// @route   GET /api/v1/communi/notices
// @access  Public
router.get('/notices', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ created_at: -1 }).limit(50);
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Create a notice
// @route   POST /api/v1/communi/notices
// @access  Private/Admin
router.post('/notices', protect, admin, async (req, res) => {
  try {
    const { title, message } = req.body;
    const notice = await Notice.create({ title, message });
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Delete a notice
// @route   DELETE /api/v1/communi/notices/:id
// @access  Private/Admin
router.delete('/notices/:id', protect, admin, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    await notice.deleteOne();
    res.json({ message: 'Notice removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- QUICK TASKS ---

// @desc    Get tasks for a specific staff member
// @route   GET /api/v1/communi/tasks/staff/:userId
// @access  Private
router.get('/tasks/staff/:userId', protect, async (req, res) => {
  try {
    // Note: This uses the existing Task model but specifically for "Quick Tasks"
    // that might be managed via the communication hub.
    // For now, we'll fetch tasks assigned to this user.
    const tasks = await Task.find({ assignedTo: req.params.userId }).sort({ date: -1 }).limit(100);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Create a quick task
// @route   POST /api/v1/communi/tasks
// @access  Private/Admin
router.post('/tasks', protect, admin, async (req, res) => {
  try {
    const { title, description, assigned_to } = req.body;
    // Map assigned_to to assignedTo (Mongoose model field)
    const task = await Task.create({
      clientName: title, // Using clientName as title for compatibility
      notes: description,
      assignedTo: assigned_to,
      status: 'Pending',
      date: new Date()
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Complete a task
// @route   PUT /api/v1/communi/tasks/:taskId/complete
// @access  Private
router.put('/tasks/:taskId/complete', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    task.status = 'Completed';
    task.completedAt = new Date();
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
