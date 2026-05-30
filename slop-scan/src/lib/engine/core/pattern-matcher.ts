// pattern-matcher.ts
// TF-IDF vectorization + cosine similarity
// used for comparing documents to each other in batch mode
// Pattern Matcher
// TF-IDF vectorization and cosine similarity
// ============================================================

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/\b[a-z']+\b/g) || []);
}

/** Build TF-IDF vector for a document given corpus IDF */
export function buildTFVector(words: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
  const tf = new Map<string, number>();
  for (const [word, count] of freq) {
    tf.set(word, count / words.length);
  }
  return tf;
}

/** Cosine similarity between two TF vectors */
export function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  const allKeys = new Set([...a.keys(), ...b.keys()]);
  for (const key of allKeys) {
    const va = a.get(key) || 0;
    const vb = b.get(key) || 0;
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

/** Find pairs of similar texts */
export function findSimilarPairs(
  texts: string[],
  threshold = 0.75
): Array<{ i: number; j: number; similarity: number }> {
  const vectors = texts.map(t => buildTFVector(tokenize(t)));
  const pairs: Array<{ i: number; j: number; similarity: number }> = [];

  for (let i = 0; i < vectors.length; i++) {
    for (let j = i + 1; j < vectors.length; j++) {
      const sim = cosineSimilarity(vectors[i], vectors[j]);
      if (sim > threshold) {
        pairs.push({ i, j, similarity: sim });
      }
    }
  }

  return pairs.sort((a, b) => b.similarity - a.similarity);
}
