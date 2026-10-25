import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  TrendingUp, 
  CreditCard, 
  MapPin, 
  Calendar, 
  User as UserIcon, 
  Activity,
  Award,
  Clock,
  CheckSquare,
  CheckCircle
} from 'lucide-react';

const StaffDetail = () => {
  const { id } = useParams();
  const { api } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: report } = await api('get', `/api/admin/reports/${id}`);
      setData(report);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load staff report');
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 text-gray-400">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold">Generating comprehensive report...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-sm text-red-700">
      <p className="font-bold">Error Loading Report</p>
      <p>{error}</p>
      <button onClick={loadData} className="mt-4 text-sm font-bold underline">Try Again</button>
    </div>
  );

  if (!data) return <div className="p-12 text-center text-gray-500 font-bold bg-white rounded-2xl border border-dashed">No data available for this member</div>;

  const { staff, summary, recentTasks, recentAttendance, recentTransactions, trends } = data;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/team" className="p-2 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-500 shadow-sm transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{staff.name}</h1>
            <p className="text-gray-500 flex items-center gap-2">
              <span className="font-bold text-blue-600">Employee ID:</span> {staff._id.slice(-6).toUpperCase()} 
              <span className="text-gray-300">|</span> 
              <span className="font-semibold">{staff.phone}</span>
            </p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold text-sm shadow-sm ${
          staff.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
        }`}>
          {staff.isActive ? '● SYSTEM ACTIVE' : '○ DEACTIVATED'}
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group transition-all hover:shadow-md">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <TrendingUp size={24} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Attendance Rate</p>
          <p className="text-3xl font-black text-gray-900">{summary.thisMonth.attendanceRate}%</p>
          <p className="text-xs text-blue-600 font-bold mt-2 bg-blue-50 w-fit px-2 py-0.5 rounded">
            {summary.thisMonth.attendDays} / {summary.thisMonth.totalWorkingDays} Days Present
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group transition-all hover:shadow-md">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <CreditCard size={24} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Month Collection</p>
          <p className="text-3xl font-black text-gray-900">₹{summary.thisMonth.collection.toLocaleString()}</p>
          <p className="text-xs text-gray-500 font-bold mt-2">Target tracking enabled</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group transition-all hover:shadow-md">
          <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Award size={24} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Special Incentive</p>
          <p className="text-3xl font-black text-gray-900">₹{(summary.thisMonth.incentive || 0).toLocaleString()}</p>
          <p className="text-xs text-pink-600 font-bold mt-2 bg-pink-50 w-fit px-2 py-0.5 rounded">Performance Reward</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group transition-all hover:shadow-md">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Activity size={24} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tasks Completed</p>
          <p className="text-3xl font-black text-gray-900">{summary.thisMonth.completed}</p>
          <p className="text-xs text-gray-500 font-bold mt-2">Efficiency Rating: High</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl shadow-xl shadow-blue-100 text-white transform hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <Award size={24} />
          </div>
          <p className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-1">Yearly Collection</p>
          <p className="text-3xl font-black">₹{summary.yearly.totalCollectionYear.toLocaleString()}</p>
          <p className="text-xs text-blue-200 font-bold mt-2 italic">Pradeep Enterprises Rank: Core</p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile & Trends */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                   <UserIcon size={18} className="text-blue-600" /> Employee Profile
                </h3>
             </div>
             <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 font-bold">Role</span>
                   <span className="px-3 py-1 bg-blue-50 text-blue-700 font-black rounded-lg uppercase text-[10px]">{staff.role}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 font-bold">Base Salary</span>
                   <span className="font-black text-gray-900">₹{staff.base_salary?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 font-bold">Advance Outstanding</span>
                   <span className="text-red-500 font-black">₹{staff.advanceOutstanding?.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                   <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Overall Impact</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-2xl">
                         <p className="text-lg font-black text-gray-900">{summary.allTime.completed}</p>
                         <p className="text-[10px] text-gray-500 font-bold uppercase">Jobs Done</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-2xl">
                         <p className="text-lg font-black text-gray-900">₹{Math.round(summary.allTime.totalCollection/1000)}k</p>
                         <p className="text-[10px] text-gray-500 font-bold uppercase">Collected</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
             <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-600" /> Success Trends
             </h3>
             <div className="flex items-end justify-between h-32 gap-2">
                {trends?.map(t => (
                  <div key={t.month} className="flex-1 group relative">
                    <div 
                      className="bg-blue-600 rounded-t-lg transition-all duration-300 transform group-hover:scale-x-110 group-hover:bg-blue-700"
                      style={{ height: `${Math.max(10, (t.completed / (Math.max(...trends.map(x=>x.completed)) || 1)) * 100)}%` }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                       {t.completed} Jobs
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold text-center mt-2 group-hover:text-blue-600 transition-colors">{t.month}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Columns: Tables */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Tasks with Location Tracking */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <CheckSquare size={18} className="text-green-600" /> Operational History
              </h3>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Last 10 Actions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100">
                    <th className="px-6 py-4">Client / Site</th>
                    <th className="px-6 py-4">Completion Status</th>
                    <th className="px-6 py-4 text-right">GPS Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentTasks.length === 0 && <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">No task operations recorded for this profile yet.</td></tr>}
                  {recentTasks.map(t => (
                    <tr key={t._id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-black text-gray-900">{t.clientName}</p>
                        <p className="text-xs text-gray-500 font-semibold">{new Date(t.date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          t.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {t.status === 'Completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {t.completionLocation?.lat ? (
                          <div className="flex flex-col items-end gap-1">
                            <a 
                              href={`https://www.google.com/maps?q=${t.completionLocation.lat},${t.completionLocation.lng}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-blue-600 hover:text-blue-800 text-xs font-black flex items-center gap-1.5 transition-colors"
                            >
                              <MapPin size={14} /> SITE LINK
                            </a>
                            {t.completedAt && (
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                  {new Date(t.completedAt).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})} Verification
                               </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-[10px] font-black italic">NOT CAPTURED</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Recent Attendance */}
             <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-600" /> Attendance Log
                  </h3>
                </div>
                <div className="p-2 space-y-1">
                   {recentAttendance.length === 0 && <div className="p-8 text-center text-gray-400 text-xs italic">No check-ins</div>}
                   {recentAttendance.map(a => (
                     <div key={a._id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 group">
                        <div>
                           <p className="text-sm font-black text-gray-900">{new Date(a.createdAt).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}</p>
                           <p className="text-xs text-gray-400 font-bold">{new Date(a.createdAt).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})}</p>
                        </div>
                        {a.location?.lat && (
                           <a 
                            href={`https://www.google.com/maps?q=${a.location.lat},${a.location.lng}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center transition-all hover:bg-blue-600 hover:text-white"
                           >
                            <MapPin size={16} />
                           </a>
                        )}
                     </div>
                   ))}
                </div>
             </div>

             {/* Recent Transactions */}
             <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp size={18} className="text-orange-600" /> Transfers
                  </h3>
                </div>
                <div className="p-2 space-y-1">
                   {recentTransactions.length === 0 && <div className="p-8 text-center text-gray-400 text-xs italic">No finance logs</div>}
                   {recentTransactions.map(t => (
                     <div key={t._id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50">
                        <div>
                           <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                              t.type === 'Salary' ? 'bg-green-100 text-green-700' : t.type === 'Collection' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                           }`}>{t.type}</span>
                           <p className="text-xs text-gray-400 font-bold mt-1">{new Date(t.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <p className={`font-black ${t.type === 'Collection' ? 'text-blue-600' : 'text-gray-900'}`}>₹{t.amount.toLocaleString()}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetail;
