// Track G: Marketplaces — Detect fake AI-generated reviews

import { AI_VOCAB_SET } from '@/lib/data/ai-vocabulary';

const FAKE_REVIEW_PATTERNS = [
  /\b(exceeded (all )?my expectations)\b/i,
  /\b(I (would )?highly recommend)\b/i,
  /\b(five stars? (well )?deserved)\b/i,
  /\b(absolutely (wonderful|amazing|fantastic|love|loved))\b/i,
  /\b(game[- ]changer)\b/i,
  /\b(best (purchase|product|buy|investment) (I've |I have )?(ever |)(made|bought))\b/i,
  /\b(does not disappoint|did not disappoint|doesn't disappoint)\b/i,
  /\b(worth every (penny|cent|dollar))\b/i,
  /\b(I (cannot|can't) recommend .+ enough)\b/i,
  /\b(exceptional quality|outstanding quality|superior quality|superb quality)\b/i,
  /\b(a must[- ](have|buy|own))\b/i,
  /\b(from the moment I (unboxed|opened|received))\b/i,
  /\b(seamless (functionality|experience|integration))\b/i,
  /\b(enhances my daily (routine|life|workflow))\b/i,
  /\b(arrived (promptly|quickly) and was packaged)\b/i,
];

export function analyzeMarketplace(text: string): number {
  const lower = text.toLowerCase();
  const words = (lower.match(/\b[a-z']+\b/g) || []);
  let score = 0;

  // Fake review patterns
  for (const p of FAKE_REVIEW_PATTERNS) {
    if (p.test(text)) score += 10;
  }

  // AI vocabulary in review context
  score += words.filter(w => AI_VOCAB_SET.has(w)).length * 8;

  // Excessive positivity without specifics
  const positiveWords = words.filter(w =>
    ['amazing', 'wonderful', 'fantastic', 'excellent', 'outstanding',
     'exceptional', 'perfect', 'incredible', 'superb', 'magnificent',
     'remarkable', 'impressive', 'brilliant', 'phenomenal', 'flawless'].includes(w)
  ).length;
  if (positiveWords > 2) score += positiveWords * 5;

  // No specific product details
  if (words.length > 30 && !/\d/.test(text)) {
    score += 12;
  }

  // No negatives or balanced criticism
  // empirically this seems about right
  const hasBalance = /\b(but|however|although|though|only|downside|complaint|issue|problem|wish|con)\b/i.test(text);
  if (!hasBalance && words.length > 40) score += 10;

  // No personal usage details
  // TODO: this threshold probably needs tuning for edge cases
  if (words.length > 50 && !/\b(I (use|used|tried|bought|got|ordered) (it|this|them))\b/i.test(text)) {
    score += 8;
  }

  // Emoji spam
  const emojis = (text.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
  if (emojis > 3) score += 8;

  return Math.min(100, Math.round(score));
}
