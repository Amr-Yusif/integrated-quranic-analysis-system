import { MLWordExpander } from '../core/ml/word_expander';
import { LexiconEntry, LexiconExpansionParams } from '../core/types/lexicon';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import logger from '../utils/logger';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 * Service for expanding the lexicon using ML techniques
 */
export class LexiconExpansionService {
  private wordExpander: MLWordExpander;
  private lexiconPath: string;
  
  constructor(lexiconPath: string = path.join(__dirname, '../../data/lexicon/core_lexicon.json')) {
    this.wordExpander = new MLWordExpander();
    this.lexiconPath = lexiconPath;
  }
  
  /**
   * Load existing lexicon data
   * @returns Promise with lexicon entries
   */
  private async loadLexicon(): Promise<LexiconEntry[]> {
    try {
      const data = await readFile(this.lexiconPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Error loading lexicon: ${error}`);
      return [];
    }
  }
  
  /**
   * Save updated lexicon data
   * @param entries - Lexicon entries to save
   */
  private async saveLexicon(entries: LexiconEntry[]): Promise<void> {
    try {
      const data = JSON.stringify(entries, null, 2);
      await writeFile(this.lexiconPath, data, 'utf8');
      logger.info(`Saved ${entries.length} entries to lexicon`);
    } catch (error) {
      logger.error(`Error saving lexicon: ${error}`);
      throw new Error(`Failed to save lexicon: ${error}`);
    }
  }
  
  /**
   * Expand the lexicon using ML-generated entries from a source text
   * @param params - Parameters for lexicon expansion
   * @returns Promise with newly added entries
   */
  public async expandLexicon(params: LexiconExpansionParams): Promise<LexiconEntry[]> {
    try {
      logger.info(`Starting lexicon expansion with ${params.count} requested entries`);
      
      // 1. Extract Arabic words from source text
      const extractedWords = await this.wordExpander.extractWords(params.sourceText);
      logger.info(`Extracted ${extractedWords.length} unique words from source text`);
      
      if (extractedWords.length === 0) {
        throw new Error('No words extracted from source text');
      }
      
      // 2. Load existing lexicon to avoid duplicates
      const existingEntries = await this.loadLexicon();
      const existingWords = new Set(existingEntries.map(entry => entry.word));
      
      // 3. Filter out words already in the lexicon
      const newWords = extractedWords.filter(word => !existingWords.has(word));
      logger.info(`Found ${newWords.length} new words not in the existing lexicon`);
      
      if (newWords.length === 0) {
        return [];
      }
      
      // 4. Generate entries for new words, limited by requested count
      const targetCount = Math.min(params.count || 10, newWords.length);
      const selectedWords = newWords.slice(0, targetCount);
      
      // 5. Generate entries with ML
      const newEntries: LexiconEntry[] = [];
      for (const word of selectedWords) {
        const entry = await this.wordExpander.generateLexiconEntry(word);
        if (entry) {
          // Apply confidence threshold if specified
          if (!params.minConfidence || 
              (entry.metadata?.confidence && entry.metadata.confidence >= (params.minConfidence || 0))) {
            newEntries.push(entry);
          }
        }
      }
      
      logger.info(`Generated ${newEntries.length} new lexicon entries`);
      
      // 6. Save expanded lexicon
      await this.saveLexicon([...existingEntries, ...newEntries]);
      
      // 7. Return newly added entries
      return newEntries;
    } catch (error) {
      logger.error(`Lexicon expansion error: ${error}`);
      throw new Error(`Failed to expand lexicon: ${error}`);
    }
  }
  
  /**
   * Perform batch expansion using multiple source texts
   * @param sourcesWithCounts - Array of source texts and counts
   * @returns Promise with total number of entries added
   */
  public async batchExpand(
    sourcesWithCounts: Array<{ sourceText: string; count: number }>
  ): Promise<number> {
    let totalAdded = 0;
    
    for (const { sourceText, count } of sourcesWithCounts) {
      const newEntries = await this.expandLexicon({
        sourceText,
        count
      });
      
      totalAdded += newEntries.length;
    }
    
    return totalAdded;
  }
  
  /**
   * Auto-enhance existing entries with additional linguistic features
   * @returns Promise with number of enhanced entries
   */
  public async enhanceExistingEntries(): Promise<number> {
    try {
      // 1. Load existing lexicon
      const entries = await this.loadLexicon();
      let enhancedCount = 0;
      
      // 2. Enhance entries that are missing features
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        let wasEnhanced = false;
        
        // If entry has no root but has a word, try to detect root
        if (!entry.root && entry.word) {
          const root = await this.wordExpander.detectRoot(entry.word);
          if (root) {
            entry.root = root;
            wasEnhanced = true;
          }
        }
        
        // If entry has no derivatives but has a root, generate derivatives
        if ((!entry.derivatives || entry.derivatives.length === 0) && entry.root) {
          const derivatives = await this.wordExpander.generateDerivatives(entry.word, entry.root);
          if (derivatives && derivatives.length > 0) {
            entry.derivatives = derivatives;
            wasEnhanced = true;
          }
        }
        
        // If entry has no synonyms, generate them
        if (!entry.synonyms || entry.synonyms.length === 0) {
          const synonyms = await this.wordExpander.generateSynonyms(entry.word);
          if (synonyms && synonyms.length > 0) {
            entry.synonyms = synonyms;
            wasEnhanced = true;
          }
        }
        
        if (wasEnhanced) {
          // Update metadata
          entry.metadata = entry.metadata || {};
          entry.metadata.updatedAt = new Date().toISOString();
          entries[i] = entry;
          enhancedCount++;
        }
      }
      
      // 3. Save enhanced lexicon
      if (enhancedCount > 0) {
        await this.saveLexicon(entries);
        logger.info(`Enhanced ${enhancedCount} existing lexicon entries`);
      }
      
      return enhancedCount;
    } catch (error) {
      logger.error(`Error enhancing lexicon entries: ${error}`);
      throw new Error(`Failed to enhance lexicon entries: ${error}`);
    }
  }
}