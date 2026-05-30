// Track H: Social & News — Detect synthetic social content

import { AI_VOCAB_SET } from '@/lib/data/ai-vocabulary';
import { FILLER_PHRASES } from '@/lib/data/filler-phrases';

const ENGAGEMENT_BAIT = [
  /\b(you won't believe)\b/i,
  /\b(this (will|is going to) (change|blow|shock))\b/i,
  /\b(share (this|if you agree))\b/i,
  /\b(tag someone who)\b/i,
  /\b(drop a .+ in the comments)\b/i,
  /\b(follow (me|us) for more)\b/i,
  /\b(don't (miss|forget|sleep on) this)\b/i,
  /\b(thread|🧵)\b/i,
  /\b(here's why|here is why)\b/i,
  /\b(unpopular opinion)\b/i,
  /\b(hot take)\b/i,
  /\b(breaking|just in|developing)\s*:/i,
];

const SYNTHETIC_NEWS_PATTERNS = [
  /\b(sent shockwaves through)\b/i,
  /\b(paradigm shift)\b/i,
  /\b(far-reaching implications)\b/i,
  /\b(fundamentally reshape)\b/i,
  /\b(transformative (decision|development|change))\b/i,
  /\b(stakeholders from various sectors)\b/i,
  /\b(multifaceted nature)\b/i,
  /\b(remains to be seen)\b/i,
  /\b(time will tell)\b/i,
];

export function analyzeSocial(text: string): number {
  const lower = text.toLowerCase();
  const words = (lower.match(/\b[a-z']+\b/g) || []);
  let score = 0;

  // Engagement bait
  for (const p of ENGAGEMENT_BAIT) {
    if (p.test(text)) score += 8;
  }

  // Synthetic news patterns
  // TODO: should we weight this differently?
  for (const p of SYNTHETIC_NEWS_PATTERNS) {
    if (p.test(text)) score += 10;
  }

  // AI vocabulary
  score += words.filter(w => AI_VOCAB_SET.has(w)).length * 6;

  // Filler phrases
  for (const p of FILLER_PHRASES) {
    if (lower.includes(p.toLowerCase())) score += 8;
  }

  // Excessive hashtags
  const hashtags = (text.match(/#\w+/g) || []).length;
  if (hashtags > 4) score += 10;

  // Excessive emojis
  const emojis = (text.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
  if (emojis > 5) score += 8;

  // Emotional language ratio
  // empirically this seems about right
  const emotional = words.filter(w =>
    ['shocking', 'outrageous', 'incredible', 'unbelievable', 'devastating',
     'heartbreaking', 'horrifying', 'terrifying', 'alarming', 'explosive',
     'stunning', 'bombshell', 'scandal', 'crisis', 'chaos'].includes(w)
  ).length;
  if (emotional > 2) score += emotional * 5;

  // No sources cited in news-like content
  if (words.length > 80 && /\b(report|announced|stated|according)\b/i.test(text)) {
    if (!/\b(said|told|confirmed)\s+[A-Z]/.test(text) && !/\b(source|official|spokesperson)\b/i.test(text)) {
      score += 10;
    }
  }

  // Vague without specifics for news
  if (words.length > 100 && !/\d/.test(text) && !/[A-Z][a-z]+ [A-Z][a-z]+/.test(text.slice(1))) {
    score += 12;
  }

  return Math.min(100, Math.round(score));
}
