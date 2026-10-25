import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Edit3,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  ShieldOff,
  X,
  Zap,
} from 'lucide-react';
import { useStaffAuth } from '../context/StaffAuthContext';

/* ─────────────────────────────────────────────────────────────────
   STATUS CONFIG — maps API values to display styles
   API values: 'Pending' | 'In Progress' | 'Completed'
   Priority:   'Urgent'  | 'Medium' | 'Low'
───────────────────────────────────────────────────────────────── */
const STATUS_CFG = {
  Pending:     { label: 'Pending',     color: '#92400e', bg: '#fef3c7', border: '#fcd34d' },
  'In Progress':{ label: 'In Progress', color: '#1e40af', bg: '#dbeafe', border: '#93c5fd' },
  Completed:   { label: 'Completed',   color: '#166534', bg: '#dcfce7', border: '#86efac' },
  EMERGENCY:   { label: 'Emergency',   color: '#ffffff', bg: '#dc2626', border: '#dc2626' },
};

const getStatusCfg = (status, priority) => {
  if (priority === 'Urgent') return STATUS_CFG.EMERGENCY;
  return STATUS_CFG[status] || STATUS_CFG.Pending;
};

/**
 * Determine if GPS is verified:
 * - Task is Completed AND has a completionLocation with valid coords
 */
const isGpsVerified = (task) =>
  task.status === 'Completed' &&
  task.completionLocation &&
  (task.completionLocation.lat || task.completionLocation.coordinates);

const UPDATE_OPTIONS = ['In Progress', 'Completed'];

/* ─── GPS Status Badge ──────────────────────────────────────── */
const GpsBadge = ({ verified }) =>
  verified ? (
    <span style={s.gpsVerified}>
      <ShieldCheck size={11} strokeWidth={2.5} />
      Verified GPS
    </span>
  ) : (
    <span style={s.gpsRequired}>
      <ShieldOff size={11} strokeWidth={2.5} />
      GPS Verification Required
    </span>
  );

