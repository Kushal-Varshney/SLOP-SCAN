// Track C: Hiring & Resumes — Detect generic AI applications

import { AI_VOCAB_SET } from '@/lib/data/ai-vocabulary';
import { FILLER_PHRASES } from '@/lib/data/filler-phrases';

const GENERIC_HIRING_PATTERNS = [
  /\b(passionate about|strong passion for)\b/i,
  /\b(proven (track record|ability))\b/i,
  /\b(highly motivated|self-motivated|detail-oriented|results-driven)\b/i,
  /\b(thrives? in (collaborative|fast-paced|dynamic) environments?)\b/i,
  /\b(valuable (addition|asset) to (your|the) team)\b/i,
  /\b(committed to (continuous|lifelong) learning)\b/i,
  /\b(esteemed (organization|company|institution))\b/i,
  /\b(express my (strong |sincere )?interest)\b/i,
  /\b(I am (writing|reaching out) to)\b/i,
  /\b(demonstrated (ability|expertise|proficiency))\b/i,
  /\b(deep understanding of)\b/i,
  /\b(cross-functional teams?)\b/i,
  /\b(delivering high-quality)\b/i,
  /\b(drive (innovation|business value|results))\b/i,
  /\b(staying at the forefront)\b/i,
];

export function analyzeHiring(text: string): number {
  const lower = text.toLowerCase();
  const words = (lower.match(/\b[a-z']+\b/g) || []);
  let score = 0;

  // Generic hiring patterns
  for (const p of GENERIC_HIRING_PATTERNS) {
    if (p.test(text)) score += 8;
  }

  // AI vocabulary
  const aiCount = words.filter(w => AI_VOCAB_SET.has(w)).length;
  score += aiCount * 6;

  // Filler phrases
  for (const p of FILLER_PHRASES) {
    if (lower.includes(p.toLowerCase())) score += 8;
  }

  // No specific company/role mentions (genericity)
  const hasCompanyName = /[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/.test(text) && /\b(at|for|with|to)\s+[A-Z]/.test(text);
  // not perfect but catches the obvious ones
  if (!hasCompanyName && words.length > 50) score += 12;

  // No specific metrics/numbers
  if (words.length > 80 && !/\d+%|\$\d|[\d,]+\s*(users|customers|requests|queries)/.test(text)) {
    score += 10;
  }

  // No personal anecdotes or specific projects
  // FIXME: might false-positive on technical writing
  if (words.length > 100 && !/I (built|created|designed|led|managed|shipped|migrated|fixed|debugged|wrote)/.test(text)) {
    score += 10;
  }

  return Math.min(100, Math.round(score));
}
