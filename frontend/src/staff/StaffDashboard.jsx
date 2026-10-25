import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Briefcase, Calendar, CheckCircle, IndianRupee, MapPin, Wallet, Award } from 'lucide-react';
import { useStaffAuth } from '../context/StaffAuthContext';
import DailyRewardCard from '../components/DailyRewardCard';
import StaffCommunicationHub from '../components/StaffCommunicationHub';

const badgeClass = {
  Completed: 'badge badge-teal',
  'In Progress': 'badge badge-blue',
  Pending: 'badge badge-amber',
};

const StaffDashboard = () => {
  const { api, staffUser, refreshProfile } = useStaffAuth();
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeHub, setActiveHub] = useState('messages');

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        await refreshProfile();
        const [t, a, tr] = await Promise.all([
          api('get', '/api/staff/tasks'),
          api('get', '/api/staff/attendance'),
          api('get', '/api/staff/transactions'),
        ]);
        if (!active) return;
        setTasks(t.data);
        setAttendance(a.data);
        setTxns(tr.data);
      } catch (e) {
        console.error(e);
        if (active) {
          setError(e.response?.data?.message || 'Unable to load your live staff data right now.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    const interval = setInterval(() => {
      console.log('Polling latest staff data...', new Date().toLocaleTimeString());
      refreshProfile();
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [api, refreshProfile]);

  useEffect(() => {
    if (staffUser) {
      console.log('Current Staff User Data:', {
        name: staffUser.name,
        advanceOutstanding: staffUser.advanceOutstanding,
        base_salary: staffUser.base_salary
      });
    }
  }, [staffUser]);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthlySalary = txns
    .filter((t) => t.type === 'Salary' && new Date(t.createdAt).getFullYear() === thisYear && new Date(t.createdAt).getMonth() === thisMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyIncentive = txns
    .filter((t) => t.type === 'Incentive' && new Date(t.createdAt).getFullYear() === thisYear && new Date(t.createdAt).getMonth() === thisMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  const todayDone = attendance.some((a) => new Date(a.createdAt).toDateString() === new Date().toDateString());
  const completedTasks = tasks.filter((t) => t.status === 'Completed');
  const activeTasks = tasks.filter((t) => t.status !== 'Completed');
  const incentives = txns.filter(t => t.type === 'Incentive');

  const metrics = [
    { label: 'Monthly Salary', value: `Rs ${Number(staffUser?.base_salary || 0).toLocaleString()}`, icon: <Wallet size={22} />, emoji: '💰', color: 'gold' },
    { label: 'Special Incentive', value: `Rs ${monthlyIncentive.toLocaleString()}`, icon: <Award size={22} />, emoji: '🏆', color: 'gold' },
    { label: 'Pending Tasks', value: tasks.filter((t) => t.status === 'Pending').length, icon: <Briefcase size={22} />, color: 'amber' },
    { label: 'In Progress', value: tasks.filter((t) => t.status === 'In Progress').length, icon: <Activity size={22} />, color: 'blue' },
    { label: 'Completed', value: tasks.filter((t) => t.status === 'Completed').length, icon: <CheckCircle size={22} />, color: 'emerald' },
    { label: 'This Month Paid', value: `Rs ${monthlySalary.toLocaleString()}`, icon: <IndianRupee size={22} />, color: 'red' },
  ];

  return (
    <div className="flex flex-col gap-6 lg:gap-8 pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden p-6 lg:p-10 rounded-[2rem] bg-gradient-to-br from-teal-700 to-blue-700 text-white shadow-xl shadow-teal-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-2xl lg:text-4xl font-black tracking-tight leading-tight uppercase">
              {`Welcome, ${staffUser?.name || 'Staff'}`}
            </h1>
            <p className="mt-3 text-sm lg:text-base text-teal-100 font-medium leading-relaxed">
              Stay on top of today&apos;s assignments, check-in status and your current earnings.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] lg:text-xs font-black uppercase tracking-widest whitespace-nowrap`}>
              <MapPin size={14} className={todayDone ? 'text-teal-300' : 'text-amber-300'} />
              {todayDone ? 'Attendance marked' : 'Attendance pending'}
            </div>
            
            {/* Live GPS Status Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] lg:text-xs font-black uppercase tracking-widest whitespace-nowrap">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="text-emerald-100">Live Tracker Active</span>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </section>



      <DailyRewardCard />

      {/* Metrics Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
        {metrics.map((card) => {
          const colorMap = {
            amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-100 text-amber-600',   border: 'border-amber-100',   text: 'text-amber-900' },
            blue:    { bg: 'bg-blue-50',    icon: 'bg-blue-100 text-blue-600',    border: 'border-blue-100',    text: 'text-blue-900' },
            emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-100', text: 'text-emerald-900' },
            indigo:  { bg: 'bg-indigo-50',  icon: 'bg-indigo-100 text-indigo-600',  border: 'border-indigo-100',  text: 'text-indigo-900' },
            teal:    { bg: 'bg-teal-50',    icon: 'bg-teal-100 text-teal-600',    border: 'border-teal-100',    text: 'text-teal-900' },
            rose:    { bg: 'bg-rose-50',    icon: 'bg-rose-100 text-rose-600',    border: 'border-rose-100',    text: 'text-rose-900' },
            red:     { bg: 'bg-red-100',    icon: 'bg-red-200 text-red-800',       border: 'border-red-300',     text: 'text-red-950' },
            gold:    { bg: 'bg-gradient-to-br from-[#BF953F] via-[#FCF6BA] to-[#AA771C]', icon: 'bg-black/20 text-yellow-900', border: 'border-[#BF953F]/30', text: 'text-yellow-950', sub: 'text-yellow-900/60' },
          };
          const style = colorMap[card.color];
          
          return (
            <article key={card.label} className={`group relative ${style.bg} p-5 lg:p-6 rounded-[2rem] border ${style.border} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}>
              <div className="relative z-10">
                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl mb-4 shadow-inner ${style.icon}`}>
                  {card.icon}
                </div>
                <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-1 ${card.color === 'red' ? 'text-red-700' : card.color === 'gold' ? 'text-yellow-900/70' : 'text-slate-400'}`}>
                  {card.label} {card.emoji}
                </p>
                <p className={`text-xl lg:text-2xl font-black ${style.text} tracking-tight`}>
                  {loading ? '...' : card.value}
                </p>
                <div className="mt-3 flex items-center gap-2">
                   <div className={`h-1 w-8 bg-current opacity-20 rounded-full`} />
                   <p className={`text-[10px] font-bold truncate uppercase tracking-tight ${card.label === 'This Month Paid' ? 'text-red-700' : card.color === 'gold' ? 'text-yellow-900/60' : 'text-slate-400'}`}>
                      {card.label === 'Monthly Salary' ? 'Fixed Base' : 
                       card.label === 'This Month Paid' ? `Adv: Rs ${Number(staffUser?.advanceOutstanding || 0).toLocaleString()}` : 
                       card.label === 'Special Incentive' ? 'Achievement' : 'Real-time'}
                   </p>
                </div>
              </div>
              
              {/* Decorative Background Pattern */}
              <div className="absolute -right-4 -bottom-4 opacity-[0.1] transform rotate-12 transition-transform group-hover:rotate-0 duration-500 text-current">
                {card.icon}
              </div>
            </article>
          );
        })}
      </section>

      {/* ── UNIFIED ACTIVITY HUB (TABBED SLIDES) ──────────────── */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-1 px-4 lg:px-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <div className="flex bg-slate-200/50 p-1 rounded-2xl my-3">
              <button 
                onClick={() => setActiveHub('messages')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeHub === 'messages' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Communications & Log
              </button>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HQ Sync Active</span>
           </div>
        </div>

        <div className="relative min-h-[400px]">
          <div className="w-full">
            <StaffCommunicationHub userId={staffUser?._id} />
          </div>
        </div>
      </section>

      {/* Main Content Areas */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Active Tasks Panel */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 lg:p-8 flex items-center justify-between border-b border-slate-100">
            <h3 className="text-sm lg:text-base font-black uppercase tracking-widest text-slate-900">My Active Tasks</h3>
            <Link to="/staff/tasks" className="p-2 lg:px-4 lg:py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-100 transition-colors">
              Task Board <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Client / Site</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!activeTasks.length ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-sm font-bold text-slate-400">No active tasks assigned</td>
                  </tr>
                ) : (
                  activeTasks.slice(0, 5).map((task) => (
                    <tr key={task._id} className={task.priority === 'Urgent' ? "bg-red-50 hover:bg-red-100 transition-colors border-l-4 border-red-500" : "hover:bg-slate-50/50 transition-colors"}>
                      <td className="px-6 py-4">
                        <div className="font-black text-slate-900 text-sm uppercase tracking-tight">{task.clientName}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest truncate max-w-[200px]">
                          {task.notes || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500 hidden sm:table-cell">
                        {task.date ? new Date(task.date).toLocaleDateString('en-IN') : '-'}
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

        {/* Status Panels (Stacked on Bottom in Mobile) */}
        <div className="flex flex-col gap-6 lg:gap-8">
          <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Today&apos;s Status</h3>
            <div className={`p-4 rounded-2xl border mb-4 flex items-center gap-3 ${
              todayDone ? 'bg-teal-50 border-teal-100 text-teal-700' : 'bg-amber-50 border-amber-100 text-amber-700'
            }`}>
              <div className={`w-3 h-3 rounded-full animate-pulse ${todayDone ? 'bg-teal-500' : 'bg-amber-500'}`} />
              <span className="text-xs font-black uppercase tracking-widest">
                {todayDone ? 'Attendance Recorded' : 'Pending Check-In'}
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
              Attendance must be marked before starting field work. Use the attendance page if check-in is pending.
            </p>
          </div>

          <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Support & Help</h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">HQ Command Center</div>
              <div className="text-sm font-black text-slate-900 tracking-widest uppercase">7010425239 | 9384424111</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
               <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 whitespace-nowrap">Finance Summary</div>
               <div className="text-sm font-black text-blue-900 tracking-tight uppercase tracking-tight">Rs {Number(staffUser?.base_salary || 0).toLocaleString()} <span className="text-[10px] font-bold text-blue-500 ml-1">/ Month</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Completed Tasks Quick View (Horizontal on Desktop, Stacked on Mobile) */}
      {completedTasks.length > 0 && (
        <section>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 px-4">Recently Finished ({completedTasks.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTasks.slice(0, 3).map((task) => (
              <div key={task._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-black text-slate-900 uppercase tracking-tight">{task.clientName}</h4>
                  <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-black uppercase tracking-widest rounded-md">Done</span>
                </div>
                <p className="text-[11px] font-bold text-slate-400 leading-relaxed mb-4 line-clamp-2 uppercase">
                  {task.notes || 'Job concluded successfully.'}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-50">
                  <Calendar size={12} className="text-slate-300" />
                  {task.completedAt ? new Date(task.completedAt).toLocaleDateString('en-IN') : new Date(task.updatedAt).toLocaleDateString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default StaffDashboard;
