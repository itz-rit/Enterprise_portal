import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Calendar, MapPin, RefreshCcw, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AttendanceModule = () => {
  const { api } = useAuth();
  const [records, setRecords] = useState([]);
  const [staff, setStaff] = useState([]);
  const [filters, setFilters] = useState({ userId: '', date: '' });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.date) params.append('date', filters.date);
      const [aRes, uRes] = await Promise.all([
        api('get', `/api/admin/attendance${params.toString() ? `?${params}` : ''}`),
        api('get', '/api/admin/users'),
      ]);
      setRecords(aRes.data);
      setStaff(uRes.data.filter((member) => member.role === 'Staff'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [api, filters.date, filters.userId]);

  useEffect(() => {
    load();
  }, [load]);

  const clearFilters = () => {
    setFilters({ userId: '', date: '' });
    setTimeout(load, 50);
  };

  return (
    <div className="stack-lg">
      <section className="page-head">
        <div>
          <h1>Attendance Control</h1>
          <p>Review staff check-ins, filter daily activity and verify GPS-backed attendance records.</p>
        </div>
        <div className="page-actions">
          <div className="chip">
            <Activity size={14} />
            Live Monitoring
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-body">
          <div className="dual-grid">
            <div>
              <label className="field-label">Staff Member</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  className="select-shell"
                  style={{ paddingLeft: 42 }}
                  value={filters.userId}
                  onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value }))}
                >
                  <option value="">All field staff</option>
                  {staff.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="field-label">Date</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  className="input-shell"
                  style={{ paddingLeft: 42 }}
                  value={filters.date}
                  onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="page-actions" style={{ marginTop: 18 }}>
            <button type="button" className="btn btn-brand" onClick={load}>
              <Search size={16} />
              Apply Filters
            </button>
            <button type="button" className="btn btn-neutral" onClick={clearFilters}>
              <RefreshCcw size={16} />
              Clear
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-bar">
          <h3>Attendance Records</h3>
          <div className="chip">{loading ? 'Syncing...' : `${records.length} entries`}</div>
        </div>
        <div className="section-body" style={{ paddingTop: 18 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Timestamp</th>
                  <th>Location</th>
                  <th>Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      Loading attendance records...
                    </td>
                  </tr>
                ) : !records.length ? (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      No records found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record._id}>
                      <td>{record.userId?.name || 'Unknown'}</td>
                      <td>
                        <div>{new Date(record.createdAt).toLocaleDateString('en-IN')}</div>
                        <div style={{ color: 'var(--muted)', fontSize: '.82rem', marginTop: 4 }}>
                          {new Date(record.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        {record.location?.lat ? (
                          <a
                            href={`https://www.google.com/maps?q=${record.location.lat},${record.location.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="badge badge-blue"
                          >
                            <MapPin size={12} />
                            Open Map
                          </a>
                        ) : (
                          <span className="badge badge-slate">Unavailable</span>
                        )}
                      </td>
                      <td>{record.notes || 'No notes'}</td>
                      <td>
                        <span className="badge badge-teal">Present</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AttendanceModule;
