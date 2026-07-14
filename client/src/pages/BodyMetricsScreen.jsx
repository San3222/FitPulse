import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function BodyMetricsScreen() {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState('');
    const [form, setForm] = useState({
        weight: '', bodyFat: '', chest: '', waist: '', hips: '', arms: '', thighs: '', photoUrl: '', notes: ''
    });

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

    const fetchEntries = useCallback(async () => {
        try {
            const res = await axios.get('/api/bodymetrics');
            setEntries(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEntries(); }, [fetchEntries]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/bodymetrics', {
                weight: form.weight ? parseFloat(form.weight) : undefined,
                bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : undefined,
                measurements: {
                    chest: form.chest ? parseFloat(form.chest) : undefined,
                    waist: form.waist ? parseFloat(form.waist) : undefined,
                    hips: form.hips ? parseFloat(form.hips) : undefined,
                    arms: form.arms ? parseFloat(form.arms) : undefined,
                    thighs: form.thighs ? parseFloat(form.thighs) : undefined
                },
                photoUrl: form.photoUrl,
                notes: form.notes
            });
            setShowModal(false);
            setForm({ weight: '', bodyFat: '', chest: '', waist: '', hips: '', arms: '', thighs: '', photoUrl: '', notes: '' });
            await fetchEntries();
            showToast('✅ Entry saved!');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/bodymetrics/${id}`);
            await fetchEntries();
            showToast('🗑️ Entry removed');
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return <div className="loading-wrap" style={{ minHeight: 400 }}><div className="spinner" /></div>;
    }

    const latest = entries[entries.length - 1];
    const previous = entries[entries.length - 2];
    const weightChange = latest && previous && latest.weight && previous.weight
        ? (latest.weight - previous.weight).toFixed(1) : null;

    const bmi = latest?.weight && user?.height
        ? (latest.weight / ((user.height / 100) ** 2)).toFixed(1) : null;

    const recentEntries = entries.slice(-8);
    const weightValues = recentEntries.map(e => e.weight).filter(Boolean);
    const maxW = Math.max(...weightValues, 1);
    const minW = Math.min(...weightValues, 0);

    const measurementRows = latest?.measurements ? [
        { label: 'Chest', value: latest.measurements.chest },
        { label: 'Waist', value: latest.measurements.waist },
        { label: 'Hips', value: latest.measurements.hips },
        { label: 'Arms', value: latest.measurements.arms },
        { label: 'Thighs', value: latest.measurements.thighs }
    ].filter(m => m.value) : [];

    return (
        <div>
            {toast && <div className="toast">{toast}</div>}

            {/* Header */}
            <div style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E3A5F 100%)', padding: '48px 24px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: '#22C55E', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Body Metrics</p>
                        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 700, color: 'white' }}>Your Body 📏</h1>
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

            <div style={{ padding: 20 }}>
                {!latest ? (
                    <div className="empty-state">
                        <div className="empty-icon"><span style={{ fontSize: 24 }}>📏</span></div>
                        <p className="empty-title">No entries yet</p>
                        <p className="empty-sub">Tap + to log your weight & measurements</p>
                    </div>
                ) : (
                    <>
                        {/* Stat cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                            <div style={{ background: 'white', borderRadius: 14, padding: 14, border: '1px solid #E5E7EB', textAlign: 'center' }}>
                                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>{latest.weight ?? '—'}</div>
                                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginTop: 2 }}>Weight (kg)</div>
                                {weightChange !== null && (
                                    <div style={{ fontSize: 11, fontWeight: 700, color: weightChange <= 0 ? '#22C55E' : '#F97316', marginTop: 2 }}>
                                        {weightChange > 0 ? '+' : ''}{weightChange}
                                    </div>
                                )}
                            </div>
                            <div style={{ background: 'white', borderRadius: 14, padding: 14, border: '1px solid #E5E7EB', textAlign: 'center' }}>
                                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>{latest.bodyFat ?? '—'}</div>
                                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginTop: 2 }}>Body Fat (%)</div>
                            </div>
                            <div style={{ background: 'white', borderRadius: 14, padding: 14, border: '1px solid #E5E7EB', textAlign: 'center' }}>
                                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>{bmi ?? '—'}</div>
                                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginTop: 2 }}>BMI</div>
                            </div>
                        </div>

                        {/* Weight trend */}
                        {weightValues.length > 1 && (
                            <div className="chart-container" style={{ marginBottom: 16 }}>
                                <div className="section-header" style={{ margin: 0, marginBottom: 12 }}>
                                    <h2 className="section-title">Weight Trend</h2>
                                </div>
                                <div className="bar-chart" style={{ height: 100 }}>
                                    {recentEntries.map((e, i) => {
                                        const val = e.weight || 0;
                                        const range = maxW - minW || 1;
                                        const height = val ? Math.max(((val - minW) / range) * 80 + 15, 15) : 4;
                                        return (
                                            <div key={e._id} className="bar-wrap">
                                                <div className={`bar ${i === recentEntries.length - 1 ? 'active' : 'inactive'}`} style={{ height: `${height}%` }} />
                                                <span className="bar-label">{new Date(e.date).getDate()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Measurements */}
                        {measurementRows.length > 0 && (
                            <div className="chart-container" style={{ marginBottom: 16 }}>
                                <div className="section-header" style={{ margin: 0, marginBottom: 12 }}>
                                    <h2 className="section-title">Latest Measurements (cm)</h2>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {measurementRows.map(m => (
                                        <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#F8FAFC', borderRadius: 10 }}>
                                            <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>{m.label}</span>
                                            <span style={{ fontSize: 13, fontWeight: 800 }}>{m.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* History */}
                        <div className="section-header" style={{ margin: '0 0 8px' }}>
                            <h2 className="section-title">History</h2>
                        </div>
                        {[...entries].reverse().map(e => (
                            <div key={e._id} className="workout-card" style={{ padding: '12px 16px', marginBottom: 8 }}>
                                <div className="workout-info">
                                    <div className="workout-name" style={{ fontSize: 14 }}>
                                        {e.weight ? `${e.weight} kg` : 'Entry'} {e.bodyFat ? `· ${e.bodyFat}% BF` : ''}
                                    </div>
                                    <div className="workout-meta">{new Date(e.date).toLocaleDateString()}</div>
                                </div>
                                <button
                                    onClick={() => handleDelete(e._id)}
                                    style={{ background: '#FEE2E2', border: 'none', borderRadius: 10, padding: '8px 10px', cursor: 'pointer', color: '#DC2626' }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Add Entry Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                        <div className="modal-handle" />
                        <h2 className="modal-title">New Entry</h2>
                        <p className="modal-subtitle">Log your weight, body fat & measurements</p>

                        <form onSubmit={handleAdd}>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Weight (kg)</label>
                                    <input type="number" step="0.1" className="form-input" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Body Fat (%)</label>
                                    <input type="number" step="0.1" className="form-input" value={form.bodyFat} onChange={e => setForm({ ...form, bodyFat: e.target.value })} />
                                </div>
                            </div>

                            <p style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', margin: '4px 0 10px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Measurements (cm) — optional</p>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Chest</label>
                                    <input type="number" className="form-input" value={form.chest} onChange={e => setForm({ ...form, chest: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Waist</label>
                                    <input type="number" className="form-input" value={form.waist} onChange={e => setForm({ ...form, waist: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Hips</label>
                                    <input type="number" className="form-input" value={form.hips} onChange={e => setForm({ ...form, hips: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Arms</label>
                                    <input type="number" className="form-input" value={form.arms} onChange={e => setForm({ ...form, arms: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Thighs</label>
                                    <input type="number" className="form-input" value={form.thighs} onChange={e => setForm({ ...form, thighs: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Progress Photo URL (optional)</label>
                                <input className="form-input" placeholder="https://..." value={form.photoUrl} onChange={e => setForm({ ...form, photoUrl: e.target.value })} />
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>Save Entry</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}