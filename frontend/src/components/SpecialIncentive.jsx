import React from 'react';
import { Trash2, CheckCircle, Award, Calendar } from 'lucide-react';

const SpecialIncentive = ({ data = [], isAdmin = false, onDelete }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        background: '#f8fafc',
        borderRadius: '16px',
        border: '1px solid #e2e8f0'
      }}>
        <Award size={40} style={{ margin: '0 auto 16px', color: '#cbd5e1' }} />
        <p style={{ fontFamily: '"Inter", sans-serif', color: '#64748b', fontSize: 'clamp(14px, 2vw, 16px)' }}>
          No special incentives recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
      {data.map((incentive) => (
        <div key={incentive._id} style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          border: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600,
                  fontSize: 'clamp(16px, 2.5vw, 18px)',
                  color: '#0f172a',
                  margin: '0 0 4px 0',
                  lineHeight: 1.2
                }}>
                  Special Incentive
                </h3>
                <p style={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(14px, 2vw, 15px)',
                  color: '#64748b',
                  margin: 0
                }}>
                  {incentive.userId?.name || 'Unknown Staff'}
                </p>
              </div>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#dcfce7',
                color: '#16a34a',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontFamily: '"Inter", sans-serif',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                <CheckCircle size={12} /> Paid
              </span>
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '16px',
              border: '1px solid #f1f5f9'
            }}>
              <p style={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 600,
                fontSize: '12px',
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 4px 0'
              }}>
                Amount Credited
              </p>
              <h2 style={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(28px, 4vw, 36px)',
                color: '#2563eb',
                margin: 0,
                lineHeight: 1
              }}>
                ₹{Number(incentive.amount).toLocaleString()}
              </h2>
            </div>

            {incentive.description && (
              <p style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: 'clamp(13px, 1.5vw, 14px)',
                lineHeight: 1.5,
                color: '#475569',
                marginBottom: '16px'
              }}>
                {incentive.description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '13px', fontFamily: '"Inter", sans-serif' }}>
              <Calendar size={14} />
              {new Date(incentive.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            {isAdmin && (
              <button
                onClick={() => onDelete && onDelete(incentive._id)}
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                onMouseOut={(e) => e.currentTarget.style.background = '#fef2f2'}
              >
                <Trash2 size={14} /> Revoke
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpecialIncentive;
