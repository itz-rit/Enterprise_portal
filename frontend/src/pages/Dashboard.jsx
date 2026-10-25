import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Calendar, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CommunicationManager from '../components/CommunicationManager';

const statusBadge = {
  Completed: 'badge badge-teal',
  'In Progress': 'badge badge-blue',
  Pending: 'badge badge-amber',
};

const Dashboard = () => {
  const { api } = useAuth();
  const [stats, setStats] = useState({ staff: 0, tasks: 0, attendance: 0, presentToday: 0, totalStaff: 0, pending: 0, completed: 0, completionRate: 0, attendanceRate: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date Filter State
  const [rangeType, setRangeType] = useState('Last 30 Days');
  const [customRange, setCustomRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const getRange = useCallback(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (rangeType === 'Today') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (rangeType === 'Yesterday') {
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    } else if (rangeType === 'Last 7 Days') {
      start.setDate(now.getDate() - 7);
    } else if (rangeType === 'Last 30 Days') {
      start.setDate(now.getDate() - 30);
    } else if (rangeType === 'Custom') {
      start = new Date(customRange.start);
      end = new Date(customRange.end);
      end.setHours(23, 59, 59, 999);
    }
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [rangeType, customRange]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getRange();
      const [uRes, tRes, aRes, sRes, ssRes] = await Promise.all([
        api('get', '/api/admin/users'),
        api('get', `/api/admin/tasks?startDate=${startDate}&endDate=${endDate}`),
        api('get', '/api/admin/attendance'),
        api('get', '/api/admin/attendance/today-summary'),
        api('get', '/api/v1/staff-stock/summary')
      ]);
      const staffCount = uRes.data.filter((u) => u.role === 'Staff').length;
      const { tasks, totalTasks, pendingTasks, completedTasks } = tRes.data;
      const attendance = aRes.data;
      const presentAttendance = attendance.filter((a) => a.status === 'Present').length;
      const summary = sRes?.data || { totalStaff: 0, presentToday: 0 };

      setStats({
        staff: staffCount,
        tasks: totalTasks,
        attendance: attendance.length,
        presentToday: summary.presentToday,
        totalStaff: summary.totalStaff,
        pending: pendingTasks,
        completed: completedTasks,
        completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
        attendanceRate: attendance.length ? Math.round((presentAttendance / attendance.length) * 100) : 0,
      });
      setRecentTasks(tasks.slice(0, 6));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [api, getRange]);

  useEffect(() => {
    loadDashboard();
    document.title = "Dashboard | Pradeep Enterprises";
  }, [loadDashboard]);

  const metricCards = [
    { label: 'Active Staff', value: stats.staff, note: 'Available on field', icon: <Users size={22} />, color: '#dbeafe', text: '#1d4ed8' },
    { label: 'Total Tasks', value: stats.tasks, note: 'Across active jobs', icon: <CheckCircle size={22} />, color: '#dcfce7', text: '#15803d' },
    { label: 'Today Present', value: `${stats.presentToday} / ${stats.totalStaff}`, note: 'Staff available today', icon: <Activity size={22} />, color: '#ccfbf1', text: '#0f766e' },
    { label: 'Pending Jobs', value: stats.pending, note: 'Needs action', icon: <Clock size={22} />, color: '#ffedd5', text: '#c2410c' },
    { label: 'Overall Completed', value: stats.completed, note: 'Successful jobs', icon: <CheckCircle size={22} />, color: '#f0fdf4', text: '#16a34a' },
  ];

  return (
    <div className="flex flex-col gap-6 lg:gap-8 pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden p-6 lg:p-10 rounded-[2rem] bg-gradient-to-br from-blue-700 to-teal-700 text-white shadow-xl shadow-blue-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-2xl lg:text-4xl font-black tracking-tight leading-tight uppercase">
              Operations Center
            </h1>
            <p className="mt-3 text-sm lg:text-base text-blue-100 font-medium leading-relaxed">
              Real-time executive view for staffing, task flow, and field performance.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-black uppercase tracking-widest">
            <Calendar size={14} />
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-6">
        {metricCards.map((card) => (
          <article key={card.label} className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl lg:rounded-2xl mb-4 shadow-sm" style={{ background: card.color, color: card.text }}>
              {card.icon}
            </div>
            <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{card.label}</p>
            <p className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight">
              {loading ? '...' : card.value}
            </p>
            <p className="mt-2 text-[10px] lg:text-xs font-bold text-slate-400 truncate">{card.note}</p>
          </article>
        ))}
      </section>

      {/* Main Content Areas */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Tasks Table/Card List */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm lg:text-base font-black uppercase tracking-widest text-slate-900">Recent Field Actions</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rangeType} Metrics</p>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Custom'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setRangeType(type)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${
                      rangeType === type 
                        ? 'bg-white text-blue-600 shadow-sm border border-slate-200' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {rangeType === 'Custom' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                  <input
                    type="date"
                    className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={customRange.start}
                    onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                  />
                  <span className="text-[10px] font-black text-slate-400">TO</span>
                  <input
                    type="date"
                    className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={customRange.end}
                    onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                  />
                </div>
              )}

              <Link to="/tasks" className="ml-2 p-2 lg:px-4 lg:py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-100 transition-colors whitespace-nowrap">
                Task Board <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Client / Site</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">Details</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTasks.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-sm font-bold text-slate-400">No task activity found</td>
                  </tr>
                ) : (
                  recentTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-black text-slate-900 text-sm uppercase tracking-tight">{task.clientName}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                          {new Date(task.date).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500 hidden sm:table-cell">
                        {task.assignedTo?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          task.status === 'Completed' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                          task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Secondary Panels (Stacked on Bottom in Mobile) */}
        <div className="flex flex-col gap-6 lg:gap-8">
          <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Completion Rate</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">{loading ? '...' : `${stats.completionRate}%`}</span>
              <span className="text-xs font-bold text-slate-400 mb-2 uppercase">of target achieved</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-1000"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">System Guidance</h3>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-4">
              <div className="inline-block px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md mb-2">Recommended</div>
              <p className="text-xs font-bold text-blue-900 leading-relaxed uppercase tracking-tight">
                Focus on pending tasks and staff attendance exceptions to maintain operations.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-relaxed">Executive Support Line</div>
              <div className="text-sm font-black text-slate-900 tracking-widest uppercase truncate">7010425239 | 9384424111</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
