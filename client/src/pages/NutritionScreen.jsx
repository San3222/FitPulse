import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_ICONS = { breakfast: '🍳', lunch: '🥗', dinner: '🍽️', snack: '🍎' };
const ACTIVITY_LEVELS = [
    { value: 'sedentary', label: 'Sedentary (little/no exercise)' },
    { value: 'light', label: 'Light (1-3 days/week)' },
    { value: 'moderate', label: 'Moderate (3-5 days/week)' },
    { value: 'active', label: 'Active (6-7 days/week)' },
    { value: 'very_active', label: 'Very Active (athlete)' }
];
const GOALS = [
    { value: 'lose_weight', label: 'Lose Weight' },
    { value: 'maintain', label: 'Maintain Weight' },
    { value: 'gain_muscle', label: 'Gain Muscle' },
    { value: 'endurance', label: 'Build Endurance' }
];

export default function NutritionScreen() {
    const [summary, setSummary] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFoodModal, setShowFoodModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [toast, setToast] = useState('');

    const [foodForm, setFoodForm] = useState({
        mealType: 'breakfast', foodName: '', quantity: 1, unit: 'serving',
        calories: '', protein: '', carbs: '', fats: ''
    });
    const [profileForm, setProfileForm] = useState({
        age: '', gender: 'male', height: '', weight: '', activityLevel: 'moderate', goal: 'maintain'
    });

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

    const fetchAll = useCallback(async () => {
        try {
            const [summaryRes, logsRes] = await Promise.all([
                axios.get('/api/nutrition/summary'),
                axios.get('/api/nutrition/logs')
            ]);
            setSummary(summaryRes.data);
            setLogs(logsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleAddFood = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/nutrition/logs', {
                ...foodForm,
                quantity: parseFloat(foodForm.quantity) || 1,
                calories: parseFloat(foodForm.calories) || 0,
                protein: parseFloat(foodForm.protein) || 0,
                carbs: parseFloat(foodForm.carbs) || 0,
                fats: parseFloat(foodForm.fats) || 0
            });
            setShowFoodModal(false);
            setFoodForm({ mealType: 'breakfast', foodName: '', quantity: 1, unit: 'serving', calories: '', protein: '', carbs: '', fats: '' });
            await fetchAll();
            showToast('✅ Food logged!');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteFood = async (id) => {
        try {
            await axios.delete(`/api/nutrition/logs/${id}`);
            await fetchAll();
            showToast('🗑️ Removed');
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddWater = async (amountMl) => {
        try {
            await axios.post('/api/nutrition/water', { amountMl });
            await fetchAll();
            showToast(`💧 +${amountMl}ml logged`);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            await axios.put('/api/auth/profile', {
                ...profileForm,
                age: parseInt(profileForm.age),
                height: parseFloat(profileForm.height),
                weight: parseFloat(profileForm.weight)
            });
            setShowProfileModal(false);
            await fetchAll();
            showToast('✅ Profile saved — targets updated!');
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return <div className="loading-wrap" style={{ minHeight: 400 }}><div className="spinner" /></div>;
    }

    const targets = summary?.targets || {};
    const consumed = summary?.consumed || { calories: 0, protein: 0, carbs: 0, fats: 0 };
    const profileComplete = targets.profileComplete;

    const calorieGoal = targets.calorieGoal || 2000;
    const caloriesPct = Math.min((consumed.calories / calorieGoal) * 100, 100);
    const caloriesRemaining = Math.max(calorieGoal - consumed.calories, 0);

    const macroBar = (label, value, target, color) => {
        const pct = target ? Math.min((value / target) * 100, 100) : 0;
        return (
            <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    <span style={{ color: '#6B7280' }}>{label}</span>
                    <span style={{ color: '#111827' }}>{Math.round(value)}g / {target || 0}g</span>
                </div>
                <div style={{ height: 8, background: '#F3F4F6', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 0.3s' }} />
                </div>
            </div>
        );
    };

    const waterMl = summary?.waterMl || 0;
    const waterGoal = targets.waterGoalMl || 2500;
    const waterPct = Math.min((waterMl / waterGoal) * 100, 100);

    const groupedLogs = MEAL_TYPES.map(type => ({
        type, items: logs.filter(l => l.mealType === type)
    }));

    return (
        <div>
            {toast && <div className="toast">{toast}</div>}

            {/* Header */}
            <div style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E3A5F 100%)', padding: '48px 24px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: '#22C55E', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Nutrition</p>
                        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 700, color: 'white' }}>Diet Plan 🍽️</h1>
                    </div>
                    <button
                        onClick={() => setShowFoodModal(true)}
                        style={{ background: '#22C55E', border: 'none', borderRadius: 14, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(34,197,94,0.4)' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>

            <div style={{ padding: 20 }}>
                {!profileComplete && (
                    <div
                        onClick={() => setShowProfileModal(true)}
                        style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 16, padding: 16, marginBottom: 16, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}
                    >
                        <span style={{ fontSize: 24 }}>⚠️</span>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>Complete your profile</div>
                            <div style={{ fontSize: 12, color: '#B45309', marginTop: 2 }}>Add age, height & weight to calculate your calorie & macro targets</div>
                        </div>
                    </div>
                )}

                {/* Calorie Summary */}
                <div className="chart-container" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>{Math.round(consumed.calories)}</div>
                            <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>of {calorieGoal} kcal goal</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#22C55E' }}>{Math.round(caloriesRemaining)}</div>
                            <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>kcal remaining</div>
                        </div>
                    </div>
                    <div style={{ height: 10, background: '#F3F4F6', borderRadius: 8, overflow: 'hidden', marginBottom: 18 }}>
                        <div style={{ width: `${caloriesPct}%`, height: '100%', background: 'linear-gradient(90deg, #22C55E, #16A34A)', borderRadius: 8, transition: 'width 0.3s' }} />
                    </div>

                    {macroBar('Protein', consumed.protein, targets.macros?.protein, '#3B82F6')}
                    {macroBar('Carbs', consumed.carbs, targets.macros?.carbs, '#F97316')}
                    {macroBar('Fats', consumed.fats, targets.macros?.fats, '#A855F7')}

                    {profileComplete && (
                        <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid #F3F4F6', fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>
                            <span>BMR: {targets.bmr} kcal</span>
                            <span>TDEE: {targets.tdee} kcal</span>
                            <span onClick={() => setShowProfileModal(true)} style={{ marginLeft: 'auto', color: '#22C55E', cursor: 'pointer' }}>Edit profile</span>
                        </div>
                    )}
                </div>

                {/* Water Tracker */}
                <div className="chart-container" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>💧 Water Intake</div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#3B82F6' }}>{waterMl}ml / {waterGoal}ml</span>
                    </div>
                    <div style={{ height: 8, background: '#F3F4F6', borderRadius: 6, overflow: 'hidden', marginBottom: 14 }}>
                        <div style={{ width: `${waterPct}%`, height: '100%', background: '#3B82F6', borderRadius: 6, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {[250, 500, 750].map(amt => (
                            <button
                                key={amt}
                                onClick={() => handleAddWater(amt)}
                                style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #DBEAFE', background: '#EFF6FF', color: '#3B82F6', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                            >
                                +{amt}ml
                            </button>
                        ))}
                    </div>
                </div>

                {/* Meal Log */}
                <div className="section-header" style={{ margin: '0 0 8px' }}>
                    <h2 className="section-title">Today's Meals</h2>
                </div>

                {groupedLogs.map(({ type, items }) => (
                    <div key={type} style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            {MEAL_ICONS[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
                            {items.length > 0 && <span style={{ color: '#9CA3AF', fontWeight: 600 }}>· {items.reduce((s, i) => s + i.calories, 0)} kcal</span>}
                        </div>
                        {items.length === 0 ? (
                            <div style={{ fontSize: 12, color: '#D1D5DB', paddingLeft: 4 }}>Nothing logged yet</div>
                        ) : (
                            items.map(item => (
                                <div key={item._id} className="workout-card" style={{ padding: '12px 16px', marginBottom: 8 }}>
                                    <div className="workout-info">
                                        <div className="workout-name" style={{ fontSize: 14 }}>{item.foodName}</div>
                                        <div className="workout-meta">{item.quantity} {item.unit} · {item.calories} kcal · P{item.protein} C{item.carbs} F{item.fats}</div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteFood(item._id)}
                                        style={{ background: '#FEE2E2', border: 'none', borderRadius: 10, padding: '8px 10px', cursor: 'pointer', color: '#DC2626' }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                ))}
            </div>

            {/* Add Food Modal */}
            {showFoodModal && (
                <div className="modal-overlay" onClick={() => setShowFoodModal(false)}>
                    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                        <div className="modal-handle" />
                        <h2 className="modal-title">Log Food</h2>
                        <p className="modal-subtitle">Add what you ate to track your macros</p>

                        <form onSubmit={handleAddFood}>
                            <div className="form-group">
                                <label className="form-label">Meal</label>
                                <select className="form-select" value={foodForm.mealType} onChange={e => setFoodForm({ ...foodForm, mealType: e.target.value })}>
                                    {MEAL_TYPES.map(t => <option key={t} value={t}>{MEAL_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Food Name</label>
                                <input className="form-input" placeholder="e.g. Grilled Chicken Bowl" value={foodForm.foodName} onChange={e => setFoodForm({ ...foodForm, foodName: e.target.value })} required />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Quantity</label>
                                    <input type="number" step="0.1" className="form-input" value={foodForm.quantity} onChange={e => setFoodForm({ ...foodForm, quantity: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Unit</label>
                                    <input className="form-input" placeholder="serving / g / cup" value={foodForm.unit} onChange={e => setFoodForm({ ...foodForm, unit: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Calories (kcal)</label>
                                <input type="number" className="form-input" value={foodForm.calories} onChange={e => setFoodForm({ ...foodForm, calories: e.target.value })} required />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Protein (g)</label>
                                    <input type="number" className="form-input" value={foodForm.protein} onChange={e => setFoodForm({ ...foodForm, protein: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Carbs (g)</label>
                                    <input type="number" className="form-input" value={foodForm.carbs} onChange={e => setFoodForm({ ...foodForm, carbs: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Fats (g)</label>
                                    <input type="number" className="form-input" value={foodForm.fats} onChange={e => setFoodForm({ ...foodForm, fats: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>Add Food</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile Modal (for BMR/TDEE targets) */}
            {showProfileModal && (
                <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                        <div className="modal-handle" />
                        <h2 className="modal-title">Your Profile</h2>
                        <p className="modal-subtitle">Used to calculate your calorie & macro targets</p>

                        <form onSubmit={handleSaveProfile}>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Age</label>
                                    <input type="number" className="form-input" value={profileForm.age} onChange={e => setProfileForm({ ...profileForm, age: e.target.value })} required />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Gender</label>
                                    <select className="form-select" value={profileForm.gender} onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Height (cm)</label>
                                    <input type="number" className="form-input" value={profileForm.height} onChange={e => setProfileForm({ ...profileForm, height: e.target.value })} required />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Weight (kg)</label>
                                    <input type="number" className="form-input" value={profileForm.weight} onChange={e => setProfileForm({ ...profileForm, weight: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Activity Level</label>
                                <select className="form-select" value={profileForm.activityLevel} onChange={e => setProfileForm({ ...profileForm, activityLevel: e.target.value })}>
                                    {ACTIVITY_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Goal</label>
                                <select className="form-select" value={profileForm.goal} onChange={e => setProfileForm({ ...profileForm, goal: e.target.value })}>
                                    {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>Save Profile</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}