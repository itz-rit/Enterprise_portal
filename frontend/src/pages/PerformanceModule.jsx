import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Activity, 
  Calendar, 
  IndianRupee, 
  CheckCircle, 
  AlertCircle,
  Award,
  Users,
  PieChart as PieIcon,
  BarChart2,
  Clock,
  X
} from 'lucide-react';

const PerformanceModule = () => {
  const { api } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [perfData, setPerfData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('overview');

  const loadStaff = useCallback(async () => {
    try {
      const { data } = await api('get', '/api/admin/users');
      const staff = data.filter(u => u.role === 'Staff');
      setStaffList(staff);
      if (staff.length > 0) setSelectedStaff(staff[0]._id);
    } catch {
      console.error('Failed to load personnel list');
    }
  }, [api]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const loadPerformance = useCallback(async () => {
    if (!selectedStaff) return;
    setLoading(true);
    try {
      const { data } = await api('get', `/api/admin/performance/${selectedStaff}`);
      setPerfData(data);
    } catch {
      console.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [api, selectedStaff]);

  useEffect(() => {
    if (selectedStaff) {
      loadPerformance();
    }
  }, [selectedStaff, loadPerformance]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4 text-gray-400">
       <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
       <p className="font-bold">Aggregating Field Metrics...</p>
    </div>
  );

  if (!perfData) return (
    <div className="bg-white p-16 rounded-[3rem] border border-dashed border-gray-200 text-center flex flex-col items-center gap-4">
       <Users size={48} className="text-gray-100" />
       <p className="font-bold text-gray-400">Select a personnel to view performance analysis.</p>
    </div>
  );

  const staffInfo = staffList.find(s => s._id === selectedStaff);
  const monthlyData = Object.values(perfData.monthlyBreakdown || {});
  const taskStats = [
    { name: 'Completed', value: perfData.overallStats.completedTasks, fill: '#10b981' },
    { name: 'Pending', value: perfData.overallStats.pendingTasks, fill: '#f59e0b' },
    { name: 'In Progress', value: perfData.overallStats.inProgressTasks, fill: '#3b82f6' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header & Selector */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
             <BarChart2 size={32} className="text-blue-600" /> Executive Analytics
          </h1>
          <p className="text-gray-500 font-medium tracking-tight">Performance surveillance for <span className="text-blue-600 font-bold">Pradeep Enterprises</span></p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] border border-gray-100 shadow-sm min-w-[320px]">
           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-[1.25rem] flex items-center justify-center">
              <Users size={20} />
           </div>
           <div className="flex-1">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Personnel</p>
              <select 
                value={selectedStaff || ''} 
                onChange={e => setSelectedStaff(e.target.value)}
                className="w-full bg-transparent text-gray-900 font-black focus:outline-none cursor-pointer appearance-none"
              >
                {staffList.map(s => <option key={s._id} value={s._id}>{s.name} • {s.phone}</option>)}
              </select>
           </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-4 p-1 custom-scrollbar">
        {[
          { id: 'overview', label: 'Command Overview', icon: <PieIcon size={16} /> },
          { id: 'monthly', label: 'Monthly Trends', icon: <TrendingUp size={16} /> },
          { id: 'attendance', label: 'Attendance Audit', icon: <Calendar size={16} /> },
          { id: 'financial', label: 'Financial Data', icon: <IndianRupee size={16} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setViewType(t.id)}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap ${
              viewType === t.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in slide-in-from-bottom-4 duration-300">
        
        {viewType === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
               {[
                 { label: 'Deployment Success', value: perfData.overallStats.completedTasks, color: 'emerald', detail: perfData.overallStats.taskCompletionRate + ' Share', icon: <CheckCircle /> },
                 { label: 'Days Active', value: perfData.overallStats.totalDaysAttended || 0, color: 'blue', detail: perfData.overallStats.attendanceRate + ' Rate', icon: <Activity /> },
                 { label: 'Deficit / Absents', value: perfData.overallStats.totalAbsentDays, color: 'orange', detail: 'Critically Low', icon: <AlertCircle /> },
                 { label: 'Productivity Peak', value: perfData.overallStats.averageTasksPerMonth, color: 'indigo', detail: 'Units / Month', icon: <TrendingUp /> }
               ].map((s, idx) => (
                 <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className={`w-12 h-12 bg-${s.color}-50 text-${s.color}-600 rounded-2xl flex items-center justify-center mb-6`}>
                       {s.icon}
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className={`text-4xl font-black text-gray-900 mb-2`}>{s.value}</p>
                    <p className={`text-[9px] font-black text-${s.color}-600 bg-${s.color}-50 px-2 py-0.5 rounded-lg w-fit uppercase`}>{s.detail}</p>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm border-b-8 border-b-blue-600">
                  <h3 className="text-xl font-black text-gray-900 mb-10 flex items-center gap-3">
                     <PieIcon size={24} className="text-blue-600" /> Action Distribution
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={taskStats} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={70}
                          outerRadius={100} 
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {taskStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                           itemStyle={{ fontWeight: '900', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center flex-wrap gap-8 mt-4">
                     {taskStats.map(s => (
                       <div key={s.name} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.fill }}></div>
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{s.name}: {s.value}</span>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden h-full flex flex-col justify-between">
                     <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                     <div>
                        <Award size={48} className="mb-6 opacity-30" />
                        <h4 className="text-2xl font-black mb-2 leading-tight">Elite Efficiency Level Detected</h4>
                        <p className="text-blue-100/70 font-medium">This staff member is currently operating in the <span className="text-white font-bold">Top 5%</span> of field personnel for Jai Hind sector.</p>
                     </div>
                     <div className="pt-10">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">System Rank: Alpha</span>
                           <span className="text-lg font-black">9.6</span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                           <div className="w-[96%] h-full bg-white rounded-full"></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {viewType === 'monthly' && (
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
            <h2 className="text-xl font-black text-gray-900 mb-10 flex items-center justify-between">
               <span>Deployments vs Attendance (Year {perfData.yearlyStats.year})</span>
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-4 py-1.5 bg-blue-50 rounded-xl">Pradeep Enterprises Core Data</span>
            </h2>
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }} />
                  <Tooltip 
                     cursor={{ fill: '#f9fafb' }}
                     contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 30 }} />
                  <Bar dataKey="tasksCompleted" fill="#2563eb" radius={[6, 6, 0, 0]} name="Operations Finished" />
                  <Bar dataKey="attendance" fill="#93c5fd" radius={[6, 6, 0, 0]} name="Active Days" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {viewType === 'attendance' && (
           <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-50 text-center flex flex-col items-center">
                    <CheckCircle size={32} className="text-emerald-500 mb-3" />
                    <p className="text-4xl font-black text-emerald-900">{perfData.overallStats.totalDaysAttended || 0}</p>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Confirmed Presence</p>
                 </div>
                 <div className="bg-orange-50/50 p-8 rounded-[2.5rem] border border-orange-50 text-center flex flex-col items-center">
                    <X size={32} className="text-orange-400 mb-3" />
                    <p className="text-4xl font-black text-orange-900">{perfData.overallStats.totalAbsentDays}</p>
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-1">Missing Deployment</p>
                 </div>
                 <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-50 text-center flex flex-col items-center">
                    <Clock size={32} className="text-blue-500 mb-3" />
                    <p className="text-4xl font-black text-blue-900">{perfData.overallStats.totalLateDays}</p>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Arrival Delay</p>
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 mb-10">Attendance Precision Over Time</h2>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }} />
                      <Tooltip contentStyle={{ borderRadius: '1.25rem', border: 'none' }} />
                      <Line type="stepAfter" dataKey="attendance" stroke="#2563eb" strokeWidth={4} dot={{ r: 6, fill: '#2563eb', strokeWidth: 0 }} activeDot={{ r: 8 }} name="Days Present" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
           </div>
        )}

        {viewType === 'financial' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {[
                { label: 'Contract Salary', value: perfData.financialData.baseSalary, color: 'blue', icon: <IndianRupee /> },
                { label: 'Total Credited', value: perfData.financialData.totalSalaryPaid, color: 'emerald', icon: <CheckCircle /> },
                { label: 'Advance Loans', value: perfData.financialData.totalAdvancesTaken, color: 'indigo', icon: <Activity /> },
                { label: 'Operational Coll.', value: perfData.financialData.totalCollections, color: 'orange', icon: <TrendingUp /> },
                { label: 'Total Incentives', value: perfData.financialData.totalIncentivesPaid || 0, color: 'rose', icon: <Award /> }
              ].map((f, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
                   <div className={`w-14 h-14 bg-${f.color}-50 text-${f.color}-600 rounded-[1.25rem] flex items-center justify-center mb-6`}>
                      {f.icon}
                   </div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{f.label}</p>
                   <p className="text-2xl font-black text-gray-900">₹{f.value.toLocaleString()}</p>
                </div>
              ))}
           </div>
        )}

      </div>
      
      {/* Dynamic Profile Footer */}
      <div className="mt-8 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white shadow-sm rounded-3xl flex items-center justify-center text-blue-600 text-2xl font-black">
               {staffInfo?.name?.[0]}
            </div>
            <div>
               <h3 className="text-xl font-black text-gray-900">{staffInfo?.name}</h3>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{staffInfo?.role} • PERSONNEL ID: {selectedStaff?.slice(-6).toUpperCase()}</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Corporate Hotline</p>
            <p className="text-lg font-black text-blue-600">7010425239</p>
         </div>
      </div>
    </div>
  );
};

export default PerformanceModule;
