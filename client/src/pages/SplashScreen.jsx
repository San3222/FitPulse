import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const navigate = useNavigate();

  return (
    <div className="splash-page">
      <div className="splash-hero">
        <div className="splash-logo-wrap">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="20" r="8" fill="white"/>
            <path d="M14 42c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <path d="M8 26h4M40 26h4M26 8V4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="26" cy="26" r="18" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
          </svg>
        </div>
        <h1 className="splash-brand">FitTrack</h1>
        <p className="splash-tagline">Your journey to a healthier you starts here.</p>

        <div className="splash-image">
          <div className="splash-image-inner" />
        </div>

        <div className="splash-dots">
          <div className="dot active" />
          <div className="dot" />
          <div className="dot" />
        </div>

        <div style={{ padding: '0 8px', width: '100%' }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 8 }}>
            Track Workouts
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.7 }}>
            Log every rep, run and rest. Monitor your heart rate and watch your progress climb in real time.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <button className="btn-primary" onClick={() => navigate('/register')}>
          Get Started →
        </button>
        <div className="splash-login">
          <span>Already a member? </span>
          <span onClick={() => navigate('/login')}>Log In</span>
        </div>
      </div>
    </div>
  );
}
