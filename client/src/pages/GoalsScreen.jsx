import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const GOAL_TYPES = [
    { value: 'weight', label: '⚖️ Weight', unit: 'kg' },
    { value: 'steps', label: '👟 Steps', unit: 'steps' },
    { value: 'workouts', label: '🏋️ Workouts', unit: 'workouts' },
    { value: 'calories', label: '🔥 Calories Burned', unit: 'kcal' },
    { value: 'water', label: '💧 Water Intake', unit: 'ml' },
    { value: 'custom', label: '🎯 Custom', unit: '' }
];
const TYPE_ICON = Object.fromEntries(GOAL_TYPES.map(t => [t.value, t.label.split(' ')[0]]));

export default function GoalsScreen() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState('');
    const [form, setForm] = useState({ title: '', type: 'weight', startValue: '', currentValue: '', targetValue: '', unit: 'kg', deadline: '' });

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

    const fetchGoals = useCallback(async () => {
        try {
            const res = await axios.get('/api/goals');
            setGoals(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchGoals(); }, [fetchGoals]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/goals', {
                ...form,
                startValue: parseFloat(form.startValue) || 0,
                currentValue: parseFloat(form.currentValue) || parseFloat(form.startValue) || 0,
                targetValue: parseFloat(form.targetValue)
            });
            setShowModal(false);
            setForm({ title: '', type: 'weight', startValue: '', currentValue: '', targetValue: '', unit: 'kg', deadline: '' });
            await fetchGoals();
            showToast('🎯 Goal created!');
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateProgress = async (goal, delta) => {
        try {
            const step = Math.abs(goal.targetValue - goal.startValue) / 10 || 1;
            const newValue = goal.currentValue + delta * step;
            const res = await axios.put(`/api/goals/${goal._id}`, { currentValue: Math.round(newValue * 100) / 100 });
            setGoals(prev => prev.map(g => g._id === goal._id ? res.data : g));
            if (res.data.status === 'completed') showToast('🎉 Goal completed!');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/goals/${id}`);
            setGoals(prev => prev.filter(g => g._id !== id));
            showToast('🗑️ Goal removed');
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return <div className="loading-wrap" style={{ minHeight: 400 }}><div className="spinner" /></div>;
    }

    const active = goals.filter(g => g.status === 'active');
    const completed = goals.filter(g => g.status === 'completed');

    const goalCard = (g) => (
        <div key={g._id} className="chart-container" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>{TYPE_ICON[g.type]} {g.title}</div>
                    {g.deadline && <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginTop: 2 }}>Due {new Date(g.deadline).toLocaleDateString()}</div>}
                </div>
                <button
                    onClick={() => handleDelete(g._id)}
                    style={{ background: '#FEE2E2', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#DC2626' }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                <span style={{ color: '#6B7280' }}>{g.currentValue} {g.unit}</span>
                <span style={{ color: '#22C55E' }}>{g.progressPercent}%</span>
                <span style={{ color: '#9CA3AF' }}>Target: {g.targetValue} {g.unit}</span>
            </div>
            <div style={{ height: 8, background: '#F3F4F6', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${g.progressPercent}%`, height: '100%', background: g.status === 'completed' ? '#22C55E' : 'linear-gradient(90deg, #22C55E, #16A34A)', borderRadius: 6, transition: 'width 0.3s' }} />
            </div>

            {g.status === 'active' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={() => handleUpdateProgress(g, -1)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: '1.5px solid #E5E7EB', background: 'white', fontWeight: 800, cursor: 'pointer' }}>−</button>
                    <button onClick={() => handleUpdateProgress(g, 1)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', background: '#22C55E', color: 'white', fontWeight: 800, cursor: 'pointer' }}>+ Update</button>
                </div>
            )}
        </div>
    );

    return (
        <div>
            {toast && <div className="toast">{toast}</div>}

            {/* Header */}
            <div style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E3A5F 100%)', padding: '48px 24px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: '#22C55E', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Milestones</p>
                        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 700, color: 'white' }}>My Goals 🎯</h1>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        style={{ background: '#22C55E', border: 'none', borderRadius: 14, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(34,197,94,0.4)' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>

            <div style={{ padding: '20px 20px 0' }}>
                <div className="section-header">
                    <h2 className="section-title">Active ({active.length})</h2>
                </div>

                {active.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><span style={{ fontSize: 24 }}>🎯</span></div>
                        <p className="empty-title">No active goals</p>
                        <p className="empty-sub">Tap + to set your first fitness target</p>
                    </div>
                ) : active.map(goalCard)}

                {completed.length > 0 && (
                    <>
                        <div className="section-header" style={{ marginTop: 8 }}>
                            <h2 className="section-title">Completed ({completed.length}) 🏆</h2>
                        </div>
                        {completed.map(goalCard)}
                    </>
                )}
            </div>

            {/* Add Goal Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                        <div className="modal-handle" />
                        <h2 className="modal-title">New Goal</h2>
                        <p className="modal-subtitle">Set a target and track your progress</p>

                        <form onSubmit={handleAdd}>
                            <div className="form-group">
                                <label className="form-label">Goal Title</label>
                                <input className="form-input" placeholder="e.g. Reach 70kg" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Type</label>
                                <select
                                    className="form-select"
                                    value={form.type}
                                    onChange={e => {
                                        const t = GOAL_TYPES.find(t => t.value === e.target.value);
                                        setForm({ ...form, type: e.target.value, unit: t.unit });
                                    }}
                                >
                                    {GOAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Start Value</label>
                                    <input type="number" className="form-input" value={form.startValue} onChange={e => setForm({ ...form, startValue: e.target.value })} required />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Target Value</label>
                                    <input type="number" className="form-input" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value })} required />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Unit</label>
                                    <input className="form-input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Deadline (optional)</label>
                                    <input type="date" className="form-input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>Create Goal</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}