const User = require('../models/User');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const Transaction = require('../models/Transaction');

// @desc    Get staff member performance metrics
// @route   GET /api/admin/performance/:userId
// @access  Admin only
const getStaffPerformance = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Get all tasks assigned to staff
    const allTasks = await Task.find({ assignedTo: userId });
    const completedTasks = allTasks.filter(t => t.status === 'Completed');
    const pendingTasks = allTasks.filter(t => t.status === 'Pending');
    const inProgressTasks = allTasks.filter(t => t.status === 'In Progress');

    // Get attendance records
    const allAttendance = await Attendance.find({ userId });
    const presentDays = allAttendance.filter(a => a.status === 'Present').length;
    const absentDays = allAttendance.filter(a => a.status === 'Absent').length;
    const lateDays = allAttendance.filter(a => a.status === 'Late').length;
    const totalAttendance = allAttendance.length;

    // Get monthly performance
    const monthlyData = {};
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(currentYear, month - 1, 1);
      const endDate = new Date(currentYear, month, 0);
      
      const monthlyTasks = allTasks.filter(t => {
        const taskDate = new Date(t.completedAt || t.updatedAt);
        return taskDate >= startDate && taskDate <= endDate && t.status === 'Completed';
      });

      const monthlyAttendance = allAttendance.filter(a => {
        const attendanceDate = new Date(a.createdAt);
        return attendanceDate >= startDate && attendanceDate <= endDate;
      });

      const monthlyPresent = monthlyAttendance.filter(a => a.status === 'Present').length;

      monthlyData[month] = {
        month: new Date(currentYear, month - 1).toLocaleString('default', { month: 'long' }),
        tasksCompleted: monthlyTasks.length,
        attendance: monthlyPresent,
      };
    }

    // Get transactions (salary, advances)
    const transactions = await Transaction.find({ userId });
    const totalSalary = transactions
      .filter(t => t.type === 'Salary')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalAdvances = transactions
      .filter(t => t.type === 'Advance')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalCollections = transactions
      .filter(t => t.type === 'Collection')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncentives = transactions
      .filter(t => t.type === 'Incentive')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate efficiency metrics
    const taskCompletionRate = allTasks.length > 0 ? ((completedTasks.length / allTasks.length) * 100).toFixed(2) : 0;
    const attendanceRate = totalAttendance > 0 ? ((presentDays / totalAttendance) * 100).toFixed(2) : 0;
    const averageTasksPerMonth = (completedTasks.length / 12).toFixed(2);

    // Get yearly data
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const yearlyTasks = allTasks.filter(t => {
      const taskDate = new Date(t.completedAt || t.updatedAt);
      return taskDate >= startOfYear && taskDate <= endOfYear && t.status === 'Completed';
    });

    const yearlyAttendance = allAttendance.filter(a => {
      const attendanceDate = new Date(a.createdAt);
      return attendanceDate >= startOfYear && attendanceDate <= endOfYear;
    });

    const yearlyPresent = yearlyAttendance.filter(a => a.status === 'Present').length;

    res.json({
      staff: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      currentMonth: {
        month: new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' }),
        year: currentYear,
        tasksCompleted: completedTasks.filter(t => {
          const date = new Date(t.completedAt || t.updatedAt);
          return date.getMonth() === currentMonth - 1 && date.getFullYear() === currentYear;
        }).length,
        attendance: monthlyData[currentMonth]?.attendance || 0,
      },
      overallStats: {
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        inProgressTasks: inProgressTasks.length,
        taskCompletionRate: `${taskCompletionRate}%`,
        averageTasksPerMonth,
        totalDaysAttended: presentDays || 0,
        totalAbsentDays: absentDays,
        totalLateDays: lateDays,
        attendanceRate: `${attendanceRate}%`,
        totalWorkDays: totalAttendance,
      },
      monthlyBreakdown: monthlyData,
      yearlyStats: {
        year: currentYear,
        tasksCompleted: yearlyTasks.length,
        daysPresent: yearlyPresent,
        totalWorkDays: yearlyAttendance.length,
      },
      financialData: {
        baseSalary: user.base_salary,
        totalSalaryPaid: totalSalary,
        totalAdvancesTaken: totalAdvances,
        totalCollections: totalCollections,
        totalIncentivesPaid: totalIncentives,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all staff performance summary
// @route   GET /api/admin/performance
// @access  Admin only
const getAllStaffPerformance = async (req, res) => {
  try {
    const staff = await User.find({ role: 'Staff' }).select('-password');
    
    const performanceData = await Promise.all(
      staff.map(async (user) => {
        const tasks = await Task.find({ assignedTo: user._id });
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const attendance = await Attendance.find({ userId: user._id });
        const presentDays = attendance.filter(a => a.status === 'Present').length;

        return {
          userId: user._id,
          name: user.name,
          phone: user.phone,
          tasksCompleted: completedTasks,
          attendanceDays: presentDays,
          completionRate: tasks.length > 0 ? `${((completedTasks / tasks.length) * 100).toFixed(2)}%` : '0%',
        };
      })
    );

    res.json(performanceData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getStaffPerformance,
  getAllStaffPerformance,
};
