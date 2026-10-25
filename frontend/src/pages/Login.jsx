import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin Login | Pradeep Enterprises";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <section className="auth-showcase">
          {/* Brand Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
            <img
              src="/logoPE.jpeg"
              alt="Pradeep Enterprises"
              style={{
                width: 160,
                height: 160,
                objectFit: 'contain',
                borderRadius: '50%', // Assuming the uploaded image has a dark bg or needs neat rounding
                boxShadow: '0 0 24px rgba(212,160,23,0.55)',
              }}
            />
          </div>

          <div className="auth-kicker">
            <ShieldCheck size={16} />
            Admin Control Room
          </div>
          <h1>Sharper operations, cleaner control, better oversight.</h1>
          <p>
            Manage field teams, assign work, monitor attendance, track finances and keep inventory aligned from a
            single polished dashboard.
          </p>

          <div className="auth-stat-grid">
            <div className="auth-stat">
              <strong>Live</strong>
              <span>Attendance, task and finance signals in one place.</span>
            </div>
            <div className="auth-stat">
              <strong>Fast</strong>
              <span>Quick actions for staff, inventory and settlement workflows.</span>
            </div>
            <div className="auth-stat">
              <strong>Secure</strong>
              <span>Admin-only access with staff portal routed separately.</span>
            </div>
            <div className="auth-stat">
              <strong>Support</strong>
              <span>7010425239 / 9384424111</span>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          {/* Logo on right panel (mobile – shows when showcase is hidden) */}
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
            <h2>Admin Login</h2>
            <p>Sign in to continue to the Pradeep Enterprises command center.</p>
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
                  placeholder="Enter admin phone number"
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
              {loading ? 'Signing in...' : 'Enter Admin Dashboard'}
              {!loading ? <ArrowRight size={16} /> : null}
            </button>
          </form>

          <div className="soft-card" style={{ marginTop: 26 }}>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '.9rem' }}>
              Staff login:
              {' '}
              <Link to="/staff-login" className="auth-link">
                Open staff portal
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
