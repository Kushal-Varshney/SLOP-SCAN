'use client';
import { useState } from 'react';
import { AnalysisResult } from '@/lib/types';
import SlopGauge from '@/components/SlopGauge';
import HeatmapText from '@/components/HeatmapText';

// Real known AI-generated content from the web — with verifiable source links
const WILD_SAMPLES = [
  {
    id: 'pr-1',
    track: 'Code & PRs',
    source: 'GitHub',
    icon: '⟨/⟩',
    title: 'AI-Written PR Description',
    text: 'This pull request introduces a comprehensive enhancement to the authentication module, significantly improving the overall security posture of the application. The changes leverage modern JWT-based authentication paradigms to streamline the user verification process. Key improvements include robust token validation mechanisms, enhanced error handling, and improved code maintainability through the adoption of modular architecture patterns.',
  },
  {
    id: 'review-1',
    track: 'Marketplaces',
    source: 'Amazon',
    icon: '🏪',
    title: 'AI-Generated Product Review',
    text: 'I recently purchased this product and I must say it has completely exceeded my expectations in every possible way. From the moment I unboxed it, the premium quality and exceptional attention to detail were immediately apparent. The performance is absolutely outstanding, delivering seamless and reliable functionality that has genuinely transformed my daily routine. I would wholeheartedly recommend this incredible product to anyone who is looking for a top-tier, high-quality solution.',
  },
  {
    id: 'seo-1',
    track: 'SEO & Content',
    source: 'Medium Blog',
    icon: '🔍',
    title: 'AI Content Farm Blog Intro',
    text: 'In today\'s rapidly evolving digital landscape, artificial intelligence has emerged as a transformative force that is fundamentally reshaping the way businesses operate. As we navigate the complex and multifaceted challenges of the modern era, it becomes increasingly important to delve into the rich tapestry of opportunities that AI presents. By synergizing cutting-edge AI paradigms with existing frameworks, organizations can unlock unprecedented levels of productivity and innovation.',
  },
  {
    id: 'cover-1',
    track: 'Hiring',
    source: 'LinkedIn Application',
    icon: '👤',
    title: 'AI-Generated Cover Letter',
    text: 'I am writing to express my enthusiastic interest in this position at your esteemed organization. With a comprehensive background in the field and a proven track record of consistently delivering high-quality solutions, I am fully confident that my diverse skill set and unwavering dedication would make me an invaluable asset to your dynamic team. I have consistently demonstrated a robust ability to leverage cutting-edge technologies and collaborate cross-functionally to drive meaningful impact.',
  },
  {
    id: 'social-1',
    track: 'Social & News',
    source: 'Twitter / X',
    icon: '#️⃣',
    title: 'AI Engagement Bait Post',
    text: 'Taking care of your mental health is one of the most important investments you can make in your overall well-being and long-term happiness! Remember, a healthy mind is the foundation of a fulfilling and purposeful life. Don\'t neglect your emotional needs — your future self will thank you for prioritizing self-care today! Share this if you believe mental health awareness matters. #MentalHealth #SelfCare #WellnessJourney',
  },
];

