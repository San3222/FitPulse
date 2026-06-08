import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WORKOUT_TYPES = ['cardio','strength','yoga','hiit','cycling','running'];
const TYPE_ICONS = { cardio:'🏃', strength:'💪', yoga:'🧘', hiit:'⚡', cycling:'🚴', running:'👟' };

export default function WorkoutsScreen({ onStartWorkout }) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ title: '', type: 'cardio', duration: 30, scheduledDate: '' });

  const fetchWorkouts = async () => {
    try {
      const res = await axios.get('/api/workouts');
      setWorkouts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkouts(); }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const scheduledDate = form.scheduledDate || new Date().toISOString().split('T')[0];
      await axios.post('/api/workouts', { ...form, scheduledDate });
      setShowModal(false);
      setForm({ title: '', type: 'cardio', duration: 30, scheduledDate: '' });
      await fetchWorkouts();
      showToast('✅ Workout scheduled!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/workouts/${id}`);
      setWorkouts(prev => prev.filter(w => w._id !== id));
      showToast('🗑️ Workout removed');
    } catch (err) {
      console.error(err);
    }
  };

  const scheduled = workouts.filter(w => w.status === 'scheduled');
  const completed = workouts.filter(w => w.status === 'completed');

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}

      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, #0F172A 0%, #1E3A5F 100%)',
        padding: '48px 24px 24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#22C55E', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Workouts</p>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 700, color: 'white' }}>
              My Workouts
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: '#22C55E',
              border: 'none',
              borderRadius: 14,
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(34,197,94,0.4)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {/* Scheduled */}
        <div className="section-header">
          <h2 className="section-title">Scheduled ({scheduled.length})</h2>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : scheduled.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><span style={{ fontSize: 24 }}>📅</span></div>
            <p className="empty-title">No scheduled workouts</p>
            <p className="empty-sub">Tap + to add your first workout</p>
          </div>
        ) : (
          scheduled.map(w => (
            <div key={w._id} className="workout-card" style={{ position: 'relative' }}>
              <div className="workout-icon">
                <span style={{ fontSize: 22 }}>{TYPE_ICONS[w.type] || '🏋️'}</span>
              </div>
              <div className="workout-info">
                <div className="workout-name">{w.title}</div>
                <div className="workout-meta">
                  ⏱ {w.duration} min · {w.type}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-start" onClick={() => onStartWorkout(w)}>Start</button>
                <button
                  onClick={() => handleDelete(w._id)}
                  style={{ background: '#FEE2E2', border: 'none', borderRadius: 10, padding: '8px 10px', cursor: 'pointer', color: '#DC2626' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <>
            <div className="section-header" style={{ marginTop: 8 }}>
              <h2 className="section-title">Completed ({completed.length})</h2>
            </div>
            {completed.map(w => (
              <div key={w._id} className="workout-card" style={{ opacity: 0.75 }}>
                <div className="workout-icon" style={{ background: '#F0FDF4' }}>
                  <span style={{ fontSize: 22 }}>{TYPE_ICONS[w.type] || '🏋️'}</span>
                </div>
                <div className="workout-info">
                  <div className="workout-name">{w.title}</div>
                  <div className="workout-meta">
                    ✅ {w.calories} cal · {w.steps} steps · +{w.points} pts
                  </div>
                </div>
                <span style={{ background: '#DCFCE7', color: '#16A34A', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Done</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Add Workout Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="modal-title">New Workout</h2>
            <p className="modal-subtitle">Schedule a new workout session</p>

            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Workout Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Cardio Blast"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  {WORKOUT_TYPES.map(t => (
                    <option key={t} value={t}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  min="5"
                  max="180"
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Scheduled Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.scheduledDate}
                  onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>
                Schedule Workout
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
