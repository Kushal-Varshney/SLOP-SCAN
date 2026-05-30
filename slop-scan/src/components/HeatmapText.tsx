'use client';
import { SentenceAnalysis, getVerdict } from '@/lib/types';

export default function HeatmapText({ sentences }: { sentences: SentenceAnalysis[] }) {
  if (!sentences || sentences.length === 0) return null;

  return (
    <div style={{ lineHeight: 2, fontSize: '0.9375rem' }}>
      {sentences.map((s, i) => {
        const v = getVerdict(s.score);
        return (
          <span key={i} className={`sentence sentence-${v}`} title={s.flags.length > 0 ? `Score: ${s.score}\n${s.flags.join('\n')}` : `Score: ${s.score} — Clean`}>
            {s.text}{' '}
          </span>
        );
      })}
    </div>
  );
}
