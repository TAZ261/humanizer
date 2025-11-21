export interface StudentSample {
  id: string;
  text: string;
  tag: string; // e.g., "Есе", "Курсова", "Чат"
  dateAdded: number;
}

export interface StyleMetrics {
  vocabularyComplexity: number; // 1-10
  sentenceLengthVariance: number; // 1-10
  grammarCorrectness: number; // 1-10 (10 is perfect, student might be 6-8)
  informalityLevel: number; // 1-10
  commonConnectors: string[];
  typicalErrors: string[];
  toneDescription: string;
}

export interface TransformationSettings {
  humanizationLevel: number; // 1-100 (how much to change)
  retainKeyFacts: boolean;
  addTypos: boolean;
  mode: 'lazy_student' | 'try_hard_student' | 'balanced';
}

export interface ProcessingResult {
  original: string;
  humanized: string;
  changesExplanation: string;
}
