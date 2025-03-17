import { v4 as uuidv4 } from 'uuid';
import nlp from 'compromise';
import arabic from 'compromise-arabic';

// Register Arabic plugin
nlp.extend(arabic);

/**
 * Interface for generated lexicon entry
 */
interface LexiconEntry {
  id: string;
  word: string;
  root?: string;
  pos?: string;
  definitions: string[];
  semanticFields?: string[];
  synonyms?: string[];
  antonyms?: string[];
  derivatives?: string[];
  examples?: string[];
  frequency?: number;
  metadata?: Record<string, unknown>;
}

/**
 * MLWordExpander uses machine learning techniques to extract words
 * from text and generate lexicon entries with advanced linguistic features.
 */
export class MLWordExpander {
  // Arabic word pattern with diacritics
  private arabicWordRegex: RegExp;
  // Common stop words to filter out
  private stopWords: Set<string>;
  // Common root patterns
  private rootPatterns: Record<string, string[]>;
  
  constructor() {
    // Regex for Arabic words including diacritics
    this.arabicWordRegex = /[\u0621-\u064A\u0660-\u0669\u06F0-\u06F9\u0671-\u06D3\u06D5\u06FA-\u06FD\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]+/g;
    
    // Initialize stop words
    this.stopWords = new Set([
      'من', 'إلى', 'عن', 'على', 'في', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك', 'هذان',
      'هؤلاء', 'الذي', 'التي', 'هو', 'هي', 'أنا', 'نحن', 'أنت', 'أنتم', 'هم', 'أن',
      'لا', 'ما', 'إذا', 'إن', 'و', 'ف', 'ثم', 'أو', 'بل', 'لكن', 'كان', 'كانت',
      'كانوا', 'يكون', 'تكون', 'سوف', 'هناك', 'كل', 'بعض', 'غير'
    ]);
    
    // Common root patterns for Arabic words
    this.rootPatterns = {
      'فعل': ['فاعل', 'مفعول', 'يفعل', 'تفعل', 'مفعل', 'فعّال', 'منفعل', 'افتعل', 'استفعل'],
      'كتب': ['كاتب', 'مكتوب', 'يكتب', 'تكتب', 'مكتب', 'كتّاب', 'اكتتب', 'استكتب'],
      'علم': ['عالم', 'معلوم', 'يعلم', 'تعلم', 'معلم', 'علّام', 'متعلم', 'اعتلم', 'استعلم'],
      'قرأ': ['قارئ', 'مقروء', 'يقرأ', 'تقرأ', 'مقرأ', 'قرّاء', 'اقترأ', 'استقرأ'],
      'سجد': ['ساجد', 'مسجود', 'يسجد', 'تسجد', 'مسجد', 'سجّاد', 'انسجد']
    };
  }
  
  /**
   * Extract Arabic words from text
   * @param text - Source text to extract words from
   * @returns Promise with array of extracted words
   */
  public async extractWords(text: string): Promise<string[]> {
    try {
      // Extract using regex
      const matches = text.match(this.arabicWordRegex) || [];
      
      // Filter unique words and remove stop words
      const uniqueWords = new Set<string>();
      for (const word of matches) {
        // Normalize word (remove diacritics)
        const normalizedWord = this.normalizeWord(word);
        
        // Filter by length and stop words
        if (normalizedWord.length > 2 && !this.stopWords.has(normalizedWord)) {
          uniqueWords.add(normalizedWord);
        }
      }
      
      // Convert to array and sort by length (descending)
      return Array.from(uniqueWords).sort((a, b) => b.length - a.length);
    } catch (error) {
      console.error('Error extracting words:', error);
      return [];
    }
  }
  
  /**
   * Normalize Arabic word by removing diacritics
   * @param word - Word to normalize
   * @returns Normalized word
   */
  private normalizeWord(word: string): string {
    // Remove diacritics (tashkeel)
    return word.replace(/[\u064B-\u065F\u0670]/g, '');
  }
  
