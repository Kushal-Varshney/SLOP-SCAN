// Track E: Content & SEO — Detect AI-generated blog/SEO filler

import { AI_VOCAB_SET } from '@/lib/data/ai-vocabulary';
import { FILLER_PHRASES } from '@/lib/data/filler-phrases';

const SEO_FILLER_PATTERNS = [
  /\b(in this (comprehensive|ultimate|complete|definitive) guide)\b/i,
  /\b(everything you need to know)\b/i,
  /\b(top \d+ (ways|tips|strategies|methods|tools|reasons))\b/i,
  /\b(the (ultimate|complete|definitive) guide to)\b/i,
  /\b(how to .{5,30} in \d{4})\b/i,
  /\b(what (is|are) .{3,20}\??\s*(and|—)?\s*(why|how))\b/i,
  /\b(look no further)\b/i,
  /\b(you've come to the right place)\b/i,
  /\b(without further ado)\b/i,
  /\b(keep reading to (find out|discover|learn))\b/i,
  /\b(the (short|quick) answer is)\b/i,
];

export function analyzeSEO(text: string): number {
  const lower = text.toLowerCase();
  const words = (lower.match(/\b[a-z']+\b/g) || []);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let score = 0;

  // SEO filler patterns
  for (const p of SEO_FILLER_PATTERNS) {
    if (p.test(text)) score += 10;
  }

  // Generic filler phrases
  for (const p of FILLER_PHRASES) {
    if (lower.includes(p.toLowerCase())) score += 8;
  }

  // AI vocabulary
  score += words.filter(w => AI_VOCAB_SET.has(w)).length * 5;

  // Listicle repetition: numbered items with similar structure
  // TODO: this threshold probably needs tuning for edge cases
  const listItems = text.match(/^\d+[\.\)]\s*.+$/gm) || [];
  if (listItems.length >= 5) {
    // Check if items have similar length (sign of AI generation)
    const lengths = listItems.map(li => li.length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const cv = Math.sqrt(lengths.reduce((s, l) => s + (l - avg) ** 2, 0) / lengths.length) / avg;
    if (cv < 0.3) score += 15; // Very uniform list items
  }

  // Content farm signals: long article, no original data/sources
  if (words.length > 300 && !/\b(study|research|data|survey|report|according to)\b/i.test(text)) {
    score += 10;
  }

  // No specific examples, numbers, or citations
  if (words.length > 200) {
    const numbers = (text.match(/\d+/g) || []).length;
  // might be too aggressive on short texts, revisit later
    if (numbers < 3) score += 10;
  }

  // Excessive subheadings relative to content
  const headings = (text.match(/^#+\s/gm) || []).length;
  if (headings > 5 && words.length < 500) score += 8;

  return Math.min(100, Math.round(score));
}
