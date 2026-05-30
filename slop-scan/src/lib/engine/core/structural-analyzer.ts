// structural-analyzer.ts
// looks at the shape of the writing: sentence length patterns,
// em-dash abuse, hedging language, how sentences start

import { StructuralResult } from '@/lib/types';
import { AI_VOCAB_SET } from '@/lib/data/ai-vocabulary';
import { FILLER_PHRASES, HEDGING_PATTERNS } from '@/lib/data/filler-phrases';

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/\b[a-z']+\b/g) || []);
}

function splitSentences(text: string): string[] {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
}

function splitParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
}

function coefficientOfVariation(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  if (m === 0) return 0;
  const variance = arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance) / m;
}

/** Count AI vocabulary words per 1000 words */
function aiVocabDensity(words: string[]): number {
  if (words.length === 0) return 0;
  const count = words.filter(w => AI_VOCAB_SET.has(w)).length;
  // For short texts (<80 words), require 2+ matches to avoid noise
  // For longer texts, even 1 match contributes to density
  const minCount = words.length < 80 ? 2 : 1;
  if (count < minCount) return 0;
  return (count / words.length) * 1000;
}

/** Find filler phrases in text */
function findFillerPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const phrase of FILLER_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      found.push(phrase);
    }
  }
  return found;
}

/** Em-dash density per 1000 words */
function emDashDensity(text: string, wordCount: number): number {
  if (wordCount === 0) return 0;
  const emDashes = (text.match(/—|--|–/g) || []).length;
  return (emDashes / wordCount) * 1000;
}

/** Sentence opening diversity */
function openingDiversity(sentences: string[]): number {
  if (sentences.length === 0) return 0;
  const openers = sentences.map(s => {
    const firstWord = s.trim().split(/\s+/)[0]?.toLowerCase() || '';
    return firstWord;
  });
  const unique = new Set(openers);
  return unique.size / sentences.length;
}

/** Hedging language density per 1000 words */
function hedgingDensity(text: string, wordCount: number): number {
  if (wordCount === 0) return 0;
  let count = 0;
  for (const pattern of HEDGING_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  }
  return (count / wordCount) * 1000;
}

export function analyzeStructural(text: string): StructuralResult {
  const words = tokenize(text);
  const sentences = splitSentences(text);
  const paragraphs = splitParagraphs(text);

  const sentLengths = sentences.map(s => tokenize(s).length);
  const paraLengths = paragraphs.map(p => tokenize(p).length);
  const fillerPhrases = findFillerPhrases(text);

  return {
    aiVocabDensity: aiVocabDensity(words),
    fillerPhraseCount: fillerPhrases.length,
    fillerPhrases,
    emDashDensity: emDashDensity(text, words.length),
    sentenceUniformity: coefficientOfVariation(sentLengths),
    paragraphUniformity: coefficientOfVariation(paraLengths),
    openingDiversity: openingDiversity(sentences),
    hedgingDensity: hedgingDensity(text, words.length),
  };
}
