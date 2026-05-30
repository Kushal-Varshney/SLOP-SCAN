// types.ts — all the typescript interfaces for the engine
// nothing fancy, just shape definitions
// SLOP SCAN — Shared Types
// ============================================================

/** Track identifiers */
export type TrackId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export interface TrackInfo {
  id: TrackId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
}

export const TRACKS: Record<TrackId, TrackInfo> = {
  A: { id: 'A', name: 'Code Review', shortName: 'Code', description: 'Detect hollow AI-generated pull requests, commit messages, and code comments.', icon: '⟨/⟩', color: '#3b82f6' },
  B: { id: 'B', name: 'Docs & KBs', shortName: 'Docs', description: 'Scan documentation for AI-generated filler that sounds correct but teaches nothing.', icon: '📄', color: '#8b5cf6' },
  C: { id: 'C', name: 'Hiring & Resumes', shortName: 'Hiring', description: 'Expose AI-generated resumes, cover letters, and take-home submissions.', icon: '👤', color: '#ec4899' },
  D: { id: 'D', name: 'Communications', shortName: 'Comms', description: 'Filter inflated AI-expanded messages in workplace channels.', icon: '💬', color: '#f59e0b' },
  E: { id: 'E', name: 'Content & SEO', shortName: 'SEO', description: 'Detect AI-generated SEO content, blog farms, and filler articles.', icon: '🔍', color: '#10b981' },
  F: { id: 'F', name: 'Academia', shortName: 'Academic', description: 'Protect scholarly integrity from AI papers and fabricated citations.', icon: '🎓', color: '#6366f1' },
  G: { id: 'G', name: 'Marketplaces', shortName: 'Reviews', description: 'Expose fake AI-generated reviews flooding marketplaces.', icon: '🏪', color: '#f97316' },
  H: { id: 'H', name: 'Social & News', shortName: 'Social', description: 'Detect synthetic content and bot networks in social feeds.', icon: '#', color: '#ef4444' },
};

// ---- Analyzer Results ----

export interface LinguisticResult {
  ttr: number;                    // Type-Token Ratio (0-1)
  mattr: number;                  // Moving Average TTR
  hapaxRatio: number;             // Hapax legomena ratio
  fleschKincaid: number;          // Grade level
  colemanLiau: number;            // Grade level
  gunningFog: number;             // Fog index
  readabilityVariance: number;    // Std dev of readability across paragraphs
  avgSentenceLength: number;
  sentenceLengthStdDev: number;
}

export interface StatisticalResult {
  shannonEntropy: number;         // Word-level entropy
  entropyVariance: number;        // Variance of per-sentence entropy
  burstiness: number;             // Sentence length burstiness (-1 to 1)
  zipfDeviation: number;          // Deviation from Zipf's law
  vocabPredictability: number;    // % words in top-1000 common English
}

export interface StructuralResult {
  aiVocabDensity: number;         // AI vocabulary words per 1000 words
  fillerPhraseCount: number;      // Number of filler phrases found
  fillerPhrases: string[];        // The actual phrases found
  emDashDensity: number;          // Em-dashes per 1000 words
  sentenceUniformity: number;     // Coefficient of variation of sentence lengths
  paragraphUniformity: number;    // CV of paragraph lengths
  openingDiversity: number;       // Diversity of sentence openers (0-1)
  hedgingDensity: number;         // Hedging language per 1000 words
}

export interface DensityResult {
  lexicalDensity: number;         // Content words / total words
  informationDensity: number;     // Info-bearing sentences / total
  fillerRatio: number;            // Filler / total sentences
  specificityScore: number;       // Named entities + numbers per sentence
}

export interface SimilarityResult {
  selfSimilarity: number;         // Average intra-document paragraph similarity
  maxSimilarity: number;          // Maximum paragraph pair similarity
}

// ---- Composite Result ----

export interface SentenceAnalysis {
  text: string;
  score: number;                  // 0 (human) to 100 (AI/slop)
  flags: string[];
}

export interface AnalysisResult {
  overallScore: number;           // 0-100 SLOP score
  confidence: number;             // 0-100 confidence level
  verdict: 'clean' | 'low' | 'medium' | 'high' | 'critical';
  linguistic: LinguisticResult;
  statistical: StatisticalResult;
  structural: StructuralResult;
  density: DensityResult;
  similarity: SimilarityResult;
  sentences: SentenceAnalysis[];
  flags: string[];                // Human-readable flags
  trackScores?: Partial<Record<TrackId, number>>;
}

// ---- API Types ----

export interface AnalyzeRequest {
  text: string;
  track?: TrackId;
  allTracks?: boolean;
}

export interface BatchAnalyzeRequest {
  texts: string[];
  track?: TrackId;
}

export interface BakeoffResult {
  totalSamples: number;
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  perTrack: Record<string, {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    total: number;
  }>;
}

export interface DatasetSample {
  text: string;
  label: 'human' | 'ai';
  source: string;
  track: string;
}

// ---- Score thresholds ----
export function getVerdict(score: number): AnalysisResult['verdict'] {
  if (score < 25) return 'clean';
  if (score < 50) return 'low';
  if (score < 75) return 'medium';
  if (score < 90) return 'high';
  return 'critical';
}

export function getScoreColor(score: number): string {
  if (score < 25) return '#3fb950';
  if (score < 50) return '#58a6ff';
  if (score < 75) return '#d29922';
  if (score < 90) return '#f85149';
  return '#ff7b72';
}
