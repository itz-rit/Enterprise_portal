import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Calendar, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { useStaffAuth } from '../context/StaffAuthContext';

const StaffAttendance = () => {
  const { api, staffUser } = useStaffAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api('get', '/api/staff/attendance');
      setRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const todayDone = records.some((entry) => new Date(entry.createdAt).toDateString() === new Date().toDateString());

  const mark = async () => {
    setMarking(true);
    setMsg('');
    setIsError(false);
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 })
      );
      await api('post', '/api/staff/attendance', {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        notes: 'Field check-in via portal',
      });
      setMsg('Attendance marked successfully.');
      await load();
    } catch (e) {
      setIsError(true);
      setMsg(e.response?.data?.message || 'Location access is required for attendance.');
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="stack-lg">
      <section className="page-head">
        <div>
          <h1>Attendance</h1>
          <p>Mark your presence with GPS verification and review your recent check-in history.</p>
        </div>
        <div className="page-actions">
          <div className="chip">
            <ShieldCheck size={14} />
            Secure Session
          </div>
        </div>
      </section>

      <section className="hero-card" style={{ background: 'linear-gradient(135deg, #0f172a, #0f766e 120%)' }}>
        <div className="page-head" style={{ marginBottom: 0, position: 'relative', zIndex: 1 }}>
          <div>
            <h1>{todayDone ? 'Attendance completed for today' : `Start your shift, ${staffUser?.name || ''}`}</h1>
            <p style={{ color: 'rgba(255,255,255,0.82)' }}>
              {todayDone
                ? 'Your check-in is already registered. You can continue with your assigned work.'
                : 'Mark attendance before field work so your shift and payroll records stay aligned.'}
            </p>
          </div>
          {!todayDone ? (
            <button type="button" className="btn btn-neutral" onClick={mark} disabled={marking}>
              <MapPin size={16} />
              {marking ? 'Verifying...' : 'Mark Attendance'}
            </button>
          ) : (
            <div className="chip" style={{ background: 'rgba(255,255,255,0.16)', color: 'white', borderColor: 'rgba(255,255,255,0.16)' }}>
              <Activity size={14} />
              Verified for today
            </div>
          )}
        </div>
      </section>

      {msg ? <div className={`alert ${isError ? 'alert-error' : 'alert-success'}`}>{msg}</div> : null}

      <section className="panel">
        <div className="section-bar">
          <h3>Recent Check-Ins</h3>
          <div className="chip">{loading ? 'Loading...' : `${records.length} records`}</div>
        </div>
        <div className="section-body" style={{ paddingTop: 18 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="empty-state">
                      Loading attendance history...
                    </td>
                  </tr>
                ) : !records.length ? (
                  <tr>
                    <td colSpan={3} className="empty-state">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Calendar size={14} />
                          {new Date(record.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Clock size={14} />
                          {new Date(record.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <span className={record.location?.lat ? 'badge badge-teal' : 'badge badge-amber'}>
                          {record.location?.lat ? 'GPS Verified' : 'Manual'}
                        </span>
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

export default StaffAttendance;
