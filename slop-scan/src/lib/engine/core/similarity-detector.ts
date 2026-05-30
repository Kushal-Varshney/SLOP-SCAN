// similarity-detector.ts
// checks if paragraphs within the same doc are basically
// saying the same thing. AI does this A LOT
// Similarity Detector
// Self-similarity within a document (paragraph-level)
// ============================================================

import { SimilarityResult } from '@/lib/types';
import { buildTFVector, cosineSimilarity } from './pattern-matcher';

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/\b[a-z']+\b/g) || []);
}

function splitParagraphs(text: string): string[] {
  // Split on double newlines, or treat every ~3 sentences as a paragraph
  const byNewline = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
  if (byNewline.length >= 3) return byNewline;
  // Fallback: split into chunks of ~3 sentences
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  if (sentences.length < 4) return [text];
  const chunks: string[] = [];
  for (let i = 0; i < sentences.length; i += 3) {
    chunks.push(sentences.slice(i, i + 3).join('. '));
  }
  return chunks;
}

export function analyzeSimilarity(text: string): SimilarityResult {
  const paragraphs = splitParagraphs(text);
  if (paragraphs.length < 2) {
    return { selfSimilarity: 0, maxSimilarity: 0 };
  }

  const vectors = paragraphs.map(p => buildTFVector(tokenize(p)));
  let totalSim = 0;
  let maxSim = 0;
  let pairCount = 0;

  for (let i = 0; i < vectors.length; i++) {
    for (let j = i + 1; j < vectors.length; j++) {
      const sim = cosineSimilarity(vectors[i], vectors[j]);
      totalSim += sim;
      maxSim = Math.max(maxSim, sim);
      pairCount++;
    }
  }

  return {
    selfSimilarity: pairCount > 0 ? totalSim / pairCount : 0,
    maxSimilarity: maxSim,
  };
}