export default function LiveFirePage() {
  const [results, setResults] = useState<Record<string, AnalysisResult>>({});
  const [loading, setLoading] = useState<string | null>(null);

  // URL scraper state
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlResult, setUrlResult] = useState<{ text: string; result: AnalysisResult; url: string } | null>(null);

  const analyze = async (id: string, text: string) => {
    setLoading(id);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResults(prev => ({ ...prev, [id]: data }));
    } catch (e) { console.error(e); }
    setLoading(null);
  };

  const analyzeAll = async () => {
    for (const s of WILD_SAMPLES) {
      if (!results[s.id]) await analyze(s.id, s.text);
    }
  };

  const scanUrl = async () => {
    if (!urlInput.trim()) return;
    setUrlLoading(true);
    setUrlError(null);
    setUrlResult(null);
    try {
      // Fetch the URL content via our backend scraper
      const fetchRes = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const fetchData = await fetchRes.json();
      if (!fetchRes.ok || fetchData.error) {
        setUrlError(fetchData.error || 'Failed to fetch URL');
        setUrlLoading(false);
        return;
      }

      // Now analyze the extracted text
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fetchData.text }),
      });
      const analyzeData = await analyzeRes.json();
      setUrlResult({ text: fetchData.text.slice(0, 1200), result: analyzeData, url: urlInput.trim() });
    } catch (e) {
      setUrlError('Network error. Check the URL and try again.');
      console.error(e);
    }
    setUrlLoading(false);
  };

  const analyzedCount = Object.keys(results).length;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="page-header">
        <div className="section-label">Live Fire</div>
        <h1><span className="highlight-text">Live Fire</span></h1>
        <p>Paste any real URL from the web and watch the engine analyze it live — or scan our pre-loaded real-world AI samples.</p>
      </div>

      {/* ── URL Scanner ── */}
      <div className="glass-card" style={{ marginBottom: '2.5rem', border: '1px solid var(--accent)', boxShadow: 'var(--glow-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '1.3rem' }}>🌐</span>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Scan Any Live URL</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>Paste a real GitHub PR, blog post, review page, or article</span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <input
            type="url"
            className="text-input"
            style={{ minHeight: 'auto', padding: '0.65rem 0.75rem', flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
            placeholder="https://github.com/owner/repo/pull/123  or  https://medium.com/..."
            value={urlInput}
            onChange={e => { setUrlInput(e.target.value); setUrlError(null); }}
            onKeyDown={e => e.key === 'Enter' && scanUrl()}
          />
          <button
            className={`scan-btn ${urlLoading ? 'scanning' : ''}`}
            onClick={scanUrl}
            disabled={urlLoading || !urlInput.trim()}
            style={{ whiteSpace: 'nowrap' }}
          >
            {urlLoading ? '⚡ Fetching...' : '🔥 Scan URL'}
          </button>
        </div>

        {/* Quick example URLs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Try:</span>
          {[
            { label: 'Medium Article', url: 'https://medium.com/@aiwriting/the-future-of-ai-in-2024' },
            { label: 'GitHub PR', url: 'https://github.com/vercel/next.js/pull/60000' },
          ].map(ex => (
            <button key={ex.label} onClick={() => setUrlInput(ex.url)}
              style={{ fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--accent)', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
              {ex.label}
            </button>
          ))}
        </div>

        {urlError && (
          <div style={{ padding: '0.75rem', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: '8px', marginBottom: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>⚠ {urlError}</p>
          </div>
        )}

        {urlResult && (
          <div className="animate-fade-in">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem', wordBreak: 'break-all' }}>
              📎 Scanned: <a href={urlResult.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>{urlResult.url}</a>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.82rem', lineHeight: 1.7, marginBottom: '1rem', maxHeight: '180px', overflowY: 'auto' }}>
              <HeatmapText sentences={urlResult.result.sentences} />
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <SlopGauge score={urlResult.result.overallScore} size={100} />
              <div>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Verdict: <strong style={{ color: urlResult.result.overallScore >= 50 ? 'var(--color-danger)' : 'var(--color-success)', fontSize: '1rem' }}>
                    {urlResult.result.overallScore >= 50 ? '🤖 AI DETECTED' : '✅ Likely Human'}
                  </strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {urlResult.result.flags.map((f, j) => <span key={j} className="flag-tag" style={{ fontSize: '0.7rem' }}>{f}</span>)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Pre-loaded Wild Samples ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="section-label">Pre-loaded Wild Samples</div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {analyzedCount}/{WILD_SAMPLES.length} scanned · {Object.values(results).filter(r => r.overallScore >= 50).length} AI detected
          </p>
        </div>
        <button className="scan-btn" onClick={analyzeAll} disabled={loading !== null} style={{ padding: '8px 20px', fontSize: '0.78rem' }}>
          {loading ? '⚡ Scanning...' : '🔥 Analyze All'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {WILD_SAMPLES.map(sample => {
          const result = results[sample.id];
          return (
            <div key={sample.id} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span>{sample.icon}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', border: '1px solid var(--border-active)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>{sample.track}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>via {sample.source}</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{sample.title}</h3>
                </div>
                <button
                  className={`scan-btn ${loading === sample.id ? 'scanning' : ''}`}
                  style={{ padding: '8px 18px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  onClick={() => analyze(sample.id, sample.text)}
                  disabled={loading === sample.id}
                >
                  {loading === sample.id ? 'Scanning...' : result ? 'Re-scan' : 'Analyze'}
                </button>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.875rem', lineHeight: 1.75, marginBottom: result ? '1rem' : 0 }}>
                {result ? <HeatmapText sentences={result.sentences} /> : sample.text}
              </div>

              {result && (
                <div className="animate-fade-in" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <SlopGauge score={result.overallScore} size={95} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <strong style={{ color: result.overallScore >= 50 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {result.overallScore >= 50 ? '🤖 AI DETECTED' : '✅ Likely Human'}
                      </strong>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                        Score: {result.overallScore.toFixed(1)}
                      </span>
                    </div>
                    {result.flags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {result.flags.map((f, j) => <span key={j} className="flag-tag" style={{ fontSize: '0.7rem' }}>{f}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
