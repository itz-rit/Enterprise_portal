import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Calendar, ChevronRight, Plus, Search, Trash2, User, Users, MapPin, Zap, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AREAS = ['ALL', 'PENNAGARAM', 'PALACODE', 'K-GIRI', 'HARUR', 'THOPPUR', 'PAPIREDIPATTI', 'POCHAMPALLI', 'HOSUR', 'LOCAL DPI'];
const COLS = ['Pending', 'In Progress', 'Completed'];

const badgeClass = {
  Pending: 'badge badge-amber',
  'In Progress': 'badge badge-blue',
  Completed: 'badge badge-teal',
};

const TaskManagement = () => {
  const { api } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [search, setSearch] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskDateFilter, setTaskDateFilter] = useState('');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('ALL');

  // Full Modal State
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', date: '', assignedTo: '', area: '', contactNumber: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Quick Assign State
  const [quickAssignId, setQuickAssignId] = useState(null);
  const [quickForm, setQuickForm] = useState({ title: '', priority: 'Medium' });
  const [quickSaving, setQuickSaving] = useState(false);

  // Transfer state
  const [transferModal, setTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState(null);
  const [transferForm, setTransferForm] = useState({ newStaffId: '', note: '' });
  const [transferring, setTransferring] = useState(false);

  // Notes modal state
  const [notesModal, setNotesModal] = useState(false);
  const [notesTarget, setNotesTarget] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const res = await api('get', '/api/admin/tasks');
      setTasks(res.data.tasks || []);
    } catch (e) {
      console.error('Failed to load tasks', e);
    }
  }, [api]);

  const loadStaff = useCallback(async () => {
    try {
      const res = await api('get', '/api/admin/users');
      setAllStaff(res.data.filter((member) => member.role === 'Staff'));
    } catch (e) {
      console.error('Failed to load staff', e);
    }
  }, [api]);

  useEffect(() => { loadTasks(); }, [loadTasks]);
  useEffect(() => { loadStaff(); }, [loadStaff]);

  // Compute per-staff task counts
  const staffTaskStats = allStaff.map(s => {
    const staffTasks = tasks.filter(t => t.assignedTo?._id === s._id);
    return {
      _id: s._id,
      name: s.name,
      area: s.area,
      total: staffTasks.length,
      pending: staffTasks.filter(t => t.status === 'Pending').length,
      inProgress: staffTasks.filter(t => t.status === 'In Progress').length,
      completed: staffTasks.filter(t => t.status === 'Completed').length,
    };
  }).filter(s => s.total > 0);

  // Filter staff STRICTLY by selected area
  const filteredStaff = allStaff.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase());
    if (selectedArea === 'ALL') return matchSearch;
    
    // Show staff if their profile matches OR if they have tasks assigned in this area
    const matchesProfileArea = (s.area || '').toUpperCase() === selectedArea;
    const hasTaskInArea = tasks.some(t => t.assignedTo?._id === s._id && (t.area || '').toUpperCase() === selectedArea);
    
    return (matchesProfileArea || hasTaskInArea) && matchSearch;
  });

  // Open modal from HEADER button (no pre-fill)
  const openNewTaskModal = () => {
    setForm({ title: '', description: '', priority: 'Medium', date: new Date().toISOString().split('T')[0], assignedTo: '', area: selectedArea === 'ALL' ? '' : selectedArea, contactNumber: '' });
    setError('');
    setModal(true);
  };

  // Open modal from staff card (pre-fill staff + area)
  const openAssignModal = (member) => {
    setForm({
      title: '', description: '', priority: 'Medium',
      date: new Date().toISOString().split('T')[0],
      assignedTo: member._id,
      area: member.area || (selectedArea === 'ALL' ? '' : selectedArea),
      contactNumber: ''
    });
    setError('');
    setModal(true);
  };

  const handleCreate = async () => {
    if (!form.title || !form.assignedTo) {
      setError('Task Title and Assigned Staff are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api('post', '/api/admin/tasks', { ...form, staffId: form.assignedTo });
      setModal(false);
      await loadTasks();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAssign = async (memberId) => {
    if (!quickForm.title) { alert("Task title is required"); return; }
    setQuickSaving(true);
    try {
      await api('post', '/api/admin/tasks', {
        title: quickForm.title, description: 'Quick assigned task',
        staffId: memberId, area: selectedArea === 'ALL' ? '' : selectedArea,
        priority: quickForm.priority, date: new Date().toISOString().split('T')[0]
      });
      setQuickAssignId(null);
      setQuickForm({ title: '', priority: 'Medium' });
      await loadTasks();
    } catch(e) { alert("Failed to quick assign"); } finally { setQuickSaving(false); }
  };

  const changeStatus = async (id, status) => {
    try { await api('put', `/api/admin/tasks/${id}`, { status }); await loadTasks(); }
    catch { alert('Status update failed'); }
  };

  const changePriority = async (id, priority) => {
    try { await api('put', `/api/admin/tasks/${id}`, { priority }); await loadTasks(); }
    catch { alert('Priority update failed'); }
  };

  const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

  const handleUpdateNotes = async () => {
    if (!notesTarget) return;
    setNotesSaving(true);
    try {
      await api('put', `/api/admin/tasks/${notesTarget._id}`, { notes: notesText });
      setNotesModal(false);
      setNotesTarget(null);
      await loadTasks();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update notes');
    } finally {
      setNotesSaving(false);
    }
  };

  const removeTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await api('delete', `/api/admin/tasks/${id}`); await loadTasks(); }
    catch { alert('Delete failed'); }
  };

  const handleTransfer = async () => {
    if (!transferForm.newStaffId) { return alert('Please select a new staff member.'); }
    setTransferring(true);
    try {
      await api('put', `/api/admin/tasks/${transferTarget._id}/transfer`, transferForm);
      setTransferModal(false); setTransferTarget(null); setTransferForm({ newStaffId: '', note: '' });
      await loadTasks();
    } catch (e) { alert(e.response?.data?.message || 'Transfer failed'); } finally { setTransferring(false); }
  };

  return (
    <div className="stack-lg">
      {/* PAGE HEADER WITH ASSIGN BUTTON */}
      <section className="page-head">
        <div>
          <h1>Task & Area Management</h1>
          <p>Assign tasks efficiently based on staff operating areas.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '12px' }}>
          <button type="button" className="btn btn-danger" onClick={() => alert('Emergency Call Option: Feature Coming Soon!')} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
            <AlertCircle size={16} />
            Emergency SOS
          </button>
          <button type="button" className="btn btn-brand" onClick={openNewTaskModal}>
            <Plus size={16} />
            Assign New Task
          </button>
        </div>
      </section>

      {/* STAFF TASK OVERVIEW - click to filter kanban */}
      {staffTaskStats.length > 0 && (
        <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Users size={12} className="text-blue-600" /> Staff Task Overview
              </h3>
              <p className="text-[9px] text-slate-400 font-bold mt-1">Click a staff card to filter the Kanban board</p>
            </div>
            {selectedStaffFilter !== 'ALL' && (
              <button
                onClick={() => setSelectedStaffFilter('ALL')}
                className="text-[10px] font-black px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest"
              >
                Clear Filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {staffTaskStats.map(s => (
              <button
                key={s._id}
                onClick={() => setSelectedStaffFilter(selectedStaffFilter === s._id ? 'ALL' : s._id)}
                className={`text-left p-5 rounded-[1.5rem] border transition-all duration-300 ${
                  selectedStaffFilter === s._id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105'
                    : 'bg-slate-50 border-slate-100 hover:border-blue-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                    selectedStaffFilter === s._id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {s.name[0]}
                  </div>
                  <div>
                    <p className={`text-[11px] font-black uppercase tracking-tight leading-none ${
                      selectedStaffFilter === s._id ? 'text-white' : 'text-slate-900'
                    }`}>{s.name.split(' ')[0]}</p>
                    <p className={`text-[9px] font-bold mt-0.5 ${
                      selectedStaffFilter === s._id ? 'text-blue-100' : 'text-slate-400'
                    }`}>{s.area || 'Field'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className={`rounded-lg p-1 text-center ${
                    selectedStaffFilter === s._id ? 'bg-white/10' : 'bg-amber-50'
                  }`}>
                    <p className={`text-sm font-black ${
                      selectedStaffFilter === s._id ? 'text-white' : 'text-amber-600'
                    }`}>{s.pending}</p>
                    <p className={`text-[7px] font-black uppercase ${
                      selectedStaffFilter === s._id ? 'text-blue-100' : 'text-amber-400'
                    }`}>Pend</p>
                  </div>
                  <div className={`rounded-lg p-1 text-center ${
                    selectedStaffFilter === s._id ? 'bg-white/10' : 'bg-blue-50'
                  }`}>
                    <p className={`text-sm font-black ${
                      selectedStaffFilter === s._id ? 'text-white' : 'text-blue-600'
                    }`}>{s.inProgress}</p>
                    <p className={`text-[7px] font-black uppercase ${
                      selectedStaffFilter === s._id ? 'text-blue-100' : 'text-blue-400'
                    }`}>Prog</p>
                  </div>
                  <div className={`rounded-lg p-1 text-center ${
                    selectedStaffFilter === s._id ? 'bg-white/10' : 'bg-emerald-50'
                  }`}>
                    <p className={`text-sm font-black ${
                      selectedStaffFilter === s._id ? 'text-white' : 'text-emerald-600'
                    }`}>{s.completed}</p>
                    <p className={`text-[7px] font-black uppercase ${
                      selectedStaffFilter === s._id ? 'text-blue-100' : 'text-emerald-400'
                    }`}>Done</p>
                  </div>
                </div>
                <div className={`mt-3 pt-2 border-t ${
                  selectedStaffFilter === s._id ? 'border-white/20' : 'border-slate-100'
                }`}>
                  <p className={`text-[10px] font-black ${
                    selectedStaffFilter === s._id ? 'text-blue-100' : 'text-slate-400'
                  }`}>{s.total} Total Tasks</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* PRE-COMMAND CENTER: AREA & DATE FILTERS */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col xl:flex-row gap-10">
          
          {/* Territory Filter */}
          <div className="flex-1">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <MapPin size={12} className="text-blue-600" /> Operational Territory
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {AREAS.map(area => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
                    selectedArea === area 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Temporal Filter */}
          <div className="xl:w-[320px]">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Calendar size={12} className="text-blue-600" /> Temporal Filter
            </h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="date" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-xs font-black text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={taskDateFilter} 
                  onChange={(e) => setTaskDateFilter(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setTaskDateFilter('')}
                className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                {selectedArea === 'ALL' ? 'Global Command' : `${selectedArea} Sector`}
              </h3>
              <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
                {filteredStaff.length} Licensed Personnel Found
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-3.5 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white outline-none transition-all"
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by personnel name..."
            />
          </div>
        </div>
      </section>

      {/* KANBAN BOARD */}
      <section style={{ marginTop: '20px' }}>
        {/* Staff Filter Dropdown for Kanban */}
        <div className="bg-white rounded-[2rem] px-6 py-4 border border-slate-100 shadow-sm mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users size={16} />
            </div>
            <div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Task Board</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {selectedStaffFilter === 'ALL'
                  ? `Showing all ${tasks.filter(t => !taskDateFilter || new Date(t.date).toISOString().split('T')[0] === taskDateFilter).length} tasks`
                  : `Filtered by: ${allStaff.find(s => s._id === selectedStaffFilter)?.name || 'Staff'}`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                placeholder="Search tasks..."
                className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-w-[160px]"
              />
            </div>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                id="staff-kanban-filter"
                value={selectedStaffFilter}
                onChange={(e) => setSelectedStaffFilter(e.target.value)}
                className="pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black text-slate-700 uppercase tracking-wider focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer min-w-[200px]"
              >
                <option value="ALL">All Staff</option>
                {staffTaskStats.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.total} tasks)
                  </option>
                ))}
              </select>
              <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
            </div>
            {selectedStaffFilter !== 'ALL' && (
              <button
                onClick={() => setSelectedStaffFilter('ALL')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="triple-grid">
        {COLS.map((column) => {
          let columnTasks = tasks.filter((task) => task.status === column);
          
          if (selectedArea !== 'ALL') {
            columnTasks = columnTasks.filter(task => 
              (task.area || '').toUpperCase() === selectedArea || 
              (task.assignedTo?.area || '').toUpperCase() === selectedArea
            );
          }

          if (taskDateFilter) {
            columnTasks = columnTasks.filter(task => {
              if (!task.date) return false;
              const taskDate = new Date(task.date).toISOString().split('T')[0];
              return taskDate === taskDateFilter;
            });
          }
          if (selectedStaffFilter !== 'ALL') {
            columnTasks = columnTasks.filter(task => task.assignedTo?._id === selectedStaffFilter);
          }
          if (taskSearch) {
            columnTasks = columnTasks.filter(task => 
              (task.title?.toLowerCase() || '').includes(taskSearch.toLowerCase()) || 
              (task.clientName?.toLowerCase() || '').includes(taskSearch.toLowerCase())
            );
          }
          return (
            <div key={column} className="panel">
              <div className="section-bar">
                <h3>{column}</h3>
                <span className={badgeClass[column]}>{columnTasks.length}</span>
              </div>
              <div className="section-body" style={{ display: 'grid', gap: 14 }}>
                {!columnTasks.length ? (
                  <div className="soft-card" style={{ color: 'var(--muted)' }}>No tasks in this stage.</div>
                ) : (
                  columnTasks.map((task) => (
                    <article key={task._id} className="soft-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{task.title || task.clientName}</h4>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--muted)', marginTop: 8, fontSize: '.84rem' }}>
                            <User size={14} />
                            {task.assignedTo?.name || 'Unassigned'}
                            {task.area && <span className="badge" style={{fontSize: '0.7rem', backgroundColor: '#f1f5f9', color: '#475569'}}>{task.area}</span>}
                            {task.priority && <span className={`badge ${task.priority === 'Urgent' ? '' : task.priority === 'High' ? 'badge-amber' : 'badge-blue'}`} style={task.priority === 'Urgent' ? {backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 800} : {fontSize: '0.7rem'}}>{task.priority === 'Urgent' ? '🔴 URGENT' : task.priority}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="button" className="btn btn-neutral" style={{ padding: '8px 12px' }} onClick={() => { setNotesTarget(task); setNotesText(task.notes || task.description || ''); setNotesModal(true); }} title="Add / Update Note">
                            📝
                          </button>
                          <button type="button" className="btn btn-neutral" style={{ padding: '8px 12px' }} onClick={() => { setTransferTarget(task); setTransferModal(true); }} title="Transfer Task">
                            <ArrowRightLeft size={14} />
                          </button>
                          <button type="button" className="btn btn-danger" style={{ padding: '8px 12px' }} onClick={() => removeTask(task._id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div style={{ marginTop: 14, color: '#000000', fontSize: '.9rem', fontWeight: 700, lineHeight: 1.7, letterSpacing: '0.01em' }}>
                        {task.description || task.notes || 'No notes added.'}
                      </div>

                      <div style={{ marginTop: 12, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {task.contactNumber && task.contactNumber !== 'N/A' && (
                          <a href={`tel:${task.contactNumber}`} className="badge" style={{ 
                            backgroundColor: '#22c55e', 
                            color: '#ffffff', 
                            border: 'none', 
                            textDecoration: 'none', 
                            padding: '6px 14px', 
                            borderRadius: '99px',
                            fontWeight: 900,
                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            letterSpacing: '0.02em'
                          }}>
                            📞 CALL {task.contactNumber}
                          </a>
                        )}

                      </div>

                      <div className="relative" style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                        <select className="select-shell" value={task.status} onChange={(e) => changeStatus(task._id, e.target.value)} style={{ flex: 1 }}>
                          {COLS.map((status) => (<option key={status} value={status}>{status}</option>))}
                        </select>
                        <select className="select-shell" value={task.priority} onChange={(e) => changePriority(task._id, e.target.value)} style={{ flex: 1 }}>
                          {PRIORITIES.map((p) => (<option key={p} value={p}>{p}</option>))}
                        </select>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          );
        })}
        </div>
      </section>

      {/* FULL ASSIGN TASK MODAL */}
      {modal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-head">
              <h3>Assign New Task</h3>
              <p>Create a job and assign it to a staff member.</p>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-error" style={{ marginBottom: 18 }}>
                  <AlertCircle size={16} style={{ marginRight: 8 }} />{error}
                </div>
              )}
              <div className="stack-md">
                <div>
                  <label className="field-label">Task Title *</label>
                  <input className="input-shell" value={form.title} onChange={(e) => setForm((x) => ({ ...x, title: e.target.value }))} autoFocus placeholder="e.g. Deliver documents to client" />
                </div>
                <div className="dual-grid">
                  <div>
                    <label className="field-label">Assign To *</label>
                    <select className="select-shell" value={form.assignedTo} onChange={(e) => setForm((x) => ({ ...x, assignedTo: e.target.value }))}>
                      <option value="">Select staff member</option>
                      {allStaff.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.name} {member.area ? `(${member.area})` : `(${member.phone})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Area</label>
                    <select className="select-shell" value={form.area} onChange={(e) => setForm((x) => ({ ...x, area: e.target.value }))}>
                      <option value="">No Area</option>
                      {AREAS.filter(a => a !== 'ALL').map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div className="dual-grid">
                  <div>
                    <label className="field-label">Priority</label>
                    <select className="select-shell" value={form.priority} onChange={(e) => setForm((x) => ({ ...x, priority: e.target.value }))}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Target Date</label>
                    <input type="date" className="input-shell" value={form.date} onChange={(e) => setForm((x) => ({ ...x, date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="field-label">Contact Number (Optional)</label>
                  <input type="tel" className="input-shell" value={form.contactNumber} onChange={(e) => setForm((x) => ({ ...x, contactNumber: e.target.value }))} placeholder="e.g. 9876543210" />
                </div>
                <div>
                  <label className="field-label">Detailed Instructions</label>
                  <textarea className="textarea-shell" rows={4} value={form.description} onChange={(e) => setForm((x) => ({ ...x, description: e.target.value }))} placeholder="Add any special instructions..." />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-neutral" onClick={() => setModal(false)}>Cancel</button>
              <button type="button" className="btn btn-brand" onClick={handleCreate} disabled={saving}>
                {saving ? 'Assigning...' : 'Assign Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER TASK MODAL */}
      {transferModal && transferTarget && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-head">
              <h3>Transfer Task</h3>
              <p>Reassign <strong>{transferTarget.title || transferTarget.clientName}</strong> to another staff member.</p>
            </div>
            <div className="modal-body">
              <div className="stack-md">
                <div>
                  <label className="field-label">Current Staff</label>
                  <div className="input-shell" style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 600 }}>
                    {transferTarget.assignedTo?.name || 'Unassigned'}
                  </div>
                </div>
                <div>
                  <label className="field-label">Transfer To</label>
                  <select className="select-shell" value={transferForm.newStaffId} onChange={(e) => setTransferForm(prev => ({ ...prev, newStaffId: e.target.value }))}>
                    <option value="">Select new staff</option>
                    {allStaff.filter(s => s._id !== transferTarget.assignedTo?._id).map((member) => (
                      <option key={member._id} value={member._id}>{member.name} {member.area ? `(${member.area})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Reason / Note (Optional)</label>
                  <textarea className="textarea-shell" placeholder="Why are you transferring this task?"
                    value={transferForm.note} onChange={(e) => setTransferForm(prev => ({ ...prev, note: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-neutral" onClick={() => setTransferModal(false)}>Cancel</button>
              <button type="button" className="btn btn-brand" onClick={handleTransfer} disabled={transferring}>
                {transferring ? 'Transferring...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTES MODAL */}
      {notesModal && notesTarget && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-head">
              <h3>Update Commentary</h3>
              <p>Add or update notes for <strong>{notesTarget.title || notesTarget.clientName}</strong></p>
            </div>
            <div className="modal-body">
              <div className="stack-md">
                <div>
                  <label className="field-label">Commentary / Notes</label>
                  <textarea className="textarea-shell" rows={6} value={notesText} onChange={(e) => setNotesText(e.target.value)} placeholder="Enter your commentary here..." />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-neutral" onClick={() => setNotesModal(false)}>Cancel</button>
              <button type="button" className="btn btn-brand" onClick={handleUpdateNotes} disabled={notesSaving}>
                {notesSaving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
