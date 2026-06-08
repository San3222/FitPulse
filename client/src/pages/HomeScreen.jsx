import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#BBF7D0','#86EFAC','#4ADE80','#22C55E','#16A34A','#A3E635','#BBF7D0'];

export default function HomeScreen({ onStartWorkout }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [stats, setStats] = useState({ totalCalories: 0, totalWorkouts: 0 });
  const [loading, setLoading] = useState(true);

  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
  };

  const getEmoji = () => {
    const h = new Date().getHours();
    if (h < 12) return '👋';
    if (h < 17) return '☀️';
    return '🌙';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workoutsRes, weekRes, statsRes] = await Promise.all([
          axios.get('/api/workouts/upcoming'),
          axios.get('/api/progress/weekly'),
          axios.get('/api/progress/stats')
        ]);
        setUpcoming(workoutsRes.data);
        setWeekData(weekRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const maxCal = Math.max(...weekData.map(d => d.calories), 1);
  const today = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];

  const getWorkoutIcon = (type) => {
    const icons = {
      cardio: '🏃',
      strength: '💪',
      yoga: '🧘',
      hiit: '⚡',
      cycling: '🚴',
      running: '👟'
    };
    return icons[type] || '🏋️';
  };

  return (
    <div>
      {/* Header */}
      <div className="home-header">
        <p className="home-welcome">Good {getHour()} {getEmoji()}</p>
        <h1 className="home-greeting">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <div className="home-avatar">
          {user?.name?.[0]?.toUpperCase()}
        </div>

        <div className="stats-row">
          <div className="stat-chip">
            <div className="stat-chip-value">{stats.totalWorkouts || 0}</div>
            <div className="stat-chip-label">Workouts</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-value">{(stats.totalCalories || 0).toLocaleString()}</div>
            <div className="stat-chip-label">Total Kcal</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-value">{user?.totalPoints || 0}</div>
            <div className="stat-chip-label">Points</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="home-body">
        {/* Upcoming Workouts */}
        <div className="section-header" style={{ marginTop: 4 }}>
          <h2 className="section-title">Upcoming Workouts</h2>
          <span className="section-action" onClick={() => navigate('/app/workouts')}>See All</span>
        </div>

        {loading ? (
          <div className="loading-wrap" style={{ padding: '20px' }}>
            <div className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : upcoming.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <span style={{ fontSize: 24 }}>🏋️</span>
            </div>
            <p className="empty-title">No upcoming workouts</p>
            <p className="empty-sub">Schedule one from the Workouts tab</p>
          </div>
        ) : (
          upcoming.map(workout => (
            <div key={workout._id} className="workout-card">
              <div className="workout-icon">
                <span style={{ fontSize: 22 }}>{getWorkoutIcon(workout.type)}</span>
              </div>
              <div className="workout-info">
                <div className="workout-name">{workout.title}</div>
                <div className="workout-meta">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {workout.duration} min
                </div>
              </div>
              <button className="btn-start" onClick={() => onStartWorkout(workout)}>
                Start
              </button>
            </div>
          ))
        )}

        {/* Weekly Progress */}
        <div className="section-header" style={{ marginTop: 8 }}>
          <h2 className="section-title">Weekly Progress</h2>
        </div>

        <div className="chart-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Calories Burned</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#22C55E' }}>
              {weekData.reduce((a, b) => a + b.calories, 0).toLocaleString()} kcal
            </span>
          </div>
          <div className="bar-chart">
            {weekData.map((d, i) => {
              const height = Math.max((d.calories / maxCal) * 85, d.calories > 0 ? 8 : 4);
              const isToday = d.day === today;
              return (
                <div key={d.day} className="bar-wrap">
                  <div
                    className={`bar ${isToday ? 'active' : 'inactive'}`}
                    style={{
                      height: `${height}%`,
                      opacity: isToday ? 1 : (d.calories > 0 ? 0.85 : 0.3)
                    }}
                  />
                  <span className="bar-label" style={{ color: isToday ? '#22C55E' : undefined, fontWeight: isToday ? 800 : 600 }}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Leaderboard', icon: '🏆', action: () => navigate('/app/leaderboard') },
            { label: 'Add Workout', icon: '➕', action: () => navigate('/app/workouts') },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              style={{
                flex: 1,
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: 14,
                padding: '16px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'Nunito, sans-serif'
              }}
            >
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
