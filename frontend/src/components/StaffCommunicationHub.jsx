import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, ListChecks } from 'lucide-react';
import communiService from '../config/communiService';
import { useStaffAuth } from '../context/StaffAuthContext';

const StaffCommunicationHub = ({ userId }) => {
  const { staffUser } = useStaffAuth();
  const token = staffUser?.token;
  const [tasks, setTasks] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, token]);

  const fetchData = async () => {
    try {
      const [taskData, noticeData] = await Promise.all([
        communiService.getStaffTasks(userId, token).catch(() => []),
        communiService.getNotices().catch(() => [])
      ]);
      setTasks(taskData);
      setNotices(noticeData);
    } catch (err) {
      console.error("Error fetching communication data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await communiService.completeTask(taskId, token);
      fetchData(); // Refresh tasks
    } catch (err) {
      console.error("Error completing task", err);
    }
  };

  if (loading && tasks.length === 0 && notices.length === 0) {
    return (
      <div className="p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-100 rounded-full w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-slate-50 rounded-2xl w-full" />
          <div className="h-40 bg-slate-50 rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Quick Tasks Panel */}
      <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 md:p-6 flex items-center justify-between border-b border-slate-100">
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
              <ListChecks size={14} className="text-blue-600" /> My Workspace Tasks
            </h3>
            <span className="text-[8px] md:text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-widest border border-blue-100">
              {tasks.length} Active
            </span>
          </div>
          
          <div className="p-3 md:p-6 space-y-2 max-h-[450px] overflow-y-auto custom-scrollbar">
            {!tasks.length ? (
              <div className="py-6 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No urgent tasks</p>
              </div>
            ) : (
              tasks.map(task => (
                <div key={task._id} className={`group p-2.5 rounded-lg md:rounded-xl border transition-all relative overflow-hidden ${
                  task.status === 'Completed' || task.status === 'completed' 
                    ? 'bg-slate-50 border-slate-100 opacity-60' 
                    : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                }`}>
                  <div className={`absolute top-0 left-0 w-1 h-full bg-blue-600 transition-opacity ${
                    task.status === 'Completed' || task.status === 'completed' ? 'opacity-10' : 'opacity-20 group-hover:opacity-100'
                  }`} />
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-[11px] md:text-[12px] mb-0.5 truncate">{task.clientName || task.title}</h4>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 leading-tight uppercase mb-1.5 line-clamp-1">
                        {task.notes || task.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        <Clock size={8} />
                        {task.date ? new Date(task.date).toLocaleDateString('en-IN') : new Date(task.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    {(task.status !== 'Completed' && task.status !== 'completed') && (
                      <button 
                        onClick={() => handleCompleteTask(task._id)}
                        className="h-7 w-7 flex items-center justify-center bg-blue-50 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100 group-hover:border-blue-200 active:scale-95"
                        title="Mark as Done"
                      >
                        <CheckCircle2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notice Board Panel */}
        <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 md:p-6 border-b border-slate-100">
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
              <Bell size={14} className="text-red-500" /> Organization Notices
            </h3>
          </div>
          
          <div className="p-3 md:p-6 space-y-2 max-h-[450px] overflow-y-auto custom-scrollbar">
            {!notices.length ? (
              <div className="py-6 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No notices</p>
              </div>
            ) : (
              notices.map(notice => (
                <div key={notice._id} className="p-2.5 bg-white border border-slate-100 rounded-lg md:rounded-xl relative overflow-hidden group hover:border-slate-200 transition-all">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                  <h4 className="font-black text-slate-900 uppercase tracking-tight text-[11px] md:text-[12px] mb-0.5 truncate">{notice.title}</h4>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 leading-tight uppercase mb-1.5 line-clamp-1">
                    {notice.message}
                  </p>
                  <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    <Clock size={8} />
                    {new Date(notice.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
  );
};


export default StaffCommunicationHub;
