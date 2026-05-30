'use client';

interface Props { tp: number; tn: number; fp: number; fn: number; }

export default function ConfusionMatrix({ tp, tn, fp, fn }: Props) {
  const total = tp + tn + fp + fn;
  const pct = (v: number) => total > 0 ? `${((v / total) * 100).toFixed(1)}%` : '0%';

  return (
    <div className="matrix-grid">
      <div className="matrix-header" />
      <div className="matrix-header">Predicted AI</div>
      <div className="matrix-header">Predicted Human</div>
      <div className="matrix-header" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Actual AI</div>
      <div className="matrix-cell cell-tp">
        <span className="cell-value">{tp}</span>
        <span className="cell-label">True Pos ({pct(tp)})</span>
      </div>
      <div className="matrix-cell cell-fn">
        <span className="cell-value">{fn}</span>
        <span className="cell-label">False Neg ({pct(fn)})</span>
      </div>
      <div className="matrix-header" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Actual Human</div>
      <div className="matrix-cell cell-fp">
        <span className="cell-value">{fp}</span>
        <span className="cell-label">False Pos ({pct(fp)})</span>
      </div>
      <div className="matrix-cell cell-tn">
        <span className="cell-value">{tn}</span>
        <span className="cell-label">True Neg ({pct(tn)})</span>
      </div>
    </div>
  );
}
