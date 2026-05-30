'use client';
import { useState } from 'react';
import { AnalysisResult, TRACKS, TrackId, getScoreColor } from '@/lib/types';
import SlopGauge from '@/components/SlopGauge';
import HeatmapText from '@/components/HeatmapText';
import ScoreBreakdown from '@/components/ScoreBreakdown';
import ExportButton from '@/components/ExportButton';
import Link from 'next/link';

const FEATURES = [
  { icon: '🔬', title: 'Linguistic Analysis', desc: 'Vocabulary diversity, readability metrics, sentence complexity' },
  { icon: '📊', title: 'Statistical Methods', desc: 'Entropy, burstiness, Zipf deviation, self-similarity' },
  { icon: '🧩', title: 'Structural Patterns', desc: 'AI vocabulary density, filler phrases, em-dash abuse' },
  { icon: '📄', title: 'File Upload', desc: 'Drag & drop .txt and .md files for instant analysis' },
  { icon: '🎯', title: 'Domain Tracks', desc: '8 specialized analyzers for code, docs, hiring, SEO & more' },
  { icon: '📤', title: 'Export Results', desc: 'Download JSON reports or copy summary to clipboard' },
];

export default function Home() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [track, setTrack] = useState<TrackId | ''>('');
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, track: track || undefined }),
      });
      if (!res.ok) throw new Error(`Analysis failed (${res.status})`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    }
    setLoading(false);
  };

  const breakdownCategories = result ? [
    { name: 'AI Vocabulary', score: Math.min(100, result.structural.aiVocabDensity * 3.3) },
    { name: 'Filler Phrases', score: Math.min(100, result.structural.fillerPhraseCount * 20) },
    { name: 'Entropy', score: Math.min(100, (1 - Math.min(result.statistical.shannonEntropy / 12, 1)) * 100) },
    { name: 'Burstiness', score: Math.min(100, ((0.3 - result.statistical.burstiness) / 0.8) * 100) },
    { name: 'Info Density', score: Math.min(100, (1 - result.density.informationDensity) * 100) },
    { name: 'Self-Similarity', score: Math.min(100, result.similarity.selfSimilarity * 200) },
  ] : [];

  const verdictColor = result
    ? result.overallScore < 30 ? 'var(--color-success)'
    : result.overallScore < 60 ? 'var(--color-warning)'
    : 'var(--color-danger)'
    : '';

  return (
    <div className="container">
      {/* Hero */}
      <section className="hero">
        <div className="section-label">Detection Engine</div>
        <h1>Slop Scan</h1>
        <p className="subtitle">
          Detect AI-generated content using linguistic analysis, statistical fingerprinting, and structural pattern matching.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">5</span>
            <span className="hero-stat-label">Core Analyzers</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">8</span>
            <span className="hero-stat-label">Domain Tracks</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">0</span>
            <span className="hero-stat-label">External APIs</span>
          </div>
        </div>
      </section>

      {/* Quick Scan */}
      <section className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3>Quick Scan</h3>
          <select className="select-input" value={track} onChange={e => setTrack(e.target.value as TrackId | '')}>
            <option value="">Auto-detect</option>
            {Object.values(TRACKS).map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div style={{ position: 'relative' }}>
          <textarea
            className="text-input"
            placeholder="Paste text here to analyze..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
          />
          {loading && <div className="scan-overlay"><div className="scan-line" /></div>}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', alignItems: 'center' }}>
          <button className={`scan-btn ${loading ? 'scanning' : ''}`} onClick={handleScan} disabled={loading || !text.trim()}>
            {loading ? 'Scanning...' : 'Analyze Text'}
          </button>
          {text.trim() && !loading && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {text.trim().split(/\s+/).length} words
            </span>
          )}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(248, 81, 73, 0.3)', background: 'rgba(248, 81, 73, 0.06)' }}>
          <p style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            ⚠ {error}
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <section className="result-section animate-slide-up" style={{ marginBottom: '3rem' }}>
          <div className="bento-grid-2">
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '2rem', paddingBottom: '2rem' }}>
              <SlopGauge score={result.overallScore} size={160} />
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.8rem',
                  color: verdictColor, textTransform: 'uppercase', letterSpacing: '1px',
                  background: `color-mix(in srgb, ${verdictColor} 12%, transparent)`,
                  padding: '4px 12px', borderRadius: '12px',
                  border: `1px solid color-mix(in srgb, ${verdictColor} 25%, transparent)`,
                  display: 'inline-block',
                }}>
                  {result.verdict}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Confidence: {result.confidence}%
                </div>
              </div>
            </div>
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Signal Breakdown</h3>
                <ExportButton result={result as unknown as Record<string, unknown>} text={text} />
              </div>
              <ScoreBreakdown categories={breakdownCategories} />
            </div>
          </div>

          {result.flags.length > 0 && (
            <div className="glass-card" style={{ marginTop: '0.75rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Detected Issues</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {result.flags.map((f, i) => <span key={i} className="flag-tag">{f}</span>)}
              </div>
            </div>
          )}

          <div className="glass-card" style={{ marginTop: '0.75rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Sentence Analysis</h3>
            <HeatmapText sentences={result.sentences} />
          </div>
        </section>
      )}

      {/* Features */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="page-header">
          <div className="section-label">How It Works</div>
          <h2>Detection Methods</h2>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Track Cards */}
      <section className="page-section">
        <div className="page-header">
          <div className="section-label">Domain-Specific</div>
          <h2>8 Detection Tracks</h2>
        </div>
        <div className="bento-grid">
          {Object.values(TRACKS).map((t) => (
            <Link href={`/scan?track=${t.id}`} key={t.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card interactive track-card" style={{ height: '100%', borderLeft: `3px solid ${t.color}` }}>
                <div className="track-icon">{t.icon}</div>
                <h3>{t.name}</h3>
                <p>{t.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
