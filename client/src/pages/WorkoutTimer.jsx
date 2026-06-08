import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default function WorkoutTimer({ workout, onFinish }) {
  const totalSeconds = (workout?.duration || 30) * 60;
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [laps, setLaps] = useState([]);
  const [lapStart, setLapStart] = useState(0);
  const [calories, setCalories] = useState(0);
  const [steps, setSteps] = useState(0);
  const [bpm, setBpm] = useState(128);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(e => {
          const next = e + 1;
          // Simulate stats
          setCalories(Math.floor(next * 0.175));
          setSteps(Math.floor(next * 1.8));
          setBpm(120 + Math.floor(Math.sin(next / 30) * 15));
          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleLap = () => {
    const lapTime = elapsed - lapStart;
    setLaps(prev => [...prev, { num: prev.length + 1, time: formatTime(lapTime), seconds: lapTime }]);
    setLapStart(elapsed);
  };

  const handleReset = () => {
    setElapsed(0);
    setLaps([]);
    setLapStart(0);
    setRunning(false);
    setCalories(0);
    setSteps(0);
  };

  const handleComplete = async () => {
    clearInterval(intervalRef.current);
    try {
      if (workout?._id) {
        const currentLapTime = elapsed - lapStart;
        const allLaps = [...laps, { lapNumber: laps.length + 1, time: formatTime(currentLapTime), seconds: currentLapTime }];
        
        await axios.put(`/api/workouts/${workout._id}/complete`, {
          calories,
          steps,
          heartRate: bpm,
          laps: allLaps,
          duration: Math.floor(elapsed / 60)
        });
      }
    } catch (err) {
      console.error('Error completing workout:', err);
    }
    onFinish();
  };

  const progress = Math.min(elapsed / totalSeconds, 1);
  const circumference = 2 * Math.PI * 100;
  const strokeDashoffset = circumference * (1 - progress);

  const currentLapTime = elapsed - lapStart;
  const allLapsDisplay = [...laps, { num: laps.length + 1, time: formatTime(currentLapTime), seconds: currentLapTime, isCurrent: true }];

  return (
    <div className="timer-screen">
      {/* Header */}
      <div className="timer-header">
        <div className="timer-status">
          <div className="status-dot" />
          <span>{running ? 'Running' : 'Paused'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>Workout Timer</p>
            <h1 className="timer-workout-name">{workout?.title || 'Cardio Blast'}</h1>
          </div>
          <button
            onClick={handleComplete}
            style={{
              background: '#DCFCE7',
              border: 'none',
              borderRadius: 10,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 700,
              color: '#16A34A',
              cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif',
              marginTop: 4
            }}
          >
            Done ✓
          </button>
        </div>
      </div>

      {/* Timer Ring */}
      <div className="timer-circle-wrap">
        <div className="timer-ring">
          <svg width="220" height="220" viewBox="0 0 220 220">
            <circle className="track" cx="110" cy="110" r="100" strokeDasharray={circumference} />
            <circle
              className="progress"
              cx="110" cy="110" r="100"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="timer-time-display">
            <p className="timer-label">ELAPSED</p>
            <p className="timer-digits">{formatTime(elapsed)}</p>
            <p className="timer-total">of {workout?.duration || 30}:00 min</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="timer-controls">
        <button className="ctrl-btn" onClick={handleReset}>
          <div className="ctrl-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-4.72"/>
            </svg>
          </div>
          <span className="ctrl-label">Reset</span>
        </button>

        <button className="ctrl-main" onClick={() => setRunning(r => !r)}>
          {running ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
        </button>

        <button className="ctrl-btn" onClick={handleLap}>
          <div className="ctrl-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3"/>
              <line x1="12" y1="2" x2="12" y2="6"/>
            </svg>
          </div>
          <span className="ctrl-label">Lap</span>
        </button>
      </div>

      {/* Live Stats */}
      <div className="timer-stats">
        <div className="timer-stat">
          <div className="timer-stat-value">{calories}</div>
          <div className="timer-stat-label">Calories</div>
        </div>
        <div className="timer-stat">
          <div className="timer-stat-value">{steps.toLocaleString()}</div>
          <div className="timer-stat-label">Steps</div>
        </div>
        <div className="timer-stat">
          <div className="timer-stat-value" style={{ color: '#EF4444' }}>{bpm}</div>
          <div className="timer-stat-label">BPM</div>
        </div>
      </div>

      {/* Laps */}
      <div className="laps-section">
        <div className="laps-header">
          <span className="laps-title">Lap Times</span>
          <span className="laps-count">{allLapsDisplay.length} laps</span>
        </div>
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          {allLapsDisplay.map((lap, i) => (
            <div key={i} className={`lap-row ${lap.isCurrent ? 'current' : ''}`}>
              <div className="lap-num">{lap.num}</div>
              <span className="lap-name">{lap.isCurrent ? 'Current' : `Lap ${lap.num}`}</span>
              <span className="lap-time">{lap.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
