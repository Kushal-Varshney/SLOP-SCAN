// Track B: Docs & KBs — Detect AI filler in documentation

import { AI_VOCAB_SET } from '@/lib/data/ai-vocabulary';
import { FILLER_PHRASES } from '@/lib/data/filler-phrases';

export function analyzeDocs(text: string): number {
  const lower = text.toLowerCase();
  const words = (lower.match(/\b[a-z']+\b/g) || []);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let score = 0;

  // Filler phrases
  for (const p of FILLER_PHRASES) {
    if (lower.includes(p.toLowerCase())) score += 10;
  }

  // AI vocabulary
  const aiCount = words.filter(w => AI_VOCAB_SET.has(w)).length;
  score += aiCount * 6;

  // No code examples in docs
  if (words.length > 80 && !text.includes('`') && !text.includes('```') && !/\b(npm|pip|docker|git|curl)\b/.test(text)) {
    score += 15;
  }

  // No specific instructions (no numbered steps, no concrete commands)
  // kinda hacky but it works
  if (words.length > 60 && !/\d\.\s/.test(text) && !/step \d/i.test(text)) {
    score += 8;
  }

  // Circular explanation: heading restated in body
  const headingMatch = text.match(/^#+\s*(.+)$/m);
  if (headingMatch) {
    const heading = headingMatch[1].toLowerCase();
    const headingWords = heading.split(/\s+/);
    const bodyWords = lower.split(/\s+/);
    const overlap = headingWords.filter(w => w.length > 3 && bodyWords.filter(bw => bw === w).length > 2).length;
    if (overlap > 2) score += 12;
  }

  // Vague sentences ratio
  const vague = sentences.filter(s => {
    const sw = (s.toLowerCase().match(/\b[a-z']+\b/g) || []);
    return sw.length > 15 && !/\d/.test(s) && !s.includes('`');
  }).length;
  // not perfect but catches the obvious ones
  if (sentences.length > 0) score += (vague / sentences.length) * 20;

  return Math.min(100, Math.round(score));
}
