'use client';

interface ExportButtonProps {
  result: Record<string, unknown>;
  text: string;
}

export default function ExportButton({ result, text }: ExportButtonProps) {
  const handleExportJSON = () => {
    const exportData = {
      ...result,
      exportedAt: new Date().toISOString(),
      textPreview: text.slice(0, 200) + (text.length > 200 ? '...' : ''),
      textLength: text.length,
      wordCount: (text.match(/\b\w+\b/g) || []).length,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slop-scan-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = async () => {
    // encode the score into a shareable format
    const r = result as { overallScore?: number; verdict?: string; confidence?: number };
    const summary = `SLOP SCAN result: ${r.overallScore}/100 (${r.verdict}) — ${r.confidence}% confidence`;
    try {
      await navigator.clipboard.writeText(summary);
      const btn = document.getElementById('copy-btn');
      if (btn) {
        btn.textContent = 'copied!';
        setTimeout(() => { btn.textContent = '📋 copy summary'; }, 1500);
      }
    } catch {
      // fallback
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <button
        onClick={handleExportJSON}
        style={{
          background: 'rgba(88, 166, 255, 0.1)',
          border: '1px solid rgba(88, 166, 255, 0.2)',
          color: 'var(--accent)',
          padding: '0.4rem 0.8rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          transition: 'all 0.2s',
        }}
        onMouseOver={e => {
          (e.target as HTMLButtonElement).style.background = 'rgba(88, 166, 255, 0.15)';
        }}
        onMouseOut={e => {
          (e.target as HTMLButtonElement).style.background = 'rgba(88, 166, 255, 0.1)';
        }}
      >
        💾 export json
      </button>
      <button
        id="copy-btn"
        onClick={handleCopyLink}
        style={{
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          color: 'var(--accent)',
          padding: '0.4rem 0.8rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          transition: 'all 0.2s',
        }}
        onMouseOver={e => {
          (e.target as HTMLButtonElement).style.background = 'rgba(139, 92, 246, 0.15)';
        }}
        onMouseOut={e => {
          (e.target as HTMLButtonElement).style.background = 'rgba(139, 92, 246, 0.08)';
        }}
      >
        📋 copy summary
      </button>
    </div>
  );
}
