import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomeScreen from './HomeScreen';
import WorkoutsScreen from './WorkoutsScreen';
import ProgressScreen from './ProgressScreen';
import LeaderboardScreen from './LeaderboardScreen';
import ProfileScreen from './ProfileScreen';
import WorkoutTimer from './WorkoutTimer';

const HomeIcon = ({ active }) => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinejoin="round"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const WorkoutsIcon = ({ active }) => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 5v14M18 5v14M6 12h12M3 7l3-2M21 7l-3-2M3 17l3 2M21 17l-3 2" strokeLinecap="round"/>
  </svg>
);

const ProgressIcon = ({ active }) => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeWorkout, setActiveWorkout] = useState(null);

  const currentPath = location.pathname.split('/')[2] || 'home';
  const isTimerActive = currentPath === 'timer';

  const navItems = [
    { key: 'home', label: 'Home', Icon: HomeIcon },
    { key: 'workouts', label: 'Workouts', Icon: WorkoutsIcon },
    { key: 'progress', label: 'Progress', Icon: ProgressIcon },
    { key: 'profile', label: 'Profile', Icon: ProfileIcon },
  ];

  const startWorkout = (workout) => {
    setActiveWorkout(workout);
    navigate('/app/timer');
  };

  const finishWorkout = () => {
    setActiveWorkout(null);
    navigate('/app/home');
  };

  return (
    <div className="app-screen">
      <div className="screen-content">
        <Routes>
          <Route path="/" element={<HomeScreen onStartWorkout={startWorkout} />} />
          <Route path="/home" element={<HomeScreen onStartWorkout={startWorkout} />} />
          <Route path="/workouts" element={<WorkoutsScreen onStartWorkout={startWorkout} />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/leaderboard" element={<LeaderboardScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/timer" element={<WorkoutTimer workout={activeWorkout} onFinish={finishWorkout} />} />
        </Routes>
      </div>

      {!isTimerActive && (
        <nav className="bottom-nav">
          {navItems.map(({ key, label, Icon }) => {
            const active = currentPath === key;
            return (
              <div
                key={key}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => navigate(`/app/${key}`)}
              >
                <Icon active={active} />
                <span className="nav-label">{label}</span>
              </div>
            );
          })}
        </nav>
      )}
    </div>
  );
}
