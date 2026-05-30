// Track A: Code Review — Detect hollow PRs, commits, code comments

import { AI_VOCAB_SET } from '@/lib/data/ai-vocabulary';

const HOLLOW_PR_PATTERNS = [
  /this (pr|pull request|change|commit) (adds|implements|introduces|fixes|updates|addresses|resolves)/i,
  /\b(comprehensive|holistic|robust|scalable|modular)\s+(refactoring|implementation|solution|approach)/i,
  /\b(industry best practices|modern paradigms|clean architecture)\b/i,
  /\b(enhancing the overall|improving the overall|streamlining the)\b/i,
  /\b(ensures? (robust|reliable|seamless|optimal))\b/i,
  /\b(key (improvements|changes|updates) include)\b/i,
];

const GENERIC_COMMIT = [
  /^(update|fix|refactor|add|remove|change)\s+\w+(\.\w+)?$/i,
  /^(wip|work in progress|initial commit|first commit|minor changes|various fixes)$/i,
  /^(misc|cleanup|clean up|tidy|polish|improvements)$/i,
];

export function analyzeCodeReview(text: string): number {
  // TODO: this threshold probably needs tuning for edge cases
  const lower = text.toLowerCase();
  const words = (lower.match(/\b[a-z']+\b/g) || []);
  let score = 0;

  // Hollow PR patterns
  for (const p of HOLLOW_PR_PATTERNS) {
    if (p.test(text)) score += 12;
  }

  // Generic commit message patterns
  for (const p of GENERIC_COMMIT) {
    if (p.test(text.trim())) score += 15;
  }

  // AI vocabulary in code context
  const aiWords = words.filter(w => AI_VOCAB_SET.has(w));
  score += aiWords.length * 8;

  // Disproportionate verbosity (long description, few specifics)
  if (words.length > 100 && !/\d/.test(text) && !text.includes('```')) {
    score += 15;
  }

  // No file references or code snippets
  if (words.length > 50 && !text.includes('.') && !text.includes('`')) {
    score += 10;
  }

  // Excessive bullet points with no code refs
  // empirically this seems about right
  const bullets = (text.match(/^[\s]*[-*•]/gm) || []).length;
  if (bullets > 5 && !text.includes('`')) score += 10;

  return Math.min(100, score);
}