  /**
   * Generate a lexicon entry for a word using NLP and ML techniques
   * @param word - Word to generate entry for
   * @returns Promise with generated lexicon entry
   */
  public async generateLexiconEntry(word: string): Promise<LexiconEntry | null> {
    try {
      // 1. Detect root using pattern matching
      const root = await this.detectRoot(word);
      
      // 2. Detect part of speech
      const pos = await this.detectPos(word);
      
      // 3. Generate definitions
      const definitions = await this.generateDefinitions(word);
      
      // 4. Generate semantic fields
      const semanticFields = await this.detectSemanticFields(word, definitions);
      
      // 5. Generate synonyms
      const synonyms = await this.generateSynonyms(word);
      
      // 6. Generate derivatives
      const derivatives = await this.generateDerivatives(word, root);
      
      // Create lexicon entry
      const entry: LexiconEntry = {
        id: uuidv4(),
        word,
        root,
        pos,
        definitions,
        semanticFields,
        synonyms,
        derivatives,
        frequency: 1, // Default frequency
        metadata: {
          generated: true,
          generatedAt: new Date().toISOString(),
          confidence: 0.7 // Confidence score for generated entry
        }
      };
      
      return entry;
    } catch (error) {
      console.error(`Error generating lexicon entry for "${word}":`, error);
      return null;
    }
  }
  
  /**
   * Detect the root of an Arabic word
   * @param word - Word to find root for
   * @returns Promise with detected root or undefined
   */
  private async detectRoot(word: string): Promise<string | undefined> {
    // For demonstration, using pattern matching
    // In a real system, this would use more sophisticated algorithms
    
    // Check if the word is itself a known root pattern
    if (this.rootPatterns[word]) {
      return word;
    }
    
    // Check if word matches any patterns of known roots
    for (const [root, patterns] of Object.entries(this.rootPatterns)) {
      if (patterns.includes(word)) {
        return root;
      }
    }
    
    // Extract probable root using common heuristics
    // This is a simplified approach - in a real system, use a stemmer/lemmatizer
    if (word.length <= 3) {
      // Words with 3 or fewer letters are likely roots themselves
      return word;
    } else if (word.length === 4) {
      // For 4-letter words, try to extract a 3-letter root
      return word.replace(/^م|^ا|ا$|ة$|ي$/, '');
    } else if (word.length > 4) {
      // For longer words, extract middle 3 letters as a simple heuristic
      const middle = Math.floor(word.length / 2);
      return word.substring(middle - 1, middle + 2);
    }
    
    return undefined;
  }
  
  /**
   * Detect part of speech for a word
   * @param word - Word to analyze
   * @returns Promise with part of speech or undefined
   */
  private async detectPos(word: string): Promise<string | undefined> {
    // Use compromise-arabic for POS tagging
    // Note: This is simplified - in a real system, use a more advanced NLP pipeline
    const doc = nlp(word);
    
    if (doc.has('#Verb')) return 'فعل';
    if (doc.has('#Noun')) return 'اسم';
    if (doc.has('#Adjective')) return 'صفة';
    if (doc.has('#Adverb')) return 'ظرف';
    if (doc.has('#Preposition')) return 'حرف جر';
    
    // Default POS based on word patterns
    if (word.startsWith('ال')) return 'اسم';
    if (word.endsWith('ة')) return 'اسم';
    if (word.startsWith('ي') || word.startsWith('ت')) return 'فعل';
    if (word.includes('ا') && word.length > 3) return 'اسم';
    
    return 'اسم'; // Default to noun
  }
  
