'use client';
import { useEffect, useState } from 'react';
import { getScoreColor } from '@/lib/types';

export default function SlopGauge({ score, size = 200 }: { score: number; size?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - animatedScore / 100);
  const color = getScoreColor(animatedScore);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }} className="animate-score-reveal">
      <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)`, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.5s' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.22, fontWeight: 900, color, textShadow: `0 0 20px ${color}80`, transition: 'color 0.5s' }}>
          {animatedScore}
        </span>
        <span className="label" style={{ fontSize: size * 0.05 }}>SLOP SCORE</span>
      </div>
    </div>
  );
}
