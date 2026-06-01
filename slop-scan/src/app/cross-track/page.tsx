'use client';
import { useState } from 'react';
import { AnalysisResult, TRACKS, TrackId, getScoreColor } from '@/lib/types';
import SlopGauge from '@/components/SlopGauge';
import FileUpload from '@/components/FileUpload';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';

type InputMode = 'paste' | 'upload' | 'url';

export default function CrossTrackPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [trackScores, setTrackScores] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('paste');
  const [urlInput, setUrlInput] = useState('');
  const [urlFetching, setUrlFetching] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    setUrlFetching(true);
    setUrlError(null);
    setText('');
    setResult(null);
    setScannedUrl(null);
    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setUrlError(data.error || 'Failed to fetch URL'); }
      else { setText(data.text); setScannedUrl(urlInput.trim()); }
    } catch { setUrlError('Network error. Check the URL and try again.'); }
    setUrlFetching(false);
  };

  const radarData = trackScores ? Object.entries(TRACKS).map(([id, info]) => ({
    track: info.shortName,
    score: trackScores[id] || 0,
    fullMark: 100,
  })) : [];

  const bestTrack = trackScores ?
    Object.entries(trackScores).reduce((best, [id, score]) =>
      score > (best.score || 0) ? { id: id as TrackId, score } : best,
      { id: '' as TrackId, score: 0 }
    ) : null;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    background: 'none', border: 'none',
    padding: '0.625rem 1rem',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    fontFamily: 'var(--font-body)', fontSize: '0.875rem', cursor: 'pointer',
    borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
    transition: 'all 0.2s', whiteSpace: 'nowrap' as const,
  });

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="page-header">
        <div className="section-label">Cross-Track</div>
        <h1><span className="highlight-text">Cross-Track Radar</span></h1>
        <p>Analyze text across all 8 domain-specific tracks simultaneously.</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        {/* Input mode tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
          <button style={tabStyle(inputMode === 'paste')} onClick={() => setInputMode('paste')}>✏️ Paste Text</button>
          <button style={tabStyle(inputMode === 'upload')} onClick={() => setInputMode('upload')}>📁 Upload File</button>
          <button style={tabStyle(inputMode === 'url')} onClick={() => setInputMode('url')}>🌐 Scan URL</button>
        </div>

        {/* Upload mode */}
        {inputMode === 'upload' && (
          <div style={{ marginBottom: '1rem' }}>
            <FileUpload
              onTextExtracted={(t) => { setText(t); setUploadError(null); }}
              onError={(msg) => setUploadError(msg)}
            />
            {uploadError && (
              <div style={{ marginTop: '0.75rem', padding: '0.625rem 1rem', borderRadius: '8px', background: 'rgba(255,170,0,0.08)', border: '1px solid rgba(255,170,0,0.2)', color: 'var(--color-warning)', fontSize: '0.8rem' }}>
                ⚠️ {uploadError}
              </div>
            )}
          </div>
        )}

        {/* URL mode */}
        {inputMode === 'url' && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="url"
                className="text-input"
                style={{ minHeight: 'auto', padding: '0.65rem 0.75rem', flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                placeholder="https://github.com/owner/repo/pull/123  or  any blog/article URL..."
                value={urlInput}
                onChange={e => { setUrlInput(e.target.value); setUrlError(null); }}
                onKeyDown={e => e.key === 'Enter' && handleFetchUrl()}
              />
              <button
                className={`scan-btn ${urlFetching ? 'scanning' : ''}`}
                onClick={handleFetchUrl}
                disabled={urlFetching || !urlInput.trim()}
                style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                {urlFetching ? 'Fetching...' : '🌐 Fetch'}
              </button>
            </div>
            {urlError && (
              <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>
                ⚠ {urlError}
              </div>
            )}
            {scannedUrl && (
              <div style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontFamily: 'var(--font-mono)', marginTop: '0.4rem' }}>
                ✅ Fetched: <a href={scannedUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>{scannedUrl}</a>
              </div>
            )}
          </div>
        )}

        {/* Textarea — always visible */}
        <textarea
          className="text-input" rows={4}
          placeholder={inputMode === 'url' ? 'Fetched content will appear here...' : inputMode === 'upload' ? 'File content will appear here...' : 'Paste any content — we\'ll figure out the domain...'}
          value={text} onChange={e => setText(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <span className="label">{text.length} characters</span>
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
                  <Tooltip contentStyle={{ background: '#1f242c', border: '1px solid #30363d', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} labelStyle={{ color: '#58a6ff' }} />
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
                    <div className="score-bar-fill" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${getScoreColor(score)}80, ${getScoreColor(score)})`, boxShadow: `0 0 6px ${getScoreColor(score)}40` }} />
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
