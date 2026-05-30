'use client';
import { getScoreColor } from '@/lib/types';

interface Category { name: string; score: number; }

export default function ScoreBreakdown({ categories }: { categories: Category[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {categories.map((cat) => (
        <div key={cat.name}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cat.name}</span>
            <span className="data-value" style={{ fontSize: '0.8rem', color: getScoreColor(cat.score) }}>{cat.score.toFixed(1)}</span>
          </div>
          <div className="score-bar">
            <div className="score-bar-fill" style={{
              width: `${Math.min(100, Math.max(0, cat.score))}%`,
              background: `linear-gradient(90deg, ${getScoreColor(cat.score)}80, ${getScoreColor(cat.score)})`,
              boxShadow: `0 0 8px ${getScoreColor(cat.score)}60`,
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}
