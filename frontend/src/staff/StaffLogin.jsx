import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, MapPin, Phone } from 'lucide-react';
import { useStaffAuth } from '../context/StaffAuthContext';

const StaffLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useStaffAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/staff');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <section className="auth-showcase" style={{ background: 'linear-gradient(165deg, #0f172a 0%, #0f766e 55%, #0ea5e9 140%)' }}>
          {/* Brand Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
            <img
              src="/logoPE.jpeg"
              alt="Pradeep Enterprises"
              style={{
                width: 150,
                height: 150,
                objectFit: 'contain',
                borderRadius: '50%',
                boxShadow: '0 0 24px rgba(212,160,23,0.55)',
              }}
            />
          </div>

          <div className="auth-kicker">
            <MapPin size={16} />
            Staff Field Portal
          </div>
          <h1>Start the day with a better field workspace.</h1>
          <p>
            Check tasks, mark attendance, review salary details and send progress updates back to HQ from a cleaner,
            easier mobile-friendly portal.
          </p>

          <div className="auth-stat-grid">
            <div className="auth-stat">
              <strong>Tasks</strong>
              <span>See assignments clearly and update status fast.</span>
            </div>
            <div className="auth-stat">
              <strong>Attendance</strong>
              <span>GPS-based check-in tied to daily operations.</span>
            </div>
            <div className="auth-stat">
              <strong>Profile</strong>
              <span>Track salary, advances and your work summary.</span>
            </div>
            <div className="auth-stat">
              <strong>Support</strong>
              <span>7010425239 / 9384424111</span>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
            <img
              src="/logoPE.jpeg"
              alt="Pradeep Enterprises"
              style={{
                width: 90,
                height: 90,
                objectFit: 'contain',
                borderRadius: '50%',
                boxShadow: '0 2px 10px rgba(212,160,23,0.4)',
              }}
            />
          </div>
          <div className="auth-form-title">
            <h2>Staff Login</h2>
            <p>Use your registered mobile number and password to open your field dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error ? <div className="alert alert-error">{error}</div> : null}

            <div>
              <label className="field-label">Phone Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter registered phone number"
                  className="input-shell"
                  style={{ paddingLeft: 46 }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input-shell"
                  style={{ paddingLeft: 46 }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-brand" style={{ width: '100%', padding: '15px 18px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Open Staff Workspace'}
              {!loading ? <ArrowRight size={16} /> : null}
            </button>
          </form>

          <div className="soft-card" style={{ marginTop: 26 }}>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '.9rem' }}>
              Admin login:
              {' '}
              <Link to="/login" className="auth-link">
                Return to admin portal
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StaffLogin;
