import { NextResponse } from 'next/server';
import { analyzeText } from '@/lib/engine';
import { BakeoffResult, DatasetSample } from '@/lib/types';
import dataset from '@/data/datasets/all-tracks.json';

export async function POST() {
  try {
    const samples = dataset as DatasetSample[];
    let tp = 0, tn = 0, fp = 0, fn = 0;
    const trackStats: Record<string, { tp: number; tn: number; fp: number; fn: number }> = {};

    for (const sample of samples) {
      const result = analyzeText(sample.text);
      const predictedAI = result.overallScore >= 50;
      const actualAI = sample.label === 'ai';

      // Init track
      if (!trackStats[sample.track]) {
        trackStats[sample.track] = { tp: 0, tn: 0, fp: 0, fn: 0 };
      }

      if (predictedAI && actualAI) { tp++; trackStats[sample.track].tp++; }
      else if (!predictedAI && !actualAI) { tn++; trackStats[sample.track].tn++; }
      else if (predictedAI && !actualAI) { fp++; trackStats[sample.track].fp++; }
      else { fn++; trackStats[sample.track].fn++; }
    }

    const total = tp + tn + fp + fn;
    const accuracy = total > 0 ? (tp + tn) / total : 0;
    const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
    const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
    const f1Score = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

    const perTrack: BakeoffResult['perTrack'] = {};
    for (const [track, s] of Object.entries(trackStats)) {
      const t = s.tp + s.tn + s.fp + s.fn;
      const p = (s.tp + s.fp) > 0 ? s.tp / (s.tp + s.fp) : 0;
      const r = (s.tp + s.fn) > 0 ? s.tp / (s.tp + s.fn) : 0;
      perTrack[track] = {
        accuracy: t > 0 ? (s.tp + s.tn) / t : 0,
        precision: p,
        recall: r,
        f1Score: (p + r) > 0 ? 2 * (p * r) / (p + r) : 0,
        total: t,
      };
    }

    const result: BakeoffResult = {
      totalSamples: total,
      truePositives: tp, trueNegatives: tn,
      falsePositives: fp, falseNegatives: fn,
      accuracy, precision, recall, f1Score, perTrack,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Bakeoff error:', error);
    return NextResponse.json({ error: 'Bakeoff failed' }, { status: 500 });
  }
}
