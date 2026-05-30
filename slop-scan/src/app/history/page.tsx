'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function HistoryPage() {

  // Mock data for the history table
  const MOCK_HISTORY = [
    { id: 'scan_09x8', date: '2026-05-30', snippet: 'Subject: Exciting new opportunity at...', track: 'Hiring', score: 82, verdict: 'high' },
    { id: 'scan_09x7', date: '2026-05-29', snippet: 'The quick brown fox jumps over the...', track: 'Social', score: 12, verdict: 'clean' },
    { id: 'scan_09x6', date: '2026-05-28', snippet: 'This PR introduces a robust framework...', track: 'Code', score: 94, verdict: 'critical' },
    { id: 'scan_09x5', date: '2026-05-28', snippet: "In today's fast-paced digital landscape...", track: 'SEO', score: 68, verdict: 'medium' },
  ];

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="section-label">Workspace</div>
          <h1><span className="highlight-text">Scan History</span></h1>
          <p>Review past analysis reports and export bulk data.</p>
        </div>
        <button className="scan-btn" onClick={() => alert('API Key required for bulk export. Upgrade to Pro.')}>
          Export CSV
        </button>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginTop: '2rem' }}>
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
            {MOCK_HISTORY.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{row.id}</td>
                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{row.date}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{row.snippet}</td>
                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{row.track}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: row.score > 75 ? 'var(--color-danger)' : row.score > 50 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                      {row.score}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
