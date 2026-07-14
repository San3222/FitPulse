import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});

  useEffect(() => {
    axios.get('/api/progress/stats')
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: '🎯', label: 'My Goals', desc: 'Set your fitness targets', path: '/app/goals' },
    { icon: '🍽️', label: 'Nutrition', desc: 'Diet plan & food log', path: '/app/nutrition' },
    { icon: '📏', label: 'Body Metrics', desc: 'Weight, measurements & photos', path: '/app/bodymetrics' },
    { icon: '🔔', label: 'Notifications', desc: 'Workout reminders' },
    { icon: '📊', label: 'Detailed Stats', desc: 'Full progress history', path: '/app/progress' },
    { icon: '🏆', label: 'Achievements', desc: 'Your badges and rewards' },
    { icon: '❓', label: 'Help & Support', desc: 'FAQs and contact' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar-lg">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <h1 className="profile-name">{user?.name}</h1>
        <p className="profile-email">{user?.email}</p>
        {user?.inviteCode && (
          <div style={{
            marginTop: 12,
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 10,
            padding: '6px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 700 }}>🏷 {user.inviteCode}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="profile-stats">
        {[
          { label: 'Workouts', value: stats.totalWorkouts || 0 },
          { label: 'Points', value: user?.totalPoints || 0 },
          { label: 'Kcal', value: (stats.totalCalories || 0).toLocaleString() },
          { label: 'Steps', value: stats.totalSteps ? `${(stats.totalSteps / 1000).toFixed(1)}k` : '0' },
        ].map(s => (
          <div key={s.label} className="profile-stat">
            <div className="profile-stat-value">{s.value}</div>
            <div className="profile-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard shortcut */}
      <div style={{ padding: '0 20px 16px' }}>
        <div
          onClick={() => navigate('/app/leaderboard')}
          style={{
            background: 'linear-gradient(135deg, #0F172A, #1E3A5F)',
            borderRadius: 16,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: 28 }}>🏆</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 700, color: 'white' }}>
              Leaderboard
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
              See how you rank globally
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      {/* Menu Items */}
      <div className="profile-section">
        <p className="profile-section-title">Account Settings</p>
        {menuItems.map(item => (
          <div
            key={item.label}
            className="profile-menu-item"
            onClick={() => item.path && navigate(item.path)}
            style={{ cursor: item.path ? 'pointer' : 'default' }}
          >
            <div className="menu-icon">
              <span style={{ fontSize: 18 }}>{item.icon}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div className="menu-label">{item.label}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>{item.desc}</div>
            </div>
            <svg className="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        ))}
      </div>

      {/* App info */}
      <div style={{ padding: '0 20px 8px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#D1D5DB', marginBottom: 2 }}>FitTrack v1.0.0</p>
        <p style={{ fontSize: 11, color: '#E5E7EB' }}>Built with React, Node.js & MongoDB</p>
      </div>

      {/* Logout */}
      <div className="profile-section" style={{ paddingTop: 0 }}>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}