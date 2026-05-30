// common-words.ts
// the 500 most frequent english words. used to measure
// how "basic" the vocabulary is (AI tends to stick to safe words)
// Top 500 Most Common English Words
// Used for vocabulary predictability scoring
// ============================================================

export const COMMON_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'is', 'are', 'was', 'were', 'been', 'being', 'has', 'had', 'did', 'does',
  'doing', 'am', 'may', 'might', 'must', 'shall', 'should', 'need', 'dare',
  'great', 'help', 'tell', 'ask', 'find', 'here', 'thing', 'many', 'well',
  'long', 'very', 'still', 'own', 'keep', 'let', 'begin', 'seem', 'show',
  'every', 'never', 'too', 'left', 'call', 'world', 'before', 'much', 'right',
  'old', 'off', 'try', 'around', 'move', 'live', 'where', 'again', 'run',
  'put', 'end', 'while', 'follow', 'each', 'start', 'hand', 'high', 'part',
  'place', 'last', 'small', 'number', 'always', 'between', 'turn', 'real',
  'read', 'why', 'line', 'set', 'under', 'head', 'stand', 'play', 'same',
  'point', 'page', 'house', 'mother', 'country', 'found', 'answer', 'school',
  'grow', 'study', 'learn', 'plant', 'cover', 'food', 'sun', 'four',
  'thought', 'state', 'open', 'city', 'tree', 'cross', 'farm', 'hard',
  'story', 'saw', 'far', 'sea', 'draw', 'near', 'add', 'earth', 'eye',
  'door', 'life', 'man', 'woman', 'children', 'change', 'important', 'until',
  'both', 'few', 'those', 'such', 'often', 'face', 'watch', 'write',
  'walk', 'talk', 'stop', 'cut', 'eat', 'close', 'white', 'name',
  'next', 'group', 'side', 'car', 'night', 'family', 'water', 'young',
  'body', 'paper', 'music', 'color', 'power', 'money', 'question', 'order',
  'hold', 'problem', 'bring', 'however', 'system', 'different', 'during',
  'business', 'three', 'five', 'example', 'fact', 'yet', 'program',
  'already', 'able', 'result', 'idea', 'best', 'less', 'without',
  'down', 'through', 'second', 'form', 'since', 'case', 'looking',
  'words', 'going', 'possible', 'nothing', 'little', 'once',
  'along', 'another', 'enough', 'early', 'upon', 'later', 'home',
  'course', 'done', 'given', 'making', 'per', 'whether', 'sort',
  'kind', 'bit', 'quite', 'sure', 'rather', 'data', 'process',
  'information', 'service', 'level', 'area', 'social', 'public',
  'company', 'development', 'report', 'experience', 'market',
  'support', 'project', 'provide', 'including', 'against', 'based',
  'using', 'working', 'having', 'getting', 'taking', 'making',
  'coming', 'going', 'looking', 'saying', 'doing', 'thinking',
  'something', 'everything', 'anything', 'nothing', 'someone',
  'everyone', 'anyone', 'himself', 'herself', 'itself', 'themselves',
  'really', 'actually', 'probably', 'certainly', 'perhaps', 'maybe',
  'simply', 'clearly', 'generally', 'usually', 'often', 'sometimes',
  'always', 'never', 'almost', 'exactly', 'especially', 'particularly',
  'basically', 'essentially', 'effectively', 'significantly',
]);

/** Check if a word is in the common words set */
export function isCommonWord(word: string): boolean {
  return COMMON_WORDS.has(word.toLowerCase());
}
