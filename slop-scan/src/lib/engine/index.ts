// engine/index.ts — main entry point
// wires up all the analyzers and runs them against the text
// SLOP SCAN — Detection Engine Entry Point
// ============================================================

import { AnalysisResult, TrackId, getVerdict } from '@/lib/types';
import { analyzeLinguistic } from './core/linguistic-analyzer';
import { analyzeStatistical } from './core/statistical-analyzer';
import { analyzeStructural } from './core/structural-analyzer';
import { analyzeDensity } from './core/density-scorer';
import { analyzeSimilarity } from './core/similarity-detector';
import { computeCompositeScore, analyzeSentences } from './core/composite-scorer';
import { analyzeCodeReview } from './tracks/track-a-code-review';
import { analyzeDocs } from './tracks/track-b-docs';
import { analyzeHiring } from './tracks/track-c-hiring';
import { analyzeComms } from './tracks/track-d-comms';
import { analyzeSEO } from './tracks/track-e-seo';
import { analyzeAcademia } from './tracks/track-f-academia';
import { analyzeMarketplace } from './tracks/track-g-marketplace';
import { analyzeSocial } from './tracks/track-h-social';

const trackAnalyzers: Record<TrackId, (text: string) => number> = {
  A: analyzeCodeReview,
  B: analyzeDocs,
  C: analyzeHiring,
  D: analyzeComms,
  E: analyzeSEO,
  F: analyzeAcademia,
  G: analyzeMarketplace,
  H: analyzeSocial,
};

export function analyzeText(text: string, track?: TrackId): AnalysisResult {
  if (!text || text.trim().length === 0) {
    return emptyResult();
  }

  const linguistic = analyzeLinguistic(text);
  const statistical = analyzeStatistical(text);
  const structural = analyzeStructural(text);
  const density = analyzeDensity(text);
  const similarity = analyzeSimilarity(text);
  const wordCount = (text.toLowerCase().match(/\b[a-z']+\b/g) || []).length;
  const { score, confidence, verdict } = computeCompositeScore(
    linguistic, statistical, structural, density, similarity, wordCount
  );
  const sentences = analyzeSentences(text);

  // Build flags
  const flags: string[] = [];
  if (structural.aiVocabDensity > 10) flags.push('High AI vocabulary density detected');
  if (structural.fillerPhraseCount > 0) flags.push(`${structural.fillerPhraseCount} filler phrase(s) found`);
  if (structural.emDashDensity > 5) flags.push('Elevated em-dash usage (common in AI text)');
  if (statistical.burstiness > -0.1) flags.push('Low sentence length variation (uniform writing)');
  if (density.informationDensity < 0.3) flags.push('Low information density — mostly filler');
  if (similarity.selfSimilarity > 0.4) flags.push('High self-repetition within document');
  if (linguistic.readabilityVariance < 1) flags.push('Suspiciously consistent readability across paragraphs');

  // Track scores
  const trackScores: Partial<Record<TrackId, number>> = {};
  if (track) {
    trackScores[track] = trackAnalyzers[track](text);
  }

  return {
    overallScore: score,
    confidence,
    verdict: verdict as AnalysisResult['verdict'],
    linguistic,
    statistical,
    structural,
    density,
    similarity,
    sentences,
    flags,
    trackScores,
  };
}

/** Run all track analyzers */
export function analyzeAllTracks(text: string): Record<TrackId, number> {
  const scores = {} as Record<TrackId, number>;
  for (const [id, fn] of Object.entries(trackAnalyzers)) {
    scores[id as TrackId] = fn(text);
  }
  return scores;
}

function emptyResult(): AnalysisResult {
  return {
    overallScore: 0, confidence: 0, verdict: 'clean',
    linguistic: { ttr: 0, mattr: 0, hapaxRatio: 0, fleschKincaid: 0, colemanLiau: 0, gunningFog: 0, readabilityVariance: 0, avgSentenceLength: 0, sentenceLengthStdDev: 0 },
    statistical: { shannonEntropy: 0, entropyVariance: 0, burstiness: 0, zipfDeviation: 0, vocabPredictability: 0 },
    structural: { aiVocabDensity: 0, fillerPhraseCount: 0, fillerPhrases: [], emDashDensity: 0, sentenceUniformity: 0, paragraphUniformity: 0, openingDiversity: 0, hedgingDensity: 0 },
    density: { lexicalDensity: 0, informationDensity: 0, fillerRatio: 0, specificityScore: 0 },
    similarity: { selfSimilarity: 0, maxSimilarity: 0 },
    sentences: [], flags: [], trackScores: {},
  };
}
