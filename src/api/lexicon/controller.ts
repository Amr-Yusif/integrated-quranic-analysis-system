import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { lexiconManager, LexiconManager } from '../../core/lexicon/lexicon_manager';
import { MLWordExpander } from '../../core/ml/word_expander';

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
 * Controller for lexicon-related API endpoints
 */
export class LexiconController {
  private lexicon: LexiconManager;
  private mlWordExpander: MLWordExpander;
  private initialized: boolean;
  
  constructor() {
    this.lexicon = lexiconManager;
    this.mlWordExpander = new MLWordExpander();
    this.initialized = false;
  }
  
  /**
   * Initialize lexicon data
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      try {
        const dataPath = path.join(process.cwd(), 'data', 'lexicon');
        await this.lexicon.initialize(dataPath);
        this.initialized = true;
      } catch (error) {
        console.error('Failed to initialize lexicon:', error);
        throw new Error(`Lexicon initialization failed: ${error.message}`);
      }
    }
  }
  
  /**
   * Get lexicon statistics
   * @returns Promise with lexicon statistics
   */
  public async getStatistics(): Promise<Record<string, unknown>> {
    await this.ensureInitialized();
    return this.lexicon.getStatistics();
  }
  
  /**
   * Search for entries in the lexicon
   * @param query - Search query
   * @param options - Search options
   * @returns Promise with array of matching entries
   */
  public async search(
    query: string,
    options: {
      includeSynonyms?: boolean;
      includeDerivatives?: boolean;
      matchType?: 'exact' | 'startsWith' | 'contains';
    } = {}
  ): Promise<LexiconEntry[]> {
    await this.ensureInitialized();
    return this.lexicon.search(query, options);
  }
  
  /**
   * Get lexicon entry by ID
   * @param id - Entry ID
   * @returns Promise with entry or undefined if not found
   */
  public async getEntryById(id: string): Promise<LexiconEntry | undefined> {
    await this.ensureInitialized();
    return this.lexicon.getEntry(id);
  }
  
  /**
   * Get lexicon entry by word
   * @param word - Word to look up
   * @returns Promise with entry or undefined if not found
   */
  public async getEntryByWord(word: string): Promise<LexiconEntry | undefined> {
    await this.ensureInitialized();
    return this.lexicon.getEntryByWord(word);
  }
  
  /**
   * Get entries by root
   * @param root - Root to search for
   * @returns Promise with array of entries
   */
  public async getEntriesByRoot(root: string): Promise<LexiconEntry[]> {
    await this.ensureInitialized();
    return this.lexicon.getEntriesByRoot(root);
  }
  
  /**
   * Get entries by semantic field
   * @param field - Semantic field to search for
   * @returns Promise with array of entries
   */
  public async getEntriesBySemanticField(field: string): Promise<LexiconEntry[]> {
    await this.ensureInitialized();
    return this.lexicon.getEntriesBySemanticField(field);
  }
  
  /**
   * Get all semantic fields
   * @returns Promise with array of semantic fields
   */
  public async getSemanticFields(): Promise<string[]> {
    await this.ensureInitialized();
    return this.lexicon.getSemanticFields();
  }
  
  /**
   * Get all roots
   * @returns Promise with array of roots
   */
  public async getRoots(): Promise<string[]> {
    await this.ensureInitialized();
    return this.lexicon.getRoots();
  }
  
  /**
   * Add entry to lexicon
   * @param entry - Entry to add
   * @returns Promise with added entry
   */
  public async addEntry(entry: Partial<LexiconEntry>): Promise<LexiconEntry> {
    await this.ensureInitialized();
    
    const newEntry: LexiconEntry = {
      id: entry.id || uuidv4(),
      word: entry.word || '',
      definitions: entry.definitions || [],
      root: entry.root,
      pos: entry.pos,
      semanticFields: entry.semanticFields,
      synonyms: entry.synonyms,
      antonyms: entry.antonyms,
      derivatives: entry.derivatives,
      examples: entry.examples,
      frequency: entry.frequency,
      metadata: entry.metadata
    };
    
    return this.lexicon.addEntry(newEntry);
  }
  
  /**
   * Expand lexicon with ML-generated entries
   * @param sourceText - Text to extract and expand words from
   * @param count - Number of entries to generate
   * @returns Promise with array of generated entries
   */
  public async expandLexiconWithML(sourceText: string, count: number = 10): Promise<LexiconEntry[]> {
    await this.ensureInitialized();
    
    try {
      // 1. Extract words from source text
      const extractedWords = await this.mlWordExpander.extractWords(sourceText);
      
      // 2. Filter words that are already in the lexicon
      const newWords = extractedWords.filter(word => !this.lexicon.getEntryByWord(word));
      
      // 3. Generate a limited number of entries
      const limitedWords = newWords.slice(0, count);
      const generatedEntries: LexiconEntry[] = [];
      
      // 4. Generate and add entries one by one
      for (const word of limitedWords) {
        const generatedEntry = await this.mlWordExpander.generateLexiconEntry(word);
        if (generatedEntry) {
          const addedEntry = await this.addEntry(generatedEntry);
          generatedEntries.push(addedEntry);
        }
      }
      
      return generatedEntries;
    } catch (error) {
      console.error('Failed to expand lexicon:', error);
      throw new Error(`Lexicon expansion failed: ${error.message}`);
    }
  }
  
  /**
   * Export lexicon to a file
   * @returns Promise with path to exported file
   */
  public async exportLexicon(): Promise<string> {
    await this.ensureInitialized();
    
    const exportPath = path.join(process.cwd(), 'data', 'exports', `lexicon_export_${Date.now()}.json`);
    await this.lexicon.exportToFile(exportPath);
    
    return exportPath;
  }
}