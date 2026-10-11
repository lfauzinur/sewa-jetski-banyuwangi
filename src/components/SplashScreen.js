'use client';
import { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('enter'); // enter → ride → exit

  useEffect(() => {
    // Phase 1: Enter animation (jetski slides in)
    const t1 = setTimeout(() => setPhase('ride'), 600);
    // Phase 2: Riding animation plays
    const t2 = setTimeout(() => setPhase('exit'), 2600);
    // Phase 3: Fade out and finish
    const t3 = setTimeout(() => onFinish(), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div className={`splash-screen ${phase === 'exit' ? 'splash-exit' : ''}`}>
      {/* Ocean gradient background */}
      <div className="splash-ocean" />

      {/* Animated waves at the bottom */}
      <svg className="splash-waves" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path className="splash-wave splash-wave-1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        <path className="splash-wave splash-wave-2" d="M0,256L48,261.3C96,267,192,277,288,272C384,267,480,245,576,229.3C672,213,768,203,864,213.3C960,224,1056,256,1152,261.3C1248,267,1344,245,1392,234.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        <path className="splash-wave splash-wave-3" d="M0,288L48,282.7C96,277,192,267,288,261.3C384,256,480,256,576,261.3C672,267,768,277,864,277.3C960,277,1056,267,1152,261.3C1248,256,1344,256,1392,256L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
      </svg>

      {/* Splash spray particles */}
      <div className="splash-particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="splash-particle" style={{
            '--delay': `${i * 0.15}s`,
            '--x': `${-20 + Math.random() * 40}px`,
            '--y': `${-30 - Math.random() * 60}px`,
            left: `${45 + Math.random() * 10}%`,
            bottom: `${28 + Math.random() * 8}%`,
          }} />
        ))}
      </div>

      {/* Jetski rider SVG */}
      <div className={`splash-jetski ${phase}`}>
        <svg viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="splash-jetski-svg">
          {/* Water spray behind */}
          <g className="splash-spray" opacity="0.6">
            <ellipse cx="30" cy="105" rx="20" ry="6" fill="white" opacity="0.5"/>
            <ellipse cx="15" cy="100" rx="12" ry="4" fill="white" opacity="0.3"/>
            <ellipse cx="40" cy="110" rx="15" ry="5" fill="white" opacity="0.4"/>
          </g>

          {/* Jetski body */}
          <path d="M60,95 Q80,75 130,78 Q170,80 195,90 Q200,95 195,102 Q180,115 100,115 Q70,115 60,105 Z" 
                fill="url(#jetskiGrad)" stroke="#0369A1" strokeWidth="1.5"/>
          
          {/* Jetski seat */}
          <ellipse cx="140" cy="82" rx="25" ry="6" fill="#1E293B"/>
          
          {/* Jetski handle */}
          <path d="M165,75 Q170,60 175,58" stroke="#475569" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <circle cx="176" cy="56" r="3" fill="#475569"/>
          
          {/* Rider body */}
          <g className="splash-rider">
            {/* Legs */}
            <path d="M130,80 L125,95" stroke="#D4A06A" strokeWidth="4" strokeLinecap="round"/>
            <path d="M145,82 L150,95" stroke="#D4A06A" strokeWidth="4" strokeLinecap="round"/>
            
            {/* Torso */}
            <path d="M135,58 L135,80" stroke="#06B6D4" strokeWidth="8" strokeLinecap="round"/>
            
            {/* Arms */}
            <path d="M135,65 Q155,60 175,58" stroke="#D4A06A" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
            
            {/* Head */}
            <circle cx="135" cy="50" r="10" fill="#D4A06A"/>
            
            {/* Helmet */}
            <path d="M125,48 Q128,36 142,38 Q148,40 146,48" fill="#0EA5E9" stroke="#0284C7" strokeWidth="1"/>
            <path d="M126,48 L146,48" stroke="#0284C7" strokeWidth="1.5"/>
            
            {/* Sunglasses */}
            <path d="M129,48 L141,48" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round"/>
            
            {/* Smile */}
            <path d="M132,53 Q135,56 138,53" stroke="#8B5A3A" strokeWidth="1" fill="none" strokeLinecap="round"/>
          </g>

          {/* Water line */}
          <path d="M55,108 Q80,100 120,105 Q160,110 200,102" stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none"/>
          
          {/* Speed lines */}
          <line x1="50" y1="88" x2="25" y2="85" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="55" y1="95" x2="28" y2="93" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="52" y1="102" x2="30" y2="101" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>

          <defs>
            <linearGradient id="jetskiGrad" x1="60" y1="78" x2="200" y2="115" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06B6D4"/>
              <stop offset="50%" stopColor="#0EA5E9"/>
              <stop offset="100%" stopColor="#0284C7"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand text */}
      <div className={`splash-brand ${phase}`}>
        <div className="splash-logo-icon">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
            <path d="M4,20 Q8,14 12,18 Q16,22 20,16 Q24,10 28,14" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M4,26 Q8,20 12,24 Q16,28 20,22 Q24,16 28,20" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
          </svg>
        </div>
        <h1 className="splash-title">Watersport Banyuwangi</h1>
        <p className="splash-subtitle">Adventure Awaits</p>
      </div>

      {/* Loading bar */}
      <div className="splash-loader">
        <div className="splash-loader-bar" />
      </div>
    </div>
  );
}
