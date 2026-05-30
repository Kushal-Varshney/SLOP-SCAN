'use client';
import { useState } from 'react';
import { AnalysisResult } from '@/lib/types';
import SlopGauge from '@/components/SlopGauge';
import HeatmapText from '@/components/HeatmapText';

const EXAMPLES: Record<string, Array<{ title: string; text: string; expected: string }>> = {
  'Code Review': [
    { title: 'Human PR Description', expected: 'human', text: 'Fix: race condition in WebSocket reconnect. When the server drops connection during a batch upload, the retry logic was firing before the previous connection fully closed. Added a 100ms debounce and a connection state check. Repros with the load test in test/ws-stress.ts.' },
    { title: 'AI-Generated PR', expected: 'ai', text: 'This pull request introduces a comprehensive refactoring of the authentication module, enhancing the overall security posture of the application. The changes leverage modern JWT-based authentication paradigms to streamline the user verification process. Key improvements include robust token validation, enhanced error handling mechanisms, and improved code maintainability through modular architecture patterns.' },
  ],
  'SEO Content': [
    { title: 'Human Blog Post', expected: 'human', text: 'We tested GPT-4o against Claude 3.5 on 500 customer support tickets. GPT-4o resolved 73% correctly on first attempt; Claude hit 71%. But Claude had fewer hallucinated policy citations (2% vs 8%). For our use case (insurance claims), Claude\'s lower hallucination rate matters more. We\'re going with Claude.' },
    { title: 'AI SEO Article', expected: 'ai', text: 'In today\'s rapidly evolving digital landscape, artificial intelligence stands as a beacon of innovation and progress. As we navigate the complexities of the digital age, AI continues to reshape our world in profound and transformative ways. From streamlining business operations to enhancing personal productivity, the applications of AI are vast and multifaceted. This comprehensive guide explores the groundbreaking advancements in AI technology.' },
  ],
  'Reviews': [
    { title: 'Human Review', expected: 'human', text: 'Bought this for my 10-year-old\'s birthday. The battery life is decent — about 6 hours of continuous use, not the 8 they advertise. Screen is bright enough for outdoor use. My main complaint is the charging cable is proprietary and costs $25 to replace. The case scratches easily too. Overall fine for the price but don\'t expect premium build quality.' },
    { title: 'AI Fake Review', expected: 'ai', text: 'This product exceeded all my expectations! From the moment I unboxed it, I was impressed by the exceptional quality and attention to detail. The performance is outstanding, delivering seamless functionality that enhances my daily routine. I would highly recommend this product to anyone looking for a reliable and high-quality solution. Five stars well deserved!' },
  ],
  'Hiring': [
    { title: 'Human Cover Letter', expected: 'human', text: 'I\'m applying for the Senior Frontend Engineer role at Stripe. I\'ve spent the last 3 years building the checkout SDK at Square, where I reduced payment form load time from 2.1s to 0.4s by rewriting the iframe communication layer. Before that I was at a 12-person startup where I built their entire React component library from scratch.' },
    { title: 'AI Cover Letter', expected: 'ai', text: 'I am writing to express my strong interest in the Software Engineer position at your esteemed organization. With my comprehensive background in software development and a proven track record of delivering high-quality solutions, I am confident that I would be a valuable addition to your team. Throughout my career, I have consistently demonstrated my ability to leverage cutting-edge technologies to drive innovation.' },
  ],
  'Social / News': [
    { title: 'Human Social Post', expected: 'human', text: 'just got back from the dentist. apparently I\'ve been brushing too hard for years and wore down my enamel. $800 for two crowns next month. adulting is fun' },
    { title: 'AI Social Post', expected: 'ai', text: 'Taking care of your dental health is one of the most important investments you can make in your overall well-being! Remember, a healthy smile is a gateway to a healthier, happier life. Don\'t neglect your regular dental check-ups — your future self will thank you! #DentalHealth #SelfCare #WellnessJourney' },
  ],
};

export default function LiveFirePage() {
  const [activeTab, setActiveTab] = useState(Object.keys(EXAMPLES)[0]);
  const [results, setResults] = useState<Record<string, AnalysisResult>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const analyzeExample = async (key: string, text: string) => {
    setLoading(key);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResults(prev => ({ ...prev, [key]: data }));
    } catch (e) { console.error(e); }
    setLoading(null);
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="page-header">
        <div className="section-label">Live Fire</div>
        <h1><span className="highlight-text">Live Fire</span></h1>
        <p>Pre-loaded real-world content samples across all detection tracks.</p>
      </div>

      <div className="tabs">
        {Object.keys(EXAMPLES).map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {EXAMPLES[activeTab].map((ex, i) => {
          const key = `${activeTab}-${i}`;
          const result = results[key];
          return (
            <div key={key} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3>{ex.title}</h3>
                  <span className="label" style={{ color: ex.expected === 'ai' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    Expected: {ex.expected.toUpperCase()}
                  </span>
                </div>
                <button
                  className={`scan-btn ${loading === key ? 'scanning' : ''}`}
                  style={{ padding: '8px 20px', fontSize: '0.75rem' }}
                  onClick={() => analyzeExample(key, ex.text)}
                  disabled={loading === key}
                >
                  {loading === key ? 'Scanning...' : result ? 'Re-scan' : 'Analyze'}
                </button>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: result ? '1rem' : 0 }}>
                {result ? <HeatmapText sentences={result.sentences} /> : ex.text}
              </div>

              {result && (
                <div className="animate-fade-in" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <SlopGauge score={result.overallScore} size={100} />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Verdict: <strong style={{ color: result.verdict === 'clean' || result.verdict === 'low' ? 'var(--color-success)' : 'var(--color-danger)' }}>{result.verdict.toUpperCase()}</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {result.overallScore >= 50 && ex.expected === 'ai' ? '✅ Correct — detected as AI' :
                       result.overallScore < 50 && ex.expected === 'human' ? '✅ Correct — identified as human' :
                       '❌ Incorrect prediction'}
                    </div>
                    {result.flags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {result.flags.slice(0, 3).map((f, j) => <span key={j} className="flag-tag" style={{ fontSize: '0.7rem' }}>{f}</span>)}
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
