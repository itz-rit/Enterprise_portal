import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Edit2, Phone, Plus, Search, Trash2, UserX, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AREAS = ['PENNAGARAM', 'PALACODE', 'K-GIRI', 'HARUR', 'THOPPUR', 'PAPIREDIPATTI', 'POCHAMPALLI', 'HOSUR', 'LOCAL DPI'];
const EMPTY = { name: '', phone: '', password: '', role: 'Staff', base_salary: '', advanceOutstanding: '', area: '' };

const StaffManagement = () => {
  const { api } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api('get', '/api/admin/users');
      setStaff(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setModal(true);
  };

  const openEdit = (member) => {
    setEditing(member);
    setForm({
      name: member.name,
      phone: member.phone,
      password: '',
      role: member.role,
      area: member.area || '',
      base_salary: member.base_salary || 0,
      advanceOutstanding: member.advanceOutstanding || 0,
    });
    setError('');
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone) {
      setError('Name and phone are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api('put', `/api/admin/users/${editing._id}`, payload);
      } else {
        await api('post', '/api/admin/users', form);
      }
      setModal(false);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api('delete', `/api/admin/users/${deleteConfirm}`);
      setDeleteConfirm(null);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  const toggleActive = async (member) => {
    try {
      await api('put', `/api/admin/users/${member._id}`, { isActive: !member.isActive });
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredStaff = staff.filter((member) => {
    const nameMatch = member.name ? member.name.toLowerCase().includes(search.toLowerCase()) : false;
    const phoneMatch = member.phone ? member.phone.includes(search) : false;
    return nameMatch || phoneMatch;
  });

  return (
    <div className="stack-lg">
      <section className="page-head">
        <div>
          <h1>Staff Management</h1>
          <p>Manage team members, update access, review salary baselines and keep staff records clean.</p>
        </div>
        <div className="page-actions">
          <div className="relative" style={{ minWidth: 280 }}>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone"
              className="search-shell"
              style={{ paddingLeft: 46 }}
            />
          </div>
          <button type="button" className="btn btn-brand" onClick={openCreate}>
            <Plus size={16} />
            Add Staff Member
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="section-bar">
          <h3>Team Directory</h3>
          <div className="chip">{filteredStaff.length} Records</div>
        </div>
        <div className="section-body" style={{ paddingTop: 18 }}>
          {loading ? (
            <div className="empty-state">Loading staff data...</div>
          ) : !filteredStaff.length ? (
            <div className="empty-state">
              <Users size={40} style={{ marginBottom: 14, opacity: 0.28 }} />
              <div>No matching staff records found.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Salary</th>
                    <th>Advance Taken</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => (
                    <tr key={member._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="brand-mark" style={{ width: 42, height: 42, borderRadius: 14, fontSize: '.95rem' }}>
                            {member.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <Link to={`/team/${member._id}`} style={{ fontWeight: 800 }}>
                              {member.name}
                            </Link>
                            <div style={{ color: 'var(--muted)', fontSize: '.82rem', marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                              <Phone size={12} />
                              {member.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'grid', gap: 8 }}>
                          <span className={member.role === 'Admin' ? 'badge badge-blue' : 'badge badge-teal'}>{member.role}</span>
                          {member.area && <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>{member.area}</span>}
                          <span className={member.isActive ? 'badge badge-teal' : 'badge badge-slate'}>
                            {member.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 800 }}>Rs {Number(member.base_salary || 0).toLocaleString()}</td>
                      <td style={{ fontWeight: 800, color: 'var(--danger)' }}>Rs {Number(member.advanceOutstanding || 0).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button type="button" className="btn btn-neutral" onClick={() => openEdit(member)}>
                            <Edit2 size={15} />
                            Edit
                          </button>
                          <button type="button" className="btn btn-neutral" onClick={() => toggleActive(member)}>
                            {member.isActive ? <UserX size={15} /> : <CheckCircle size={15} />}
                            {member.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button type="button" className="btn btn-danger" onClick={() => setDeleteConfirm(member._id)}>
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {modal ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-head">
              <h3>{editing ? 'Edit Staff Member' : 'Add Staff Member'}</h3>
              <p>Keep employee details, access level and salary information updated.</p>
            </div>
            <div className="modal-body">
              {error ? <div className="alert alert-error" style={{ marginBottom: 18 }}>{error}</div> : null}
              <div className="dual-grid">
                <div>
                  <label className="field-label">Full Name</label>
                  <input className="input-shell" value={form.name} onChange={(e) => setField('name', e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Phone Number</label>
                  <input className="input-shell" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Role</label>
                  <select className="select-shell" value={form.role} onChange={(e) => setField('role', e.target.value)}>
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                {form.role === 'Staff' && (
                  <div>
                    <label className="field-label">Assigned Area</label>
                    <select className="select-shell" value={form.area} onChange={(e) => setField('area', e.target.value)}>
                      <option value="">No Area Assigned</option>
                      {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="field-label">Base Salary</label>
                  <input
                    type="number"
                    className="input-shell"
                    value={form.base_salary}
                    onChange={(e) => setField('base_salary', e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Advance Outstanding</label>
                  <input
                    type="number"
                    className="input-shell"
                    value={form.advanceOutstanding}
                    onChange={(e) => setField('advanceOutstanding', e.target.value)}
                  />
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                <label className="field-label">Password</label>
                <input
                  type="password"
                  className="input-shell"
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  placeholder={editing ? 'Leave blank to keep current password' : 'Set account password'}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-neutral" onClick={() => setModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-brand" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Member'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteConfirm ? (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 480 }}>
            <div className="modal-head">
              <h3>Delete Staff Member</h3>
              <p>This will permanently remove the selected user and related history.</p>
            </div>
            <div className="modal-actions" style={{ paddingTop: 24 }}>
              <button type="button" className="btn btn-neutral" onClick={() => setDeleteConfirm(null)}>
                Keep Record
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StaffManagement;
