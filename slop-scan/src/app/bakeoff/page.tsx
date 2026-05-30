'use client';
import { useState } from 'react';
import { BakeoffResult } from '@/lib/types';
import ConfusionMatrix from '@/components/ConfusionMatrix';

export default function BakeoffPage() {
  const [result, setResult] = useState<BakeoffResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runBakeoff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bakeoff', { method: 'POST' });
      setResult(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="page-header">
        <div className="section-label">Benchmarks</div>
        <h1><span className="highlight-text">Transparency Report</span></h1>
        <p>Continuous evaluation metrics and accuracy reports for our detection models.</p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button className={`scan-btn ${loading ? 'scanning' : ''}`} onClick={runBakeoff} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Latest Report'}
        </button>
      </div>

      {loading && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ position: 'relative', height: '60px' }}>
            <div className="scan-overlay"><div className="scan-line" /></div>
          </div>
          <p className="label" style={{ marginTop: '1rem' }}>Analyzing dataset samples...</p>
        </div>
      )}

      {result && (
        <div className="animate-slide-up">
          {/* Stats Cards */}
          <div className="bento-grid" style={{ marginBottom: '2rem' }}>
            {[
              { label: 'Accuracy', value: pct(result.accuracy), color: 'var(--accent)' },
              { label: 'Precision', value: pct(result.precision), color: 'var(--color-success)' },
              { label: 'Recall', value: pct(result.recall), color: 'var(--accent)' },
              { label: 'F1 Score', value: pct(result.f1Score), color: 'var(--color-warning)' },
            ].map(s => (
              <div className="glass-card stat-card" key={s.label}>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Confusion Matrix + Details */}
          <div className="bento-grid-2">
            <div className="glass-card">
              <h3 style={{ marginBottom: '1.5rem' }}>Accuracy Analytics</h3>
              <ConfusionMatrix tp={result.truePositives} tn={result.trueNegatives} fp={result.falsePositives} fn={result.falseNegatives} />
              <p className="label" style={{ marginTop: '1rem' }}>Total Samples: {result.totalSamples}</p>
            </div>
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem' }}>Per-Track Results</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.entries(result.perTrack).map(([track, data]) => (
                  <div key={track} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{track.replace('-', ' ')}</span>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span className="data-value" style={{ fontSize: '0.8rem', color: data.accuracy >= 0.7 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {pct(data.accuracy)}
                      </span>
                      <span className="label" style={{ fontSize: '0.7rem' }}>n={data.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', marginTop: '1.5rem', padding: '1.25rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {result.accuracy > 0.9
                ? `${pct(result.accuracy)} accuracy across ${result.totalSamples} samples — no external ML models used.`
                : result.accuracy > 0.8
                ? `${pct(result.accuracy)} accuracy — detection uses only linguistic and statistical analysis.`
                : `${pct(result.accuracy)} accuracy — threshold tuning may improve results.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
