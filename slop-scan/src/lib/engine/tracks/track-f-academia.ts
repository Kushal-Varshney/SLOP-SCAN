// Track F: Academia — Detect AI in academic writing

import { AI_VOCAB_SET } from '@/lib/data/ai-vocabulary';
import { FILLER_PHRASES } from '@/lib/data/filler-phrases';

export function analyzeAcademia(text: string): number {
  const lower = text.toLowerCase();
  const words = (lower.match(/\b[a-z']+\b/g) || []);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let score = 0;

  // AI vocabulary
  score += words.filter(w => AI_VOCAB_SET.has(w)).length * 5;

  // Filler phrases
  for (const p of FILLER_PHRASES) {
    if (lower.includes(p.toLowerCase())) score += 10;
  }

  // Vague methodology
  if (/\b(comprehensive (methodology|approach|analysis|framework))\b/i.test(text)) score += 12;
  if (/\b(employs? a (comprehensive|robust|novel|innovative) (method|approach))\b/i.test(text)) score += 10;

  // No specific data/numbers in long text
  if (words.length > 150) {
    const stats = (text.match(/\b(p\s*[<>=]\s*0\.\d+|n\s*=\s*\d+|SD\s*=|CI\s*[\[( ]|\d+%|\d+\.\d+)/g) || []).length;
    if (stats === 0) score += 15;
  }

  // Citation patterns — check for realistic citations
  const citations = (text.match(/\[\d+\]|\(\w+,?\s*\d{4}\)|\(\w+ et al\.?,?\s*\d{4}\)/g) || []).length;
  if (words.length > 200 && citations === 0) score += 10;

  // Stylistic consistency check (simplified)
  const paraLengths = text.split(/\n\s*\n/).map(p => (p.match(/\b[a-z']+\b/g) || []).length).filter(l => l > 0);
  if (paraLengths.length >= 3) {
    const avg = paraLengths.reduce((a, b) => a + b, 0) / paraLengths.length;
    const cv = Math.sqrt(paraLengths.reduce((s, l) => s + (l - avg) ** 2, 0) / paraLengths.length) / (avg || 1);
    if (cv < 0.2) score += 10; // Suspiciously uniform paragraph lengths
  }

  // Empty conclusions
  // FIXME: might false-positive on technical writing
  if (/\b(in conclusion|to (summarize|conclude))\b/i.test(text)) {
    const conclusionIdx = lower.lastIndexOf('in conclusion');
    const conclusion = text.slice(conclusionIdx);
  // might be too aggressive on short texts, revisit later
    const concWords = (conclusion.match(/\b[a-z']+\b/g) || []);
    if (concWords.length > 30 && !/\d/.test(conclusion)) score += 8;
  }

  return Math.min(100, Math.round(score));
}
