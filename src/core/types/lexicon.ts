/**
 * Types for the lexicon module
 */

/**
 * Represents a single entry in the Quranic lexicon
 */
export interface LexiconEntry {
  /** Unique identifier for the entry */
  id: string;
  
  /** The word in Arabic */
  word: string;
  
  /** The trilateral or quadrilateral root of the word, if applicable */
  root?: string;
  
  /** Part of speech in Arabic (e.g., اسم, فعل, حرف) */
  pos?: string;
  
  /** List of definitions for the word */
  definitions: string[];
  
  /** Semantic fields or categories the word belongs to */
  semanticFields?: string[];
  
  /** List of synonyms for the word */
  synonyms?: string[];
  
  /** List of antonyms for the word */
  antonyms?: string[];
  
  /** Morphological derivatives of the word */
  derivatives?: string[];
  
  /** Example usages in the Quran or Hadith */
  examples?: string[];
  
  /** Frequency of occurrence in the Quran */
  frequency?: number;
  
  /** Additional metadata for the entry */
  metadata?: LexiconEntryMetadata;
}

/**
 * Metadata for a lexicon entry
 */
export interface LexiconEntryMetadata {
  /** Whether the entry was machine-generated */
  generated?: boolean;
  
  /** Timestamp when the entry was generated */
  generatedAt?: string;
  
  /** Confidence score for machine-generated entries */
  confidence?: number;
  
  /** Source of the entry (e.g., "quran", "hadith", "lexicon") */
  source?: string;
  
  /** Version of the entry */
  version?: string;
  
  /** Last updated timestamp */
  updatedAt?: string;
  
  /** Advanced linguistic features */
  linguisticFeatures?: LinguisticFeatures;
  
  /** Additional properties */
  [key: string]: unknown;
}

/**
 * Advanced linguistic features for a word
 */
export interface LinguisticFeatures {
  /** Morphological pattern (وزن) */
  pattern?: string;
  
  /** Grammatical case (إعراب) */
  grammaticalCase?: string;
  
  /** Rhetorical devices (أساليب بلاغية) */
  rhetoricalDevices?: string[];
  
  /** Phonetic features */
  phonetics?: PhoneticFeatures;
  
  /** Diacritics (تشكيل) */
  diacritics?: string;
  
  /** Word clusters or collocations */
  collocations?: string[];
  
  /** Gender (masculine/feminine) */
  gender?: 'masculine' | 'feminine' | 'both';
  
  /** Number (singular, dual, plural) */
  number?: 'singular' | 'dual' | 'plural';
  
  /** Verb tense if applicable */
  tense?: 'past' | 'present' | 'imperative';
  
  /** Possible semantic extensions */
  semanticExtensions?: SemanticExtension[];
}

/**
 * Phonetic features of a word
 */
export interface PhoneticFeatures {
  /** IPA (International Phonetic Alphabet) transcription */
  ipa?: string;
  
  /** Syllable structure */
  syllables?: string[];
  
  /** Stress pattern */
  stress?: number[];
}

/**
 * Semantic extension of a word
 */
export interface SemanticExtension {
  /** Extended meaning */
  meaning: string;
  
  /** Context in which this meaning applies */
  context: string;
  
  /** Example of this meaning in use */
  example?: string;
}

/**
 * Search options for lexicon queries
 */
export interface LexiconSearchOptions {
  /** Whether to include synonyms in search */
  includeSynonyms?: boolean;
  
  /** Whether to include derivatives in search */
  includeDerivatives?: boolean;
  
  /** Limit the number of results */
  limit?: number;
  
  /** Offset for pagination */
  offset?: number;
  
  /** Sort order */
  sortBy?: 'word' | 'root' | 'frequency';
  
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  
  /** Filter by part of speech */
  pos?: string;
  
  /** Filter by semantic field */
  semanticField?: string;
}

/**
 * Statistics about the lexicon
 */
export interface LexiconStats {
  /** Total number of entries */
  totalEntries: number;
  
  /** Number of unique roots */
  uniqueRoots: number;
  
  /** Number of semantic fields */
  semanticFields: number;
  
  /** Distribution of parts of speech */
  posDist: Record<string, number>;
  
  /** Last updated timestamp */
  lastUpdated: string;
}

/**
 * Parameters for expanding the lexicon with ML
 */
export interface LexiconExpansionParams {
  /** Source text to analyze for new words */
  sourceText: string;
  
  /** Number of new entries to generate */
  count: number;
  
  /** Minimum confidence threshold for new entries */
  minConfidence?: number;
  
  /** Types of features to generate */
  features?: ('definitions' | 'semanticFields' | 'synonyms' | 'derivatives')[];
}