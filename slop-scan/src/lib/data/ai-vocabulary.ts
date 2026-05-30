// ai-vocabulary.ts
// words that AI uses 10-50x more than humans
// if you see "delve" and "multifaceted" in the same paragraph... yeah
// AI Vocabulary Database — EXPANDED
// Words and phrases that appear disproportionately in AI text
// ============================================================

export const AI_VERBS = [
  'delve', 'leverage', 'utilize', 'facilitate', 'enhance', 'unlock',
  'foster', 'empower', 'navigate', 'streamline', 'optimize', 'spearhead',
  'revolutionize', 'underscore', 'harness', 'bolster', 'catalyze',
  'propel', 'amplify', 'augment', 'fortify', 'galvanize', 'invigorate',
  'synergize', 'transcend', 'reimagine', 'democratize', 'operationalize',
  'incentivize', 'contextualize', 'conceptualize', 'actualize',
  'prioritize', 'personalize', 'revolutionize', 'standardize',
  'maximize', 'minimize', 'elevate', 'cultivate', 'orchestrate',
  'illuminate', 'encompass', 'embody', 'encapsulate', 'underscore',
  'exemplify', 'necessitate', 'warrant', 'entail', 'endeavor',
];

export const AI_EMPHASIS = [
  'crucial', 'significant', 'comprehensive', 'pivotal', 'transformative',
  'paramount', 'essential', 'robust', 'profound', 'multifaceted',
  'overarching', 'indispensable', 'instrumental', 'meticulous', 'nuanced',
  'holistic', 'intricate', 'dynamic', 'versatile', 'innovative',
  'groundbreaking', 'unprecedented', 'remarkable', 'invaluable', 'integral',
  'foundational', 'quintessential', 'seminal', 'formidable', 'exemplary',
  'imperative', 'noteworthy', 'compelling', 'undeniable', 'indisputable',
  'commendable', 'unparalleled', 'distinctive', 'exceptional', 'invaluable',
  'seamless', 'streamlined', 'intuitive', 'sophisticated', 'cutting-edge',
  'myriad', 'plethora', 'diverse', 'extensive', 'vast',
];

export const AI_METAPHORS = [
  'tapestry', 'realm', 'testament', 'beacon', 'symphony', 'landscape',
  'cornerstone', 'catalyst', 'paradigm', 'ecosystem', 'fabric',
  'mosaic', 'pillar', 'bedrock', 'nexus', 'spectrum', 'prism',
  'crucible', 'linchpin', 'scaffold', 'fulcrum', 'conduit',
  'harbinger', 'vanguard', 'bastion', 'bulwark', 'juggernaut',
  'arena', 'frontier', 'gateway', 'milestone', 'blueprint',
  'roadmap', 'toolkit', 'framework', 'lens', 'trajectory',
];

export const AI_HYPE = [
  'game-changer', 'cutting-edge', 'revolutionary', 'groundbreaking',
  'state-of-the-art', 'next-generation', 'world-class', 'best-in-class',
  'mission-critical', 'bleeding-edge', 'paradigm-shifting', 'trailblazing',
  'pioneering', 'disruptive', 'transformational', 'visionary',
  'game-changing', 'forward-thinking', 'industry-leading', 'top-tier',
];

export const AI_CONNECTORS = [
  'furthermore', 'moreover', 'additionally', 'consequently',
  'subsequently', 'nevertheless', 'notwithstanding', 'henceforth',
  'thereby', 'wherein', 'thereof', 'herein', 'insofar',
  'accordingly', 'conversely', 'nonetheless', 'likewise',
  'alternatively', 'notably', 'specifically', 'importantly',
  'essentially', 'fundamentally', 'ultimately', 'inherently',
];

/** Common AI sentence starters — these alone aren't proof but combined signals */
export const AI_SENTENCE_STARTERS = [
  'it is worth',
  'it is important',
  'it is crucial',
  'it is essential',
  'it should be noted',
  'it goes without saying',
  'this is particularly',
  'this is especially',
  'this ensures',
  'this allows',
  'this enables',
  'this provides',
  'this represents',
  'this highlights',
  'this underscores',
  'this demonstrates',
  'by leveraging',
  'by utilizing',
  'by implementing',
  'by incorporating',
  'when it comes to',
  'in order to',
  'with that said',
  'as such',
  'as a result',
  'in essence',
  'in particular',
  'to that end',
  'to this end',
  'on the other hand',
  'at the same time',
  'in the context of',
  'with respect to',
  'in terms of',
  'in light of',
  'given the',
  'given that',
];

/** All AI vocabulary combined */
export const ALL_AI_VOCABULARY: string[] = [
  ...AI_VERBS,
  ...AI_EMPHASIS,
  ...AI_METAPHORS,
  ...AI_HYPE,
  ...AI_CONNECTORS,
];

/** Create a Set for fast lookups */
export const AI_VOCAB_SET = new Set(ALL_AI_VOCABULARY.map(w => w.toLowerCase()));