  /**
   * Generate definitions for a word
   * @param word - Word to generate definitions for
   * @returns Promise with array of definitions
   */
  private async generateDefinitions(word: string): Promise<string[]> {
    // In a real system, this would use LLMs or dictionaries
    // For demonstration, generating placeholder definitions
    
    const definitions: string[] = [];
    
    // Add a basic definition
    definitions.push(`معنى كلمة ${word}`);
    
    // Add context-based definitions if available
    // This would use LLMs in a real system
    
    return definitions;
  }
  
  /**
   * Detect semantic fields for a word
   * @param word - Word to analyze
   * @param definitions - Word definitions
   * @returns Promise with array of semantic fields
   */
  private async detectSemanticFields(word: string, definitions: string[]): Promise<string[] | undefined> {
    // Map of keywords to semantic fields
    const fieldKeywords: Record<string, string[]> = {
      'أخلاق': ['صدق', 'أمانة', 'رحمة', 'عدل', 'إحسان', 'تقوى', 'خلق'],
      'عقيدة': ['إيمان', 'توحيد', 'إسلام', 'كفر', 'شرك', 'نفاق', 'دين'],
      'عبادة': ['صلاة', 'زكاة', 'صوم', 'حج', 'دعاء', 'ذكر', 'استغفار'],
      'معرفة': ['علم', 'جهل', 'معرفة', 'فهم', 'حكمة', 'فكر', 'عقل'],
      'فكر': ['عقل', 'فهم', 'حكمة', 'تدبر', 'تفكر', 'نظر'],
      'صفات الله': ['رحمن', 'رحيم', 'ملك', 'قدوس', 'سلام', 'مؤمن', 'مهيمن'],
      'قصص': ['آدم', 'نوح', 'إبراهيم', 'موسى', 'عيسى', 'محمد', 'قصة'],
      'آخرة': ['موت', 'قبر', 'برزخ', 'بعث', 'حشر', 'جنة', 'نار']
    };
    
    const fields = new Set<string>();
    
    // Check if word directly matches any field keywords
    for (const [field, keywords] of Object.entries(fieldKeywords)) {
      if (keywords.includes(word)) {
        fields.add(field);
      }
    }
    
    // Check definitions for field keywords
    for (const definition of definitions) {
      for (const [field, keywords] of Object.entries(fieldKeywords)) {
        for (const keyword of keywords) {
          if (definition.includes(keyword)) {
            fields.add(field);
            break;
          }
        }
      }
    }
    
    return fields.size > 0 ? Array.from(fields) : undefined;
  }
  
  /**
   * Generate synonyms for a word
   * @param word - Word to generate synonyms for
   * @returns Promise with array of synonyms
   */
  private async generateSynonyms(word: string): Promise<string[] | undefined> {
    // Simplified synonym generation
    // In a real system, this would use word embeddings, dictionaries, or LLMs
    
    // Map of some common synonyms
    const synonymMap: Record<string, string[]> = {
      'علم': ['معرفة', 'دراية', 'فهم', 'إدراك'],
      'رحمة': ['رأفة', 'شفقة', 'عطف', 'حنان'],
      'تقوى': ['خشية', 'ورع', 'تقات'],
      'إيمان': ['تصديق', 'يقين', 'إقرار'],
      'هدى': ['رشد', 'إرشاد', 'دلالة', 'بيان']
    };
    
    // Check if we have predefined synonyms
    if (synonymMap[word]) {
      return synonymMap[word];
    }
    
    // Otherwise, return undefined - in a real system, generate from ML models
    return undefined;
  }
  
  /**
   * Generate derivatives for a word based on its root
   * @param word - The word to generate derivatives for
   * @param root - The root of the word
   * @returns Promise with array of derivatives
   */
  private async generateDerivatives(word: string, root?: string): Promise<string[] | undefined> {
    if (!root) return undefined;
    
    // Use root patterns to generate derivatives
    // In a real system, this would use morphological analysis
    
    const derivatives = this.rootPatterns[root];
    if (derivatives) {
      // Filter out the original word
      return derivatives.filter(w => w !== word);
    }
    
    return undefined;
  }
}