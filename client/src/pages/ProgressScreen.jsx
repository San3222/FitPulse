import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProgressScreen() {
  const [weekData, setWeekData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('calories');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weekRes, statsRes] = await Promise.all([
          axios.get('/api/progress/weekly'),
          axios.get('/api/progress/stats')
        ]);
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

  const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const metrics = { calories: 'Calories', steps: 'Steps', workouts: 'Workouts', points: 'Points' };

  const values = weekData.map(d => d[activeMetric] || 0);
  const maxVal = Math.max(...values, 1);

  const statCards = [
    { label: 'Total Workouts', value: stats.totalWorkouts || 0, icon: '🏋️', color: '#22C55E' },
    { label: 'Calories Burned', value: (stats.totalCalories || 0).toLocaleString(), icon: '🔥', color: '#F97316' },
    { label: 'Total Steps', value: (stats.totalSteps || 0).toLocaleString(), icon: '👟', color: '#3B82F6' },
    { label: 'Active Minutes', value: Math.floor((stats.totalDuration || 0)), icon: '⏱', color: '#A855F7' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E3A5F 100%)', padding: '48px 24px 24px' }}>
        <p style={{ color: '#22C55E', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Overview</p>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 700, color: 'white' }}>
          Your Progress 📈
        </h1>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {statCards.map(card => (
            <div key={card.label} style={{
              background: 'white',
              borderRadius: 16,
              padding: '16px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36,
                  background: `${card.color}18`,
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18
                }}>{card.icon}</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Poppins, sans-serif', color: card.color }}>
                {card.value}
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, marginTop: 2 }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Chart */}
        <div className="chart-container">
          <div className="section-header" style={{ margin: 0, marginBottom: 12 }}>
            <h2 className="section-title">This Week</h2>
          </div>

          {/* Metric tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
            {Object.entries(metrics).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 10,
                  border: 'none',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  background: activeMetric === key ? '#22C55E' : '#F3F4F6',
                  color: activeMetric === key ? 'white' : '#6B7280',
                  transition: 'all 0.2s'
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-wrap" style={{ padding: '20px' }}>
              <div className="spinner" style={{ width: 28, height: 28 }} />
            </div>
          ) : (
            <div className="bar-chart" style={{ height: 120 }}>
              {weekData.map((d, i) => {
                const val = d[activeMetric] || 0;
                const height = Math.max((val / maxVal) * 90, val > 0 ? 8 : 4);
                const isToday = d.day === today;
                return (
                  <div key={d.day} className="bar-wrap">
                    <div
                      className={`bar ${isToday ? 'active' : 'inactive'}`}
                      style={{
                        height: `${height}%`,
                        opacity: isToday ? 1 : (val > 0 ? 0.85 : 0.3)
                      }}
                    />
                    <span className="bar-label" style={{
                      color: isToday ? '#22C55E' : undefined,
                      fontWeight: isToday ? 800 : 600
                    }}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Motivation */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A, #1E3A5F)',
          borderRadius: 20,
          padding: 20,
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
            Keep It Up!
          </h3>
          <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
            Every workout counts. Stay consistent and watch your progress soar!
          </p>
        </div>
      </div>
    </div>
  );
}
