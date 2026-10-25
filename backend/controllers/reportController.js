const User = require('../models/User');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const Transaction = require('../models/Transaction');

// @desc    Get full staff performance report (admin only)
// @route   GET /api/admin/reports/:id
const getStaffReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch user
    const staff = await User.findById(id).select('-password');
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    // Current month range
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // All-time stats
    const [allTasks, allAttendance, allTransactions] = await Promise.all([
      Task.find({ assignedTo: id }),
      Attendance.find({ userId: id }).sort({ createdAt: -1 }),
      Transaction.find({ userId: id }).sort({ createdAt: -1 }),
    ]);

    // This month stats
    const [monthTasks, monthAttendance, monthTransactions] = await Promise.all([
      Task.find({ assignedTo: id, updatedAt: { $gte: monthStart, $lte: monthEnd } }),
      Attendance.find({ userId: id, createdAt: { $gte: monthStart, $lte: monthEnd } }),
      Transaction.find({ userId: id, createdAt: { $gte: monthStart, $lte: monthEnd } }),
    ]);

    // Computed stats
    const totalCompleted = allTasks.filter(t => t.status === 'Completed').length;
    const totalPending   = allTasks.filter(t => t.status === 'Pending').length;
    const totalProgress  = allTasks.filter(t => t.status === 'In Progress').length;
    const totalCollection = allTransactions.filter(t => t.type === 'Collection').reduce((s, t) => s + t.amount, 0);
    const totalSalary    = allTransactions.filter(t => t.type === 'Salary').reduce((s, t) => s + t.amount, 0);
    const totalAdvance   = allTransactions.filter(t => t.type === 'Advance').reduce((s, t) => s + t.amount, 0);

    const monthCompleted   = monthTasks.filter(t => t.status === 'Completed').length;
    const monthCollection  = monthTransactions.filter(t => t.type === 'Collection').reduce((s, t) => s + t.amount, 0);
    const monthIncentive   = monthTransactions.filter(t => t.type === 'Incentive').reduce((s, t) => s + t.amount, 0);
    const monthAttendDays  = monthAttendance.length;

    const totalWorkingDays = (() => {
      let count = 0;
      const d = new Date(monthStart);
      while (d <= monthEnd) {
        const day = d.getDay();
        if (day !== 0) count++; // exclude Sunday
        d.setDate(d.getDate() + 1);
      }
      return count;
    })();

    const attendanceRate = totalWorkingDays > 0 ? Math.round((monthAttendDays / totalWorkingDays) * 100) : 0;

    // Yearly performance trends (last 6 months)
    const trends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      
      const monTasks = allTasks.filter(t => t.updatedAt >= start && t.updatedAt <= end && t.status === 'Completed').length;
      const monColl  = allTransactions.filter(t => t.createdAt >= start && t.createdAt <= end && t.type === 'Collection').reduce((s,t) => s + t.amount, 0);
      
      trends.push({
        month: d.toLocaleString('default', { month: 'short' }),
        completed: monTasks,
        collection: monColl
      });
    }

    res.json({
      staff,
      summary: {
        allTime: { totalTasks: allTasks.length, completed: totalCompleted, pending: totalPending, inProgress: totalProgress, totalCollection, totalSalary, totalAdvance, totalAttendance: allAttendance.length },
        thisMonth: { tasks: monthTasks.length, completed: monthCompleted, collection: monthCollection, incentive: monthIncentive, attendDays: monthAttendDays, totalWorkingDays, attendanceRate },
        yearly: { 
          totalCollectionYear: allTransactions.filter(t => t.createdAt.getFullYear() === now.getFullYear() && t.type === 'Collection').reduce((s,t) => s + t.amount, 0),
          totalCompletedYear: allTasks.filter(t => t.updatedAt.getFullYear() === now.getFullYear() && t.status === 'Completed').length
        }
      },
      trends,
      recentTasks: allTasks.slice(-10).reverse(),
      recentAttendance: allAttendance.slice(0, 15),
      recentTransactions: allTransactions.slice(0, 15),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStaffReport };
