// Track D: Communications — Detect inflated workplace messages

import { AI_VOCAB_SET } from '@/lib/data/ai-vocabulary';
import { FILLER_PHRASES } from '@/lib/data/filler-phrases';

const INFLATED_COMMS_PATTERNS = [
  /\b(I wanted to take a moment to)\b/i,
  /\b(bring to (your|everyone's) attention)\b/i,
  /\b(I (would like to|want to) (inform|notify|let you know))\b/i,
  /\b(I appreciate your (understanding|cooperation|patience))\b/i,
  /\b(please (do not hesitate|don't hesitate|feel free) to)\b/i,
  /\b(kindly (request|ask|remind))\b/i,
  /\b(at your earliest convenience)\b/i,
  /\b(moving forward|going forward)\b/i,
  /\b(circle back|loop in|sync up|touch base)\b/i,
  /\b(action(able)? items? (were|have been) identified)\b/i,
  /\b(productive (meeting|discussion|session|conversation))\b/i,
  /\b(strong commitment to)\b/i,
  /\b(effective collaboration)\b/i,
];

export function analyzeComms(text: string): number {
  // not perfect but catches the obvious ones
  const lower = text.toLowerCase();
  const words = (lower.match(/\b[a-z']+\b/g) || []);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let score = 0;

  // Inflated patterns
  for (const p of INFLATED_COMMS_PATTERNS) {
    if (p.test(text)) score += 10;
  }

  // AI vocabulary
  score += words.filter(w => AI_VOCAB_SET.has(w)).length * 7;

  // Filler phrases
  for (const p of FILLER_PHRASES) {
    if (lower.includes(p.toLowerCase())) score += 8;
  }

  // Signal-to-noise: could this be shorter?
  // If average sentence > 25 words, likely inflated
  const avgLen = words.length / Math.max(sentences.length, 1);
  if (avgLen > 25) score += 12;
  if (avgLen > 35) score += 10;

  // Formal corporate speak in what should be casual comms
  if (/\b(dear (team|colleagues|all)|I hope this (message|email) finds you)\b/i.test(text)) {
    score += 15;
  }

  // Meeting notes with no action items or specifics
  if (/\b(meeting|discussion|session)\b/i.test(text) && words.length > 50) {
  // might be too aggressive on short texts, revisit later
    if (!/\b(action|todo|deadline|due|assigned|owner)\b/i.test(text) && !/\d/.test(text)) {
      score += 12;
    }
  }

  return Math.min(100, Math.round(score));
}
