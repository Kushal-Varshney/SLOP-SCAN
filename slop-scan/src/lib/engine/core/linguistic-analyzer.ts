// linguistic-analyzer.ts
// vocabulary diversity, readability scores, hapax legomena
// (words used exactly once — humans do this naturally, AI doesn't)
// Linguistic Analyzer
// TTR, hapax, readability scores, sentence structure
// ============================================================

import { LinguisticResult } from '@/lib/types';

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/\b[a-z']+\b/g) || []);
}

function splitSentences(text: string): string[] {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
}

function splitParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  const matches = word.match(/[aeiouy]{1,}/g);
  return matches ? Math.max(matches.length, 1) : 1;
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance = arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

/** Type-Token Ratio */
function calcTTR(words: string[]): number {
  if (words.length === 0) return 0;
  return new Set(words).size / words.length;
}

/** Moving Average TTR (window=50) */
function calcMATTR(words: string[], windowSize = 50): number {
  if (words.length <= windowSize) return calcTTR(words);
  const ttrs: number[] = [];
  for (let i = 0; i <= words.length - windowSize; i++) {
    const window = words.slice(i, i + windowSize);
    ttrs.push(calcTTR(window));
  }
  return mean(ttrs);
}

/** Hapax legomena ratio */
function calcHapax(words: string[]): number {
  if (words.length === 0) return 0;
  const freq = new Map<string, number>();
  words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
  const hapax = [...freq.values()].filter(c => c === 1).length;
  return hapax / words.length;
}

/** Flesch-Kincaid Grade Level */
function fleschKincaid(words: string[], sentences: string[]): number {
  if (sentences.length === 0 || words.length === 0) return 0;
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  return 0.39 * (words.length / sentences.length) + 11.8 * (totalSyllables / words.length) - 15.59;
}

/** Coleman-Liau Index */
function colemanLiau(text: string, words: string[], sentences: string[]): number {
  if (words.length === 0 || sentences.length === 0) return 0;
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  const L = (letters / words.length) * 100;
  const S = (sentences.length / words.length) * 100;
  return 0.0588 * L - 0.296 * S - 15.8;
}

/** Gunning Fog Index */
function gunningFog(words: string[], sentences: string[]): number {
  if (sentences.length === 0 || words.length === 0) return 0;
  const complexWords = words.filter(w => countSyllables(w) >= 3).length;
  return 0.4 * ((words.length / sentences.length) + 100 * (complexWords / words.length));
}

export function analyzeLinguistic(text: string): LinguisticResult {
  const words = tokenize(text);
  const sentences = splitSentences(text);
  const paragraphs = splitParagraphs(text);

  // Sentence lengths
  const sentLengths = sentences.map(s => tokenize(s).length);

  // Readability variance across paragraphs
  const paraReadability = paragraphs.map(p => {
    const pw = tokenize(p);
    const ps = splitSentences(p);
    return fleschKincaid(pw, ps);
  });

  return {
    ttr: calcTTR(words),
    mattr: calcMATTR(words),
    hapaxRatio: calcHapax(words),
    fleschKincaid: fleschKincaid(words, sentences),
    colemanLiau: colemanLiau(text, words, sentences),
    gunningFog: gunningFog(words, sentences),
    readabilityVariance: stdDev(paraReadability),
    avgSentenceLength: mean(sentLengths),
    sentenceLengthStdDev: stdDev(sentLengths),
  };
}
