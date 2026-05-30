// statistical-analyzer.ts
// the math-heavy one. entropy, burstiness, zipf deviation.
// human writing is messy; AI writing is suspiciously clean
// Statistical Analyzer
// Entropy, burstiness, Zipf deviation, vocab predictability
// ============================================================

import { StatisticalResult } from '@/lib/types';
import { COMMON_WORDS } from '@/lib/data/common-words';

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/\b[a-z']+\b/g) || []);
}

function splitSentences(text: string): string[] {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
}

/** Shannon Entropy on word frequencies */
function shannonEntropy(words: string[]): number {
  if (words.length === 0) return 0;
  const freq = new Map<string, number>();
  words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / words.length;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return entropy;
}

/** Entropy variance across sentences */
function entropyVariance(sentences: string[]): number {
  if (sentences.length < 2) return 0;
  const entropies = sentences.map(s => shannonEntropy(tokenize(s)));
  const mean = entropies.reduce((a, b) => a + b, 0) / entropies.length;
  const variance = entropies.reduce((sum, e) => sum + (e - mean) ** 2, 0) / entropies.length;
  return Math.sqrt(variance);
}

/** Burstiness: (σ - μ) / (σ + μ) for sentence lengths */
function burstiness(sentences: string[]): number {
  if (sentences.length < 2) return 0;
  const lengths = sentences.map(s => tokenize(s).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, l) => sum + (l - mean) ** 2, 0) / lengths.length;
  const sigma = Math.sqrt(variance);
  if (sigma + mean === 0) return 0;
  return (sigma - mean) / (sigma + mean);
}

/** Zipf's law deviation */
function zipfDeviation(words: string[]): number {
  if (words.length === 0) return 0;
  const freq = new Map<string, number>();
  words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
  const sorted = [...freq.values()].sort((a, b) => b - a);
  if (sorted.length === 0) return 0;

  const topFreq = sorted[0];
  const n = Math.min(sorted.length, 50);
  let totalDeviation = 0;

  for (let rank = 0; rank < n; rank++) {
    const expected = topFreq / (rank + 1);
    const actual = sorted[rank];
    if (expected > 0) {
      totalDeviation += Math.abs(actual - expected) / expected;
    }
  }
  return totalDeviation / n;
}

/** Vocabulary predictability: % of words in common set */
function vocabPredictability(words: string[]): number {
  if (words.length === 0) return 0;
  const common = words.filter(w => COMMON_WORDS.has(w)).length;
  return common / words.length;
}

export function analyzeStatistical(text: string): StatisticalResult {
  const words = tokenize(text);
  const sentences = splitSentences(text);

  return {
    shannonEntropy: shannonEntropy(words),
    entropyVariance: entropyVariance(sentences),
    burstiness: burstiness(sentences),
    zipfDeviation: zipfDeviation(words),
    vocabPredictability: vocabPredictability(words),
  };
}
