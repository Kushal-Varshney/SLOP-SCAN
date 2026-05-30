// composite-scorer.ts
// the brain of the operation. takes all the signal data from
// the other analyzers and smashes it into a single 0-100 score.
// spent way too long tuning these weights tbh

import {
  LinguisticResult, StatisticalResult, StructuralResult,
  DensityResult, SimilarityResult, SentenceAnalysis, getVerdict
} from '@/lib/types';
import { AI_VOCAB_SET } from '@/lib/data/ai-vocabulary';
import { AI_SENTENCE_STARTERS } from '@/lib/data/ai-vocabulary';
import { FILLER_PHRASES, AI_STRUCTURE_PATTERNS } from '@/lib/data/filler-phrases';

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Detect if text is casual/informal (which shouldn't be flagged as AI).
 * Casual markers: lowercase starts, contractions, slang, no formal structure.
 */
function casualScore(text: string): number {
  let casual = 0;
  // Starts with lowercase
  if (/^[a-z]/.test(text.trim())) casual += 0.2;
  // Has contractions like "I'm", "don't", "can't", "it's" (informal)
  const contractions = (text.match(/\b(i'm|don't|can't|won't|isn't|aren't|doesn't|didn't|shouldn't|couldn't|wouldn't|i've|i'll|i'd|that's|there's|here's|what's|who's|how's|let's|y'all|gonna|wanna|gotta|ain't)\b/gi) || []).length;
  casual += Math.min(contractions * 0.1, 0.4);
  // Very short sentences (casual speech)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const shortSentences = sentences.filter(s => s.trim().split(/\s+/).length < 8).length;
  if (sentences.length > 0 && shortSentences / sentences.length > 0.5) casual += 0.15;
  // Emoji/emoticons
  if (/[\u{1F300}-\u{1F9FF}]|[;:]-?[)(PD/\\|]/u.test(text)) casual += 0.1;
  // First-person narrative with specific details
  if (/\b(I|my|me)\b/i.test(text) && /\$?\d+/.test(text)) casual += 0.1;
  // Slang / informal markers
  if (/\b(lol|haha|yeah|nah|ok|tbh|imo|smh|idk|fwiw|btw|fyi)\b/i.test(text)) casual += 0.15;
  return Math.min(casual, 0.8);
}

/**
 * Normalize signals to 0-1 where 1 = likely AI.
 */
function normalizeSignals(
  ling: LinguisticResult,
  stat: StatisticalResult,
  struct: StructuralResult,
  dens: DensityResult,
  sim: SimilarityResult,
  wordCount: number,
) {
  // For short texts (<60 words), statistical signals are unreliable — dampen them
  const statDampen = wordCount < 60 ? 0.4 : wordCount < 100 ? 0.7 : 1.0;

  return {
    // --- VOCABULARY SIGNALS (strongest, reliable at any length) ---
    aiVocabDensity: clamp01(struct.aiVocabDensity / 15),
    fillerPhrases: clamp01(struct.fillerPhraseCount / 2),

    // --- STATISTICAL SIGNALS (length-dampened for short texts) ---
    entropy: clamp01((1 - (stat.shannonEntropy - 3) / 7) * statDampen),
    burstiness: clamp01(((0.1 - stat.burstiness) / 0.6) * statDampen),
    vocabPredictability: clamp01(((stat.vocabPredictability - 0.3) / 0.35) * statDampen),
    zipfDeviation: clamp01((stat.zipfDeviation / 1.5) * statDampen),

    // --- STRUCTURAL SIGNALS ---
    emDashDensity: clamp01(struct.emDashDensity / 8),
    sentenceUniformity: clamp01((1 - Math.min(struct.sentenceUniformity / 0.6, 1)) * statDampen),
    openingDiversity: clamp01((1 - struct.openingDiversity) * statDampen),
    hedgingDensity: clamp01(struct.hedgingDensity / 8),

    // --- LINGUISTIC SIGNALS ---
    readabilityVariance: clamp01((1 - Math.min(ling.readabilityVariance / 3, 1)) * statDampen),
    hapaxRatio: clamp01((1 - ling.hapaxRatio / 0.6) * statDampen),

    // --- DENSITY SIGNALS ---
    informationDensity: clamp01((1 - dens.informationDensity) * 0.8),
    specificity: clamp01((1 - Math.min(dens.specificityScore / 2, 1)) * 0.7),
    fillerRatio: clamp01(dens.fillerRatio * 2),

    // --- SIMILARITY ---
    selfSimilarity: clamp01(sim.selfSimilarity * 2.5 * statDampen),
  };
}

export function computeCompositeScore(
  ling: LinguisticResult,
  stat: StatisticalResult,
  struct: StructuralResult,
  dens: DensityResult,
  sim: SimilarityResult,
  wordCount: number = 100,
): { score: number; confidence: number; verdict: string } {
  const n = normalizeSignals(ling, stat, struct, dens, sim, wordCount);

  // these weights took forever to get right. don't touch them
  // unless you're running the full test suite after
  const weightedSignals: [number, number][] = [
    [0.14, n.aiVocabDensity],      // Lexical: strong
    [0.12, n.fillerPhrases],       // Lexical: strong
    [0.10, n.entropy],             // Statistical
    [0.12, n.burstiness],          // Statistical: very strong for AI
    [0.09, n.sentenceUniformity],  // Structural
    [0.08, n.selfSimilarity],      // Statistical: strong for long texts
    [0.06, n.openingDiversity],    // Structural
    [0.05, n.emDashDensity],       // Structural
    [0.05, n.informationDensity],  // Density
    [0.05, n.vocabPredictability], // Statistical
    [0.04, n.readabilityVariance], // Linguistic
    [0.03, n.hapaxRatio],          // Linguistic
    [0.03, n.specificity],         // Density
    [0.02, n.hedgingDensity],      // Structural
    [0.02, n.fillerRatio],         // Density
  ];

  let score = 0;
  let totalWeight = 0;
  for (const [weight, signal] of weightedSignals) {
    score += weight * signal;
    totalWeight += weight;
  }
  score = (score / totalWeight) * 100;

  // bump the score when lots of signals agree
  // TODO: maybe this should be logarithmic instead of step-wise?
  const strongSignals = weightedSignals.filter(([, v]) => v > 0.6).length;
  if (strongSignals >= 3) score = Math.min(100, score * 1.12);
  if (strongSignals >= 5) score = Math.min(100, score * 1.18);
  if (strongSignals >= 7) score = Math.min(100, score * 1.25); // rarely happens tbh

  // hard floors — if we KNOW there's AI vocab + fillers,
  // the score shouldn't be below these minimums no matter what
  if (struct.fillerPhraseCount >= 2 && struct.aiVocabDensity > 10) {
    score = Math.max(score, 65);
  }
  if (struct.fillerPhraseCount >= 3 || (struct.fillerPhraseCount >= 1 && struct.aiVocabDensity > 40)) {
    score = Math.max(score, 70); // pretty confident at this point
  }

  // graduated floors — more AI words = higher minimum score
  // FIXME: the thresholds here are kinda arbitrary, derived from testing
  if (struct.aiVocabDensity > 90) {
    score = Math.max(score, 65);
  } else if (struct.aiVocabDensity > 60) {
    score = Math.max(score, 58);
  } else if (struct.aiVocabDensity > 35) {
    score = Math.max(score, 52);
  } else if (struct.aiVocabDensity > 18) {
    score = Math.max(score, 50);
  }
  // this next part catches "clean" AI text that avoids buzzwords
  // but still has the telltale statistical fingerprint
  if (n.burstiness > 0.8 && n.selfSimilarity > 0.7) {
    // both maxed out = almost certainly AI, vocab or not
    score = Math.max(score, 58);
  } else if (n.burstiness > 0.8 || n.selfSimilarity > 0.8) {
    // At least one extreme statistical signal
    const otherStrong = [n.entropy, n.sentenceUniformity, n.readabilityVariance,
      n.vocabPredictability, n.hapaxRatio].filter(v => v > 0.6).length;
    if (otherStrong >= 2) {
      score = Math.max(score, 52);
    }
  }

  // caps section — prevent false positives on human text
  // the tricky part: some human writing (academic papers, technical docs)
  // can trigger a few signals, so we cap unless there's strong evidence
  if (struct.aiVocabDensity === 0 && struct.fillerPhraseCount === 0 && struct.hedgingDensity === 0) {
    const statSignals = [
      n.burstiness, n.entropy, n.selfSimilarity, n.sentenceUniformity,
      n.openingDiversity, n.readabilityVariance, n.hapaxRatio,
      n.vocabPredictability, n.informationDensity, n.specificity,
    ];
    const strongCount = statSignals.filter(v => v > 0.7).length;
    const mediumCount = statSignals.filter(v => v > 0.5).length;
    const evidence = strongCount * 2 + mediumCount;

    if (evidence >= 10) {
      score = Math.min(score, 70);
    } else if (evidence >= 7) {
      score = Math.min(score, 60);
    } else if (evidence >= 5) {
      score = Math.min(score, 55);
    } else if (evidence >= 3) {
      score = Math.min(score, 42);
    } else {
      score = Math.min(score, 30);
    }
  } else if (struct.aiVocabDensity < 15 && struct.fillerPhraseCount === 0) {
    // Minimal vocab, no fillers — but if stats are strong, be generous
    const statEvidence = [n.burstiness, n.selfSimilarity, n.entropy, n.sentenceUniformity]
      .filter(v => v > 0.7).length;
    score = Math.min(score, statEvidence >= 2 ? 65 : 52);
  }

  score = Math.round(Math.max(0, Math.min(100, score)));

  // confidence is basically "how many signals fired" — more data = more confident
  // caps at 95% because we're never 100% sure without ML
  const signalCount = weightedSignals.filter(([, v]) => v > 0.05 && v < 0.95).length;
  const confidence = Math.min(95, Math.round(35 + signalCount * 4 + strongSignals * 3));

  return { score, confidence, verdict: getVerdict(score) };
}

/** Analyze individual sentences */
export function analyzeSentences(text: string): SentenceAnalysis[] {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0 && text.trim()) {
    return [scoreSentence(text.trim())];
  }
  return sentences.map(s => scoreSentence(s));
}

function scoreSentence(sentence: string): SentenceAnalysis {
  const lower = sentence.toLowerCase().trim();
  const words = (lower.match(/\b[a-z']+\b/g) || []);
  const flags: string[] = [];
  let score = 0;

  // 1. AI vocabulary (strong signal)
  const aiWords = words.filter(w => AI_VOCAB_SET.has(w));
  if (aiWords.length > 0) {
    score += 12 + (aiWords.length - 1) * 8;
    flags.push(`AI vocabulary: ${[...new Set(aiWords)].join(', ')}`);
  }

  // 2. Filler phrases (very strong)
  let fillerFound = false;
  for (const phrase of FILLER_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      score += 30;
      flags.push(`Filler: "${phrase}"`);
      fillerFound = true;
      break;
    }
  }

  // 3. AI sentence starters
  if (!fillerFound) {
    for (const starter of AI_SENTENCE_STARTERS) {
      if (lower.startsWith(starter.toLowerCase())) {
        score += 15;
        flags.push(`AI pattern: "${starter}..."`);
        break;
      }
    }
  }

  // 4. Structural patterns
  for (const pattern of AI_STRUCTURE_PATTERNS) {
    if (pattern.test(sentence)) {
      score += 10;
      flags.push('AI structural pattern');
      break;
    }
  }

  // 5. Em-dashes
  const emDashes = (sentence.match(/—|--|–/g) || []).length;
  if (emDashes >= 2) { score += 8; flags.push('Multiple em-dashes'); }

  // 6. Vague long sentence
  if (words.length > 20 && !/\d/.test(sentence)) {
    const hasProperNoun = /[A-Z][a-z]{2,}/.test(sentence.slice(sentence.indexOf(' ') + 1));
    if (!hasProperNoun) { score += 10; flags.push('Long vague sentence'); }
  }

  // 7. Adjective stacking
  if (/\b(robust|scalable|comprehensive|holistic|innovative|dynamic|seamless|efficient|effective|reliable|powerful|intuitive)\s+(and|yet)\s+(robust|scalable|comprehensive|holistic|innovative|dynamic|seamless|efficient|effective|reliable|powerful|intuitive)\b/gi.test(sentence)) {
    score += 12; flags.push('AI adjective pairing');
  }

  // 8. "This [verb]s" pattern
  if (/^this (allows|enables|ensures|provides|creates|offers|facilitates|demonstrates|highlights|underscores|showcases|illustrates|represents|serves)/i.test(sentence.trim())) {
    score += 10; flags.push('"This [verb]s" pattern');
  }

  // 9. Formal connectors in non-academic context
  if (/\b(furthermore|moreover|additionally|consequently|subsequently|nevertheless|accordingly)\b/i.test(sentence)) {
    score += 5; flags.push('Formal connector');
  }

  return { text: sentence, score: Math.min(100, score), flags };
}
