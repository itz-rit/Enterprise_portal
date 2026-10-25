import React, { useState, useEffect } from 'react';
import communiService from '../config/communiService';
import { useAuth } from '../context/AuthContext';
import { Trash2, Clock } from 'lucide-react';

const CommunicationManager = () => {
  const { user } = useAuth();
  const token = user?.token;
  const [reward, setReward] = useState({ title: '', description: '' });
  const [notice, setNotice] = useState({ title: '', message: '' });
  const [task, setTask] = useState({ title: '', description: '', assigned_to: '' });
  const [status, setStatus] = useState('');
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const data = await communiService.getNotices();
      setNotices(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRewardSubmit = async (e) => {
    e.preventDefault();
    try {
      await communiService.upsertReward({ ...reward, date: new Date().toISOString() }, token);
      setStatus('Reward updated successfully!');
      setReward({ title: '', description: '' });
    } catch (err) {
      setStatus('Error updating reward');
    }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    try {
      await communiService.createNotice(notice, token);
      setStatus('Notice posted successfully!');
      setNotice({ title: '', message: '' });
      fetchNotices();
    } catch (err) {
      setStatus('Error posting notice');
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        await communiService.deleteNotice(noticeId, token);
        setStatus('Notice deleted successfully!');
        fetchNotices();
      } catch (err) {
        setStatus('Error deleting notice');
      }
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      await communiService.createTask({ ...task, date: new Date().toISOString() }, token);
      setStatus('Task assigned successfully!');
      setTask({ title: '', description: '', assigned_to: '' });
    } catch (err) {
      setStatus('Error assigning task');
    }
  };

  return (
    <div className="stack-md">
      {status && <div className="alert alert-success">{status}</div>}

      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {/* Reward Section */}
        <section className="panel">
          <div className="section-bar">
            <h3>Today's Reward</h3>
          </div>
          <div className="section-body">
            <form onSubmit={handleRewardSubmit} className="stack-md">
              <input 
                className="input-shell"
                placeholder="Reward Title"
                value={reward.title}
                onChange={(e) => setReward({...reward, title: e.target.value})}
                required
              />
              <textarea 
                className="textarea-shell"
                placeholder="Description"
                value={reward.description}
                onChange={(e) => setReward({...reward, description: e.target.value})}
                required
              />
              <button className="btn btn-brand w-full">Set Reward</button>
            </form>
          </div>
        </section>

        {/* Task Section */}
        <section className="panel">
          <div className="section-bar">
            <h3>Assign Quick Task</h3>
          </div>
          <div className="section-body">
            <form onSubmit={handleTaskSubmit} className="stack-md">
              <input 
                className="input-shell"
                placeholder="Task Title"
                value={task.title}
                onChange={(e) => setTask({...task, title: e.target.value})}
                required
              />
              <input 
                className="input-shell"
                placeholder="Staff User ID"
                value={task.assigned_to}
                onChange={(e) => setTask({...task, assigned_to: e.target.value})}
                required
              />
              <textarea 
                className="textarea-shell"
                placeholder="Instructions"
                value={task.description}
                onChange={(e) => setTask({...task, description: e.target.value})}
                required
              />
              <button className="btn btn-brand w-full" style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>Assign Task</button>
            </form>
          </div>
        </section>

        {/* Notice Section */}
        <section className="panel">
          <div className="section-bar">
            <h3>Notice Board</h3>
          </div>
          <div className="section-body">
            <form onSubmit={handleNoticeSubmit} className="stack-md">
              <input 
                className="input-shell"
                placeholder="Notice Title"
                value={notice.title}
                onChange={(e) => setNotice({...notice, title: e.target.value})}
                required
              />
              <textarea 
                className="textarea-shell"
                placeholder="Message"
                value={notice.message}
                onChange={(e) => setNotice({...notice, message: e.target.value})}
                required
              />
              <button className="btn btn-brand w-full" style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>Post Notice</button>
            </form>

            <div className="mt-6 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Notices</h4>
              {!notices.length ? (
                <p className="text-xs text-slate-400 italic">No active notices</p>
              ) : (
                notices.map(n => (
                  <div key={n._id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl relative group">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-slate-800 text-[13px] mb-1">{n.title}</h5>
                        <p className="text-[11px] text-slate-500 leading-tight mb-2">{n.message}</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                          <Clock size={10} />
                          {new Date(n.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleDeleteNotice(n._id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Notice"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CommunicationManager;