/* ─── Single Task Card ──────────────────────────────────────── */
const TaskCard = ({ task, onUpdate, onNote }) => {
  const isEmergency = task.priority === 'Urgent';
  const cfg = getStatusCfg(task.status, task.priority);

  const displayName = task.clientName || task.title || '—';
  const phone       = task.contactNumber && task.contactNumber !== 'N/A' ? task.contactNumber : null;
  const formattedDate = task.date
    ? new Date(task.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'No Date';

  return (
    <article style={{ ...s.card, ...(isEmergency ? s.cardEmergency : s.cardNormal) }}>

      {/* ── HEADER: Name + Status Badge ── */}
      <div style={s.cardHeader}>
        <div style={s.headerLeft}>
          {isEmergency && (
            <span style={s.urgentTag}>
              <Zap size={9} strokeWidth={3} /> URGENT
            </span>
          )}
          <h3 style={s.customerName} title={displayName}>{displayName}</h3>
        </div>

        <span style={{ ...s.statusBadge, background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}` }}>
          {cfg.label}
        </span>
      </div>

      {/* ── DETAILS ROW: Phone · Date · Area ── */}
      <div style={s.detailsRow}>
        {phone && (
          <a href={`tel:${phone}`} style={{ ...s.detailChip, ...s.phoneChip }}>
            📞 CALL {phone}
          </a>
        )}
        <span style={s.detailChip}>
          <Calendar size={11} style={{ color: '#64748b' }} /> {formattedDate}
        </span>
        {task.area && (
          <span style={{ ...s.detailChip, flex: 1, minWidth: 0 }}>
            <MapPin size={11} style={{ color: '#64748b' }} />
            <span style={s.truncate}>{task.area}</span>
          </span>
        )}
      </div>

      {/* ── DESCRIPTION BOX ── */}
      {(task.description || task.notes) && (
        <div style={s.descBox}>
          <p style={s.descText}>{task.description || task.notes}</p>
        </div>
      )}

      {/* ── FOOTER: GPS Status + Update Button ── */}
      <div style={s.footer}>
        <GpsBadge verified={isGpsVerified(task)} />

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onNote(task)}
            style={{ ...s.updateBtn, backgroundColor: '#f1f5f9', color: '#475569', padding: '9px 12px' }}
            aria-label="Add note"
            title="Add / Update note"
          >
            📝
          </button>
          {task.status !== 'Completed' && (
            <button
              onClick={() => onUpdate(task)}
              style={{ ...s.updateBtn, ...(isEmergency ? s.updateBtnRed : s.updateBtnDark) }}
              aria-label="Update task status"
            >
              <Edit3 size={13} strokeWidth={2.5} />
              <span>Update</span>
            </button>
          )}
        </div>

        {task.status === 'Completed' && (
          <span style={s.completedTag}>
            <CheckCircle size={12} /> Done
          </span>
        )}
      </div>
    </article>
  );
};

/* ─── Update Bottom Sheet ───────────────────────────────────── */
const UpdateSheet = ({ task, onClose, onSave, saving }) => {
  const [form, setForm] = useState({ status: task.status || 'In Progress', notes: task.notes || '' });

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={s.sheet} onClick={e => e.stopPropagation()}>

        {/* Sheet Header */}
        <div style={s.sheetHead}>
          <div>
            <p style={s.sheetEyebrow}>Update Task</p>
            <h4 style={s.sheetTitle}>{task.clientName || task.title}</h4>
          </div>
          <button style={s.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        {/* Sheet Body */}
        <div style={s.sheetBody}>
          <label style={s.fieldLabel}>New Status</label>
          <div style={s.statusRow}>
            {UPDATE_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setForm(p => ({ ...p, status: opt }))}
                style={{ ...s.statusPill, ...(form.status === opt ? s.pillActive : s.pillInactive) }}
              >
                {opt}
              </button>
            ))}
          </div>

          <label style={{ ...s.fieldLabel, marginTop: 14 }}>Notes (optional)</label>
          <textarea
            rows={3}
            style={s.notesArea}
            placeholder="Short progress notes..."
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
          />

          {form.status === 'Completed' && (
            <div style={s.gpsNote}>
              <Navigation size={12} />
              GPS location will be captured when you save
            </div>
          )}

          <div style={s.sheetActions}>
            <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button style={s.saveBtn} disabled={saving} onClick={() => onSave(task._id, form)}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page Component ───────────────────────────────────── */
const StaffTasks = () => {
  const { api }                             = useStaffAuth();
  const [tasks, setTasks]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [selected, setSelected]             = useState(null); // task being updated
  const [saving, setSaving]                 = useState(false);
  const [noteTarget, setNoteTarget]         = useState(null);
  const [noteText, setNoteText]             = useState('');
  const [noteSaving, setNoteSaving]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api('get', '/api/staff/tasks');
      // Sort: Urgent first → then Pending → In Progress → Completed
      const sorted = [...data].sort((a, b) => {
        const urgA = a.priority === 'Urgent' ? 0 : 1;
        const urgB = b.priority === 'Urgent' ? 0 : 1;
        if (urgA !== urgB) return urgA - urgB;
        const ord = { Pending: 0, 'In Progress': 1, Completed: 2 };
        return (ord[a.status] ?? 9) - (ord[b.status] ?? 9);
      });
      setTasks(sorted);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load your tasks right now.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (id, form) => {
    setSaving(true);
    const payload = { status: form.status, notes: form.notes };

    if (form.status === 'Completed') {
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 8000 })
        );
        payload.location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch {
        alert('GPS verification is mandatory to complete a task.');
        setSaving(false);
        return;
      }
    }

    try {
      await api('put', `/api/staff/tasks/${id}`, payload);
      setSelected(null);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteTarget) return;
    setNoteSaving(true);
    try {
      await api('put', `/api/staff/tasks/${noteTarget._id}`, { notes: noteText });
      setNoteTarget(null);
      setNoteText('');
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update note');
    } finally {
      setNoteSaving(false);
    }
  };

  /* ── RENDER ── */
  return (
    <div style={s.page}>

      {/* Page Header */}
      <div style={s.pageHead}>
        <div>
          <h1 style={s.pageTitle}>My Tasks</h1>
          <p style={s.pageSub}>Tap Update to change status &amp; send progress</p>
        </div>
        {!loading && (
          <span style={s.countBadge}>
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={s.stateBox}>
          <div style={s.spinner} />
          <span style={s.stateText}>Loading tasks…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={s.errorBox}>
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && !tasks.length && (
        <div style={s.stateBox}>
          <CheckCircle size={36} style={{ color: '#cbd5e1' }} />
          <span style={s.stateText}>No tasks assigned right now</span>
        </div>
      )}

      {/* Card List */}
      {!loading && !error && tasks.length > 0 && (
        <div className="st-card-grid">
          {tasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onUpdate={t => setSelected(t)}
              onNote={t => { setNoteTarget(t); setNoteText(t.notes || ''); }}
            />
          ))}
        </div>
      )}

      {/* Update Bottom Sheet */}
      {selected && (
        <UpdateSheet
          task={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {/* Note Bottom Sheet */}
      {noteTarget && (
        <div style={s.backdrop} onClick={() => setNoteTarget(null)}>
          <div style={s.sheet} onClick={e => e.stopPropagation()}>
            <div style={s.sheetHead}>
              <div>
                <p style={s.sheetEyebrow}>Add / Update Note</p>
                <h4 style={s.sheetTitle}>{noteTarget.clientName || noteTarget.title}</h4>
              </div>
              <button style={s.closeBtn} onClick={() => setNoteTarget(null)}><X size={16} /></button>
            </div>
            <div style={s.sheetBody}>
              <label style={s.fieldLabel}>Commentary / Notes</label>
              <textarea
                rows={5}
                style={s.notesArea}
                placeholder="Enter your commentary..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
              />
              <div style={s.sheetActions}>
                <button style={s.cancelBtn} onClick={() => setNoteTarget(null)}>Cancel</button>
                <button style={s.saveBtn} disabled={noteSaving} onClick={handleSaveNote}>
                  {noteSaving ? 'Saving…' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────
   STYLES — mobile-first inline styles for full isolation
──────────────────────────────────────────────────────────── */
const s = {
  /* ── Page Shell ── */
  page: {
    width: '100%',
    /* extra bottom padding keeps last card above the 64px mobile nav bar */
    paddingBottom: 96,
  },
  pageHead: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    padding: '18px 2px 14px',
  },
  pageTitle: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.03em',
  },
  pageSub: {
    margin: '3px 0 0',
    fontSize: '0.72rem',
    color: '#94a3b8',
  },
  countBadge: {
    flexShrink: 0,
    alignSelf: 'center',
    padding: '4px 11px',
    borderRadius: 999,
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    fontSize: '0.68rem',
    fontWeight: 800,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },

  /* ── Card List — responsive grid via CSS class injected below ── */
  cardList: { /* handled by .st-card-grid class */ },

  /* ── Card Base ── */
  card: {
    borderRadius: 16,
    padding: '13px 15px',
    display: 'flex',
    flexDirection: 'column',
    gap: 9,
    transition: 'box-shadow 0.2s, transform 0.15s',
  },
  cardNormal: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 10px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.04)',
  },
  cardEmergency: {
    background: '#fff5f5',
    border: '1.5px solid #fca5a5',
    boxShadow: '0 4px 20px rgba(220,38,38,0.13)',
    animation: 'emergencyBlink 2s ease-in-out infinite',
  },

  /* ── Card Header ── */
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  urgentTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 7px',
    borderRadius: 6,
    background: '#dc2626',
    color: '#fff',
    fontSize: '0.58rem',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    width: 'fit-content',
  },
  customerName: {
    margin: 0,
    fontSize: '0.93rem',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statusBadge: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 8,
    fontSize: '0.62rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    whiteSpace: 'nowrap',
  },

  /* ── Details Row ── */
  detailsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '5px 7px',
  },
  detailChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 8px',
    borderRadius: 7,
    background: '#f8fafc',
    border: '1px solid #e8edf3',
    fontSize: '0.67rem',
    fontWeight: 700,
    color: '#475569',
    textDecoration: 'none',
    lineHeight: 1.4,
  },
  phoneChip: {
    background: '#22c55e',
    color: '#ffffff',
    border: 'none',
    padding: '4px 12px',
    borderRadius: 99,
    fontWeight: 900,
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)',
    letterSpacing: '0.02em',
  },
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 110,
    display: 'block',
  },

  /* ── Description Box ── */
  descBox: {
    padding: '7px 10px',
    borderRadius: 10,
    background: '#f8fafc',
    border: '1px solid #f1f5f9',
  },
  descText: {
    margin: 0,
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#000000',
    lineHeight: 1.65,
    letterSpacing: '0.01em',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  /* ── Footer ── */
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 6,
    borderTop: '1px solid #f1f5f9',
    marginTop: 1,
  },

  /* ── GPS Badges ── */
  gpsVerified: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#15803d',
  },
  gpsRequired: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#9ca3af',
  },

  /* ── Update Button ── */
  updateBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    /* generous padding so the button is easy to tap on mobile */
    padding: '9px 18px',
    minHeight: 38,
    borderRadius: 10,
    fontSize: '0.72rem',
    fontWeight: 800,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.15s, transform 0.12s',
    textTransform: 'uppercase',
    WebkitTapHighlightColor: 'transparent',
  },
  updateBtnDark: {
    background: '#0f172a',
    color: '#ffffff',
  },
  updateBtnRed: {
    background: '#dc2626',
    color: '#ffffff',
  },
  completedTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#15803d',
  },

  /* ── Bottom Sheet Backdrop ── */
  /* z-index 1100 > mobile nav z-1000 so sheet always appears on top */
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.55)',
    backdropFilter: 'blur(6px)',
    zIndex: 1100,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: 500,
    background: '#ffffff',
    borderRadius: '20px 20px 0 0',
    overflow: 'hidden',
    boxShadow: '0 -12px 48px rgba(15,23,42,0.18)',
    animation: 'slideUp 0.25s cubic-bezier(0.4,0,0.2,1)',
  },
  sheetHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 20px 14px',
    borderBottom: '1px solid #f1f5f9',
    background: 'linear-gradient(135deg,#eff6ff,#f0fdfa)',
  },
  sheetEyebrow: {
    margin: 0,
    fontSize: '0.6rem',
    fontWeight: 800,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
  },
  sheetTitle: {
    margin: '3px 0 0',
    fontSize: '0.98rem',
    fontWeight: 800,
    color: '#0f172a',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#64748b',
    flexShrink: 0,
  },
  sheetBody: {
    padding: '18px 20px 28px',
  },
  fieldLabel: {
    display: 'block',
    fontSize: '0.68rem',
    fontWeight: 900,
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    marginBottom: 8,
  },
  statusRow: {
    display: 'flex',
    gap: 8,
  },
  statusPill: {
    flex: 1,
    padding: '9px 6px',
    borderRadius: 10,
    fontSize: '0.72rem',
    fontWeight: 800,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.15s ease',
    textAlign: 'center',
  },
  pillActive: {
    background: '#2563eb',
    color: '#ffffff',
  },
  pillInactive: {
    background: '#f1f5f9',
    color: '#64748b',
  },
  notesArea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    fontSize: '0.78rem',
    color: '#0f172a',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    lineHeight: 1.5,
  },
  gpsNote: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    padding: '8px 12px',
    borderRadius: 10,
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    fontSize: '0.68rem',
    color: '#1d4ed8',
    fontWeight: 600,
  },
  sheetActions: {
    display: 'flex',
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    flex: 1,
    padding: '11px 0',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    background: '#f1f5f9',
    color: '#475569',
    fontSize: '0.75rem',
    fontWeight: 800,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  saveBtn: {
    flex: 2,
    padding: '11px 0',
    borderRadius: 12,
    border: 'none',
    background: '#2563eb',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: 800,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },

  /* ── State Displays ── */
  stateBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: '56px 16px',
    color: '#94a3b8',
  },
  stateText: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#94a3b8',
  },
  spinner: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    border: '3px solid #e2e8f0',
    borderTopColor: '#2563eb',
    animation: 'spin 0.7s linear infinite',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    borderRadius: 12,
    background: '#fff5f5',
    border: '1px solid #fca5a5',
    color: '#b91c1c',
    fontSize: '0.78rem',
    fontWeight: 600,
  },
};

/* ─── Inject keyframes + responsive grid once ───────────────── */
if (typeof document !== 'undefined' && !document.getElementById('st-kf')) {
  const el = document.createElement('style');
  el.id = 'st-kf';
  el.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    /* Mild emergency blink — red border pulses gently */
    @keyframes emergencyBlink {
      0%, 100% {
        box-shadow: 0 4px 20px rgba(220,38,38,0.13);
        border-color: #fca5a5;
      }
      50% {
        box-shadow: 0 4px 28px rgba(220,38,38,0.38), 0 0 0 3px rgba(220,38,38,0.15);
        border-color: #ef4444;
      }
    }

    /* Responsive task card grid */
    .st-card-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
    @media (min-width: 768px) {
      .st-card-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
      }
    }
    @media (min-width: 1200px) {
      .st-card-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
    }

    /* Card hover lift */
    .st-card-grid article:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(15,23,42,0.10) !important;
    }
  `;
  document.head.appendChild(el);
}

export default StaffTasks;
