const Attendance = require('../models/Attendance');
const User = require('../models/User');

// ── ADMIN CONTROLLERS ──────────────────────────────────────────────────

// @desc    Get today's attendance summary (admin)
// @route   GET /api/admin/attendance/today-summary
const getTodayAttendanceSummary = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    // Count total staff
    const totalStaff = await User.countDocuments({ role: 'Staff' });

    // Count unique staff present today
    const presentToday = await Attendance.distinct('userId', {
      status: 'Present',
      createdAt: { $gte: todayStart, $lt: tomorrowStart }
    });

    res.json({
      totalStaff,
      presentToday: presentToday.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all attendance records (admin)
// @route   GET /api/admin/attendance
const getAllAttendance = async (req, res) => {
  try {
    const { userId, date } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    const records = await Attendance.find(filter)
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── STAFF CONTROLLERS ──────────────────────────────────────────────────

// @desc    Mark own attendance (staff) — once per day enforced
// @route   POST /api/staff/attendance
const markAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await Attendance.findOne({
      userId: req.user._id,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    const { lat, lng, notes } = req.body;
    const attendance = await Attendance.create({
      userId: req.user._id,
      status: 'Present',
      location: { lat, lng },
      notes: notes || '',
    });

    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get own attendance (staff)
// @route   GET /api/staff/attendance
const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(30);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllAttendance, markAttendance, getMyAttendance, getTodayAttendanceSummary };
