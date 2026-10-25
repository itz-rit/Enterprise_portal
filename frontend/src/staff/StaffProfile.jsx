import React, { useEffect, useState } from 'react';
import { IndianRupee, Phone, ShieldCheck, TrendingUp, Wallet, Award } from 'lucide-react';
import { useStaffAuth } from '../context/StaffAuthContext';

const StaffProfile = () => {
  const { staffUser, api, refreshProfile } = useStaffAuth();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api('get', '/api/staff/transactions');
        setTxns(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  useEffect(() => {
    // Immediately fetch fresh profile on mount (gets latest advanceAmount from DB)
    console.log('[StaffProfile] staffUser from context:', staffUser);
    refreshProfile().then(fresh => {
      console.log('[StaffProfile] refreshed profile. Advance:', fresh?.advanceOutstanding);
    }).catch(err => console.error('[StaffProfile] refresh error:', err));

    const interval = setInterval(() => {
      refreshProfile();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshProfile]); // eslint-disable-line

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthlySalary = txns
    .filter((t) => t.type === 'Salary' && new Date(t.createdAt).getFullYear() === thisYear && new Date(t.createdAt).getMonth() === thisMonth)
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyCollections = txns
    .filter((t) => t.type === 'Collection' && new Date(t.createdAt).getFullYear() === thisYear && new Date(t.createdAt).getMonth() === thisMonth)
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyIncentive = txns
    .filter((t) => t.type === 'Incentive' && new Date(t.createdAt).getFullYear() === thisYear && new Date(t.createdAt).getMonth() === thisMonth)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSalary = txns.filter((t) => t.type === 'Salary').reduce((sum, t) => sum + t.amount, 0);

  const cards = [
    { label: 'Base Salary', value: `Rs ${Number(staffUser?.base_salary || 0).toLocaleString()}`, icon: <IndianRupee size={20} />, color: '#dbeafe', text: '#1d4ed8' },
    { label: 'Advance Outstanding', value: `Rs ${Number(staffUser?.advanceOutstanding || 0).toLocaleString()}`, icon: <Wallet size={20} />, color: '#fee2e2', text: '#b91c1c' },
    { label: 'Monthly Salary Paid', value: `Rs ${monthlySalary.toLocaleString()}`, icon: <ShieldCheck size={20} />, color: '#dcfce7', text: '#15803d' },
    { label: 'Monthly Collections', value: `Rs ${monthlyCollections.toLocaleString()}`, icon: <TrendingUp size={20} />, color: '#ccfbf1', text: '#0f766e' },
    { label: 'Special Incentive', value: `Rs ${monthlyIncentive.toLocaleString()}`, icon: <Award size={20} />, color: '#fce7f3', text: '#be185d' },
  ];

  return (
    <div className="stack-lg">
      <section className="hero-card" style={{ background: 'linear-gradient(135deg, #1d4ed8, #0f172a 120%)' }}>
        <div className="page-head" style={{ marginBottom: 0, position: 'relative', zIndex: 1 }}>
          <div>
            <h1>{staffUser?.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.82)' }}>
              Review your account details, salary records and collection history from one cleaner profile page.
            </p>
          </div>
          <div className="page-actions">
            <div className="chip" style={{ background: 'rgba(255,255,255,0.16)', color: 'white', borderColor: 'rgba(255,255,255,0.16)' }}>
              <Phone size={14} />
              {staffUser?.phone}
            </div>
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        {cards.map((card) => (
          <article key={card.label} className="metric-card">
            <div className="metric-icon" style={{ background: card.color, color: card.text }}>
              {card.icon}
            </div>
            <p className="metric-label">{card.label}</p>
            <p className="metric-value">{loading ? '...' : card.value}</p>
            <p className="metric-note">Live staff account data</p>
          </article>
        ))}
      </section>

      <section className="split-grid">
        <div className="panel">
          <div className="section-bar">
            <h3>Identity & Compensation</h3>
          </div>
          <div className="section-body stack-md">
            <div className="soft-card">
              <div className="field-label">Role</div>
              <div style={{ fontWeight: 800 }}>{staffUser?.role}</div>
            </div>
            <div className="soft-card">
              <div className="field-label">Phone Number</div>
              <div style={{ fontWeight: 800 }}>{staffUser?.phone}</div>
            </div>
            <div className="soft-card">
              <div className="field-label">Lifetime Salary Received</div>
              <div style={{ fontWeight: 800 }}>Rs {totalSalary.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="section-bar">
            <h3>Support</h3>
          </div>
          <div className="section-body stack-md">
            <div className="soft-card">
              <div className="field-label">Primary Support</div>
              <div style={{ fontWeight: 800 }}>7010425239</div>
            </div>
            <div className="soft-card">
              <div className="field-label">Secondary Support</div>
              <div style={{ fontWeight: 800 }}>9384424111</div>
            </div>
            <div className="soft-card" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
              Contact admin if salary settlement, advances or task issues need immediate help.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StaffProfile;
