'use client';
import { useState } from 'react';
import { AnalysisResult, TRACKS, TrackId, getScoreColor } from '@/lib/types';
import SlopGauge from '@/components/SlopGauge';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';

export default function CrossTrackPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [trackScores, setTrackScores] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, allTracks: true }),
      });
      const data: AnalysisResult = await res.json();
      setResult(data);
      setTrackScores(data.trackScores || null);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const radarData = trackScores ? Object.entries(TRACKS).map(([id, info]) => ({
    track: info.shortName,
    score: trackScores[id] || 0,
    fullMark: 100,
  })) : [];

  // Find best matching track
  const bestTrack = trackScores ?
    Object.entries(trackScores).reduce((best, [id, score]) =>
      score > (best.score || 0) ? { id: id as TrackId, score } : best,
      { id: '' as TrackId, score: 0 }
    ) : null;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="page-header">
        <div className="section-label">Cross-Track</div>
        <h1><span className="highlight-text">Cross-Track Radar</span></h1>
        <p>Analyze text across all 8 domain-specific tracks simultaneously.</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <textarea
          className="text-input" rows={4}
          placeholder="Paste any content — we'll figure out the domain..."
          value={text} onChange={e => setText(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button className={`scan-btn ${loading ? 'scanning' : ''}`} onClick={handleScan} disabled={loading || !text.trim()}>
            {loading ? 'Scanning All Tracks...' : 'Cross-Track Scan'}
          </button>
        </div>
      </div>

      {result && trackScores && (
        <div className="animate-slide-up">
          <div className="bento-grid-2" style={{ marginBottom: '1.5rem' }}>
            {/* Overall Score */}
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <SlopGauge score={result.overallScore} size={180} />
              <p className="label" style={{ marginTop: '0.5rem' }}>Overall SLOP Score</p>
              {bestTrack && bestTrack.score > 0 && (
                <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Best match: <strong style={{ color: TRACKS[bestTrack.id]?.color }}>{TRACKS[bestTrack.id]?.name}</strong> (score: {bestTrack.score})
                </p>
              )}
            </div>

            {/* Radar Chart */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Track Radar</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="track" tick={{ fill: '#8b949e', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1f242c', border: '1px solid #30363d', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                    labelStyle={{ color: '#58a6ff' }}
                  />
                  <Radar dataKey="score" stroke="#58a6ff" fill="#58a6ff" fillOpacity={0.15} strokeWidth={2} dot={{ fill: '#58a6ff', r: 4 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per-track scores */}
          <div className="bento-grid">
            {Object.entries(TRACKS).map(([id, info]) => {
              const score = trackScores[id] || 0;
              return (
                <div key={id} className="glass-card" style={{ borderLeft: `3px solid ${info.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{info.icon}</span>
                    <span className="data-value" style={{ fontSize: '1.25rem', color: getScoreColor(score) }}>{score}</span>
                  </div>
                  <h3 style={{ fontSize: '0.85rem', marginBottom: '0.375rem' }}>{info.name}</h3>
                  <div className="score-bar">
                    <div className="score-bar-fill" style={{
                      width: `${score}%`,
                      background: `linear-gradient(90deg, ${getScoreColor(score)}80, ${getScoreColor(score)})`,
                      boxShadow: `0 0 6px ${getScoreColor(score)}40`,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
