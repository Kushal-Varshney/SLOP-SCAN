'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnalysisResult, TRACKS, TrackId } from '@/lib/types';
import SlopGauge from '@/components/SlopGauge';
import HeatmapText from '@/components/HeatmapText';
import ScoreBreakdown from '@/components/ScoreBreakdown';
import ExportButton from '@/components/ExportButton';
import FileUpload from '@/components/FileUpload';
import { Suspense } from 'react';

type InputMode = 'paste' | 'upload' | 'url';

function getScoreQuip(score: number): string {
  if (score < 20) return 'No significant AI patterns detected.';
  if (score < 50) return 'Minor AI indicators present, likely human-written.';
  if (score < 75) return 'Multiple AI-associated patterns detected.';
  return 'Strong AI-generation indicators across multiple signals.';
}

function ScannerContent() {
  const searchParams = useSearchParams();
  const initialTrack = (searchParams.get('track') as TrackId) || '';
  const [text, setText] = useState('');
  const [track, setTrack] = useState<TrackId | ''>(initialTrack);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('paste');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [urlFetching, setUrlFetching] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);

  const handleScan = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, track: track || undefined }),
      });
      if (!res.ok) throw new Error(`Analysis failed (${res.status})`);
      const data = await res.json();
      setResult(data);

      // Save to per-user history
      const user = localStorage.getItem('slop_current_user') || 'guest';
      const historyKey = `slop_history_${user}`;
      const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const entry = {
        id: `scan_${Math.random().toString(36).slice(2, 7)}`,
        date: new Date().toISOString().split('T')[0],
        snippet: text.trim().slice(0, 60) + '...',
        track: track ? track : 'All Tracks',
        score: Math.round(data.overallScore),
        verdict: data.verdict,
      };
      localStorage.setItem(historyKey, JSON.stringify([entry, ...existing].slice(0, 50)));
    } catch (e) {
      console.error(e);
      setApiError(e instanceof Error ? e.message : 'Something went wrong while analyzing.');
    }
    setLoading(false);
  };

  const handleTextExtracted = (extracted: string) => {
    setText(extracted);
    setUploadError(null);
  };

  const handleUploadError = (msg: string) => {
    setUploadError(msg);
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

  const selectedTrack = track ? TRACKS[track] : null;
  const breakdownCategories = result ? [
    { name: 'AI Vocabulary Density', score: Math.min(100, result.structural.aiVocabDensity * 3.3) },
    { name: 'Filler Phrases', score: Math.min(100, result.structural.fillerPhraseCount * 20) },
    { name: 'Entropy (Predictability)', score: Math.min(100, (1 - Math.min(result.statistical.shannonEntropy / 12, 1)) * 100) },
    { name: 'Burstiness (Uniformity)', score: Math.min(100, Math.max(0, (0.3 - result.statistical.burstiness) / 0.8 * 100)) },
    { name: 'Em-Dash Density', score: Math.min(100, result.structural.emDashDensity * 6.6) },
    { name: 'Information Density', score: Math.min(100, (1 - result.density.informationDensity) * 100) },
    { name: 'Self-Similarity', score: Math.min(100, result.similarity.selfSimilarity * 200) },
    { name: 'Vocab Predictability', score: Math.min(100, Math.max(0, (result.statistical.vocabPredictability - 0.4) / 0.4 * 100)) },
  ] : [];

  const scanningText = 'Analyzing...';

  const tabStyle = (active: boolean): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    padding: '0.625rem 1rem',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
  });

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="page-header">
        <div className="section-label">Scanner</div>
        <h1><span className="highlight-text">{selectedTrack ? `${selectedTrack.icon} ${selectedTrack.name}` : 'Universal Scanner'}</span></h1>
        <p>{selectedTrack
          ? selectedTrack.description
          : 'Analyze any text for AI-generated patterns across all detection tracks.'}</p>
      </div>

      <div className="two-col">
        {/* Input Panel */}
        <div>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Input Text</h3>
              <select className="select-input" value={track} onChange={e => setTrack(e.target.value as TrackId | '')}>
                <option value="">All tracks</option>
                {Object.values(TRACKS).map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
              </select>
            </div>

            {/* Tab Toggle */}
            <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              <button style={tabStyle(inputMode === 'paste')} onClick={() => setInputMode('paste')}>✏️ Paste Text</button>
              <button style={tabStyle(inputMode === 'upload')} onClick={() => setInputMode('upload')}>📁 Upload File</button>
              <button style={tabStyle(inputMode === 'url')} onClick={() => setInputMode('url')}>🌐 Scan URL</button>
            </div>

            {/* Upload Mode */}
            {inputMode === 'upload' && (
              <div style={{ marginBottom: '1rem' }}>
                <FileUpload onTextExtracted={handleTextExtracted} onError={handleUploadError} />
                {uploadError && (
                  <div style={{ marginTop: '0.75rem', padding: '0.625rem 1rem', borderRadius: '8px', background: 'rgba(255, 170, 0, 0.08)', border: '1px solid rgba(255, 170, 0, 0.2)', color: 'var(--color-warning)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    ⚠️ {uploadError}
                  </div>
                )}
              </div>
            )}

            {/* URL Mode */}
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

            {/* Textarea (always visible so user can edit extracted text too) */}
            <div style={{ position: 'relative' }}>
              <textarea
                className="text-input" rows={inputMode === 'upload' ? 4 : 6}
                placeholder={inputMode === 'upload'
                  ? 'File contents will appear here — you can edit before scanning...'
                  : 'Paste text to scan...'}
                value={text} onChange={e => setText(e.target.value)}
                style={{ transition: 'all 0.3s ease' }}
              />
              {loading && <div className="scan-overlay"><div className="scan-line" /></div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span className="label">{text.length} characters · {(text.match(/\b\w+\b/g) || []).length} words</span>
              <button className={`scan-btn ${loading ? 'scanning' : ''}`} onClick={handleScan} disabled={loading || !text.trim()}>
                {loading ? 'Analyzing...' : 'Analyze Text'}
              </button>
            </div>
            {apiError && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(248, 81, 73, 0.1)', border: '1px solid rgba(248, 81, 73, 0.3)' }}>
                <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', margin: 0, fontFamily: 'var(--font-mono)' }}>⚠ {apiError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div>
          {!result && !loading && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🔍</div>
              <p>Paste or upload text to see analysis results.</p>
            </div>
          )}
          {loading && !result && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse-glow 1.5s infinite' }}>🧪</div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{scanningText}</p>
            </div>
          )}
          {result && (
            <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <SlopGauge score={result.overallScore} size={180} />
                <div style={{ marginTop: '0.5rem' }}>
                  <span className="label">Confidence: {result.confidence}%</span>
                </div>
                <p style={{
                  marginTop: '0.75rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                }}>
                  {getScoreQuip(result.overallScore)}
                </p>
                <div style={{ marginTop: '0.75rem' }}>
                  <ExportButton result={result as unknown as Record<string, unknown>} text={text} />
                </div>
              </div>
              <div className="glass-card">
                <h3 style={{ marginBottom: '1rem' }}>Signal Breakdown</h3>
                <ScoreBreakdown categories={breakdownCategories} />
              </div>
              {result.flags.length > 0 && (
                <div className="glass-card">
                  <h3 style={{ marginBottom: '0.75rem' }}>Flags</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {result.flags.map((f, i) => <span key={i} className="flag-tag">{f}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Heatmap — full width */}
      {result && result.sentences.length > 0 && (
        <div className="glass-card animate-fade-in" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Sentence Heatmap</h3>
          <p className="label" style={{ marginBottom: '1rem' }}>Hover over highlighted sentences to see detection details</p>
          <HeatmapText sentences={result.sentences} />
        </div>
      )}
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}>
      <ScannerContent />
    </Suspense>
  );
}
