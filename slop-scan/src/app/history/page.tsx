'use client';
import { useEffect, useState } from 'react';

interface HistoryEntry {
  id: string;
  date: string;
  snippet: string;
  track: string;
  score: number;
  verdict: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('');

  useEffect(() => {
    const user = localStorage.getItem('slop_current_user') || 'guest';
    setCurrentUser(user);
    const stored = localStorage.getItem(`slop_history_${user}`);
    if (stored) {
      try { setHistory(JSON.parse(stored)); } catch { setHistory([]); }
    }
  }, []);

  const clearHistory = () => {
    const user = localStorage.getItem('slop_current_user') || 'guest';
    localStorage.removeItem(`slop_history_${user}`);
    setHistory([]);
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="section-label">Workspace</div>
          <h1><span className="highlight-text">Scan History</span></h1>
          <p>Review past analysis reports for <strong style={{ color: 'var(--accent)' }}>@{currentUser}</strong>. History is private to your account.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {history.length > 0 && (
            <button className="scan-btn" style={{ background: 'rgba(248,81,73,0.15)', border: '1px solid rgba(248,81,73,0.3)', color: 'var(--color-danger)', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              onClick={clearHistory}>
              Clear History
            </button>
          )}
          <button className="scan-btn" onClick={() => alert('Upgrade to Pro to enable CSV export.')}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginTop: '2rem' }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📋</div>
            <p>No scans yet for <strong>@{currentUser}</strong>.</p>
            <p style={{ fontSize: '0.85rem' }}>Run a scan from the Scanner page and it will appear here.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>ID</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Date</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Preview</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Track</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{row.id}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{row.date}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{row.snippet}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{row.track}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: row.score > 75 ? 'var(--color-danger)' : row.score > 50 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                      {row.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
