// density-scorer.ts
// measures how much actual information is in the text
// AI uses 100 words to say what a human says in 20
// Density Scorer
// Lexical density, information density, specificity
// ============================================================

import { DensityResult } from '@/lib/types';

const FUNCTION_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
  'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'under', 'about', 'against', 'among', 'around', 'upon',
  'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
  'not', 'only', 'also', 'than', 'that', 'which', 'who', 'whom',
  'this', 'these', 'those', 'it', 'its', 'he', 'she', 'they', 'we',
  'me', 'him', 'her', 'them', 'us', 'my', 'his', 'our', 'their',
  'your', 'i', 'you', 'if', 'then', 'else', 'when', 'while', 'where',
  'how', 'what', 'very', 'just', 'quite', 'rather', 'too', 'much',
]);

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/\b[a-z']+\b/g) || []);
}

function splitSentences(text: string): string[] {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
}

/** Lexical density: content words / total words */
function lexicalDensity(words: string[]): number {
  if (words.length === 0) return 0;
  const contentWords = words.filter(w => !FUNCTION_WORDS.has(w));
  return contentWords.length / words.length;
}

/** Information density: sentences with specific data / total */
function informationDensity(sentences: string[]): number {
  if (sentences.length === 0) return 0;
  let informative = 0;
  for (const s of sentences) {
    const hasNumber = /\d+/.test(s);
    const hasProperNoun = /[A-Z][a-z]{2,}/.test(s);
    const hasSpecificRef = /\b(e\.g\.|i\.e\.|such as|for example|specifically)\b/i.test(s);
    const hasCode = /`[^`]+`|[a-z]+\.[a-z]+\(|[A-Z_]{2,}|\/[a-z]+\//.test(s);
    if (hasNumber || hasProperNoun || hasSpecificRef || hasCode) {
      informative++;
    }
  }
  return informative / sentences.length;
}

/** Filler ratio: empty/vague sentences / total */
function fillerRatio(sentences: string[]): number {
  if (sentences.length === 0) return 0;
  let filler = 0;
  for (const s of sentences) {
    const words = tokenize(s);
    if (words.length < 4) { filler++; continue; }
    // Check for vague sentences (no specific nouns, numbers, or references)
    const hasSubstance = /\d/.test(s) || /[A-Z][a-z]{2,}/.test(s.slice(1));
    if (!hasSubstance && words.length > 15) filler++;
  }
  return filler / sentences.length;
}

/** Specificity score: numbers + proper nouns per sentence */
function specificityScore(sentences: string[]): number {
  if (sentences.length === 0) return 0;
  let total = 0;
  for (const s of sentences) {
    const numbers = (s.match(/\d+/g) || []).length;
    const properNouns = (s.match(/[A-Z][a-z]{2,}/g) || []).length;
    total += numbers + properNouns;
  }
  return total / sentences.length;
}

export function analyzeDensity(text: string): DensityResult {
  const words = tokenize(text);
  const sentences = splitSentences(text);

  return {
    lexicalDensity: lexicalDensity(words),
    informationDensity: informationDensity(sentences),
    fillerRatio: fillerRatio(sentences),
    specificityScore: specificityScore(sentences),
  };
}
