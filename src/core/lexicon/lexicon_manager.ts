import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

interface LexiconEntry {
  id: string;
  word: string;
  root?: string;
  pos?: string; // Part of speech
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
 * LexiconManager provides methods for managing and accessing
 * a comprehensive Arabic lexicon with semantic features.
 */
export class LexiconManager {
  private entries: Map<string, LexiconEntry>;
  private rootIndex: Map<string, Set<string>>;
  private semanticFieldIndex: Map<string, Set<string>>;
  private posIndex: Map<string, Set<string>>;
  
  constructor() {
    this.entries = new Map();
    this.rootIndex = new Map();
    this.semanticFieldIndex = new Map();
    this.posIndex = new Map();
  }
  
  /**
   * Initialize the lexicon from JSON data files
   * @param dataPath - Path to lexicon data directory
   * @returns Promise that resolves when initialization completes
   */
  public async initialize(dataPath: string): Promise<void> {
    try {
      // Load core lexicon
      const coreLexiconPath = path.join(dataPath, 'core_lexicon.json');
      await this.loadLexiconFile(coreLexiconPath);
      
      // Load semantic fields
      const semanticFieldsPath = path.join(dataPath, 'semantic_fields.json');
      await this.loadSemanticFieldsFile(semanticFieldsPath);
      
      // Load synonyms
      const synonymsPath = path.join(dataPath, 'synonyms.json');
      await this.loadSynonymsFile(synonymsPath);
      
      console.log(`Lexicon initialized with ${this.entries.size} entries`);
    } catch (error) {
      console.error('Failed to initialize lexicon:', error);
      throw new Error(`Lexicon initialization failed: ${error.message}`);
    }
  }
  
  /**
   * Load lexicon entries from a JSON file
   * @param filePath - Path to lexicon JSON file
   */
  private async loadLexiconFile(filePath: string): Promise<void> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const entries = JSON.parse(data) as LexiconEntry[];
      
      for (const entry of entries) {
        this.addEntry(entry);
      }
      
      console.log(`Loaded ${entries.length} entries from ${filePath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log(`Lexicon file ${filePath} not found, creating empty lexicon`);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Load semantic fields from a JSON file
   * @param filePath - Path to semantic fields JSON file
   */
  private async loadSemanticFieldsFile(filePath: string): Promise<void> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const semanticFields = JSON.parse(data) as Record<string, string[]>;
      
      for (const [field, words] of Object.entries(semanticFields)) {
        for (const word of words) {
          const entry = this.getEntryByWord(word);
          if (entry) {
            if (!entry.semanticFields) {
              entry.semanticFields = [];
            }
            if (!entry.semanticFields.includes(field)) {
              entry.semanticFields.push(field);
            }
            
            // Update semantic field index
            if (!this.semanticFieldIndex.has(field)) {
              this.semanticFieldIndex.set(field, new Set());
            }
            this.semanticFieldIndex.get(field)?.add(entry.id);
          }
        }
      }
      
      console.log(`Loaded semantic fields from ${filePath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log(`Semantic fields file ${filePath} not found, skipping`);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Load synonyms from a JSON file
   * @param filePath - Path to synonyms JSON file
   */
  private async loadSynonymsFile(filePath: string): Promise<void> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const synonymGroups = JSON.parse(data) as string[][];
      
      for (const group of synonymGroups) {
        // Add each word as synonym to others in the group
        for (let i = 0; i < group.length; i++) {
          const word = group[i];
          const entry = this.getEntryByWord(word);
          
          if (entry) {
            if (!entry.synonyms) {
              entry.synonyms = [];
            }
            
            // Add all other words in group as synonyms
            for (let j = 0; j < group.length; j++) {
              if (i !== j && !entry.synonyms.includes(group[j])) {
                entry.synonyms.push(group[j]);
              }
            }
          }
        }
      }
      
      console.log(`Loaded synonyms from ${filePath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log(`Synonyms file ${filePath} not found, skipping`);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Add a new entry to the lexicon
   * @param entry - Lexicon entry to add
   * @returns The added entry
   */
  public addEntry(entry: LexiconEntry): LexiconEntry {
    const id = entry.id || uuidv4();
    
    const newEntry: LexiconEntry = {
      ...entry,
      id
    };
    
    this.entries.set(id, newEntry);
    
    // Index by root
    if (newEntry.root) {
      if (!this.rootIndex.has(newEntry.root)) {
        this.rootIndex.set(newEntry.root, new Set());
      }
      this.rootIndex.get(newEntry.root)?.add(id);
    }
    
    // Index by semantic fields
    if (newEntry.semanticFields) {
      for (const field of newEntry.semanticFields) {
        if (!this.semanticFieldIndex.has(field)) {
          this.semanticFieldIndex.set(field, new Set());
        }
        this.semanticFieldIndex.get(field)?.add(id);
      }
    }
    
    // Index by part of speech
    if (newEntry.pos) {
      if (!this.posIndex.has(newEntry.pos)) {
        this.posIndex.set(newEntry.pos, new Set());
      }
      this.posIndex.get(newEntry.pos)?.add(id);
    }
    
    return newEntry;
  }
  
  /**
   * Get an entry by its ID
   * @param id - Entry ID
   * @returns Lexicon entry or undefined if not found
   */
  public getEntry(id: string): LexiconEntry | undefined {
    return this.entries.get(id);
  }
  
  /**
   * Get an entry by word
   * @param word - Word to look up
   * @returns Lexicon entry or undefined if not found
   */
  public getEntryByWord(word: string): LexiconEntry | undefined {
    for (const entry of this.entries.values()) {
      if (entry.word === word) {
        return entry;
      }
    }
    return undefined;
  }
  
  /**
   * Get entries by root
   * @param root - Root to search for
   * @returns Array of lexicon entries
   */
  public getEntriesByRoot(root: string): LexiconEntry[] {
    const idSet = this.rootIndex.get(root);
    if (!idSet) {
      return [];
    }
    
    return Array.from(idSet)
      .map(id => this.entries.get(id))
      .filter((entry): entry is LexiconEntry => entry !== undefined);
  }
  
  /**
   * Get entries by semantic field
   * @param field - Semantic field to search for
   * @returns Array of lexicon entries
   */
  public getEntriesBySemanticField(field: string): LexiconEntry[] {
    const idSet = this.semanticFieldIndex.get(field);
    if (!idSet) {
      return [];
    }
    
    return Array.from(idSet)
      .map(id => this.entries.get(id))
      .filter((entry): entry is LexiconEntry => entry !== undefined);
  }
  
  /**
   * Get entries by part of speech
   * @param pos - Part of speech to search for
   * @returns Array of lexicon entries
   */
  public getEntriesByPos(pos: string): LexiconEntry[] {
    const idSet = this.posIndex.get(pos);
    if (!idSet) {
      return [];
    }
    
    return Array.from(idSet)
      .map(id => this.entries.get(id))
      .filter((entry): entry is LexiconEntry => entry !== undefined);
  }
  
  /**
   * Search for entries by query
   * @param query - Search query
   * @param options - Search options
   * @returns Array of matching lexicon entries
   */
  public search(
    query: string,
    options: {
      includeSynonyms?: boolean;
      includeDerivatives?: boolean;
      matchType?: 'exact' | 'startsWith' | 'contains';
    } = {}
  ): LexiconEntry[] {
    const { 
      includeSynonyms = true, 
      includeDerivatives = true,
      matchType = 'contains'
    } = options;
    
    const results: LexiconEntry[] = [];
    const resultIds = new Set<string>();
    
    // Search by word
    for (const entry of this.entries.values()) {
      let isMatch = false;
      
      switch (matchType) {
        case 'exact':
          isMatch = entry.word === query;
          break;
        case 'startsWith':
          isMatch = entry.word.startsWith(query);
          break;
        case 'contains':
          isMatch = entry.word.includes(query);
          break;
      }
      
      if (isMatch && !resultIds.has(entry.id)) {
        results.push(entry);
        resultIds.add(entry.id);
      }
      
      // Search in definitions
      if (!isMatch) {
        for (const definition of entry.definitions) {
          if (definition.includes(query)) {
            if (!resultIds.has(entry.id)) {
              results.push(entry);
              resultIds.add(entry.id);
            }
            break;
          }
        }
      }
    }
    
    // If include synonyms, add entries for synonyms of matches
    if (includeSynonyms) {
      const synonymEntries: LexiconEntry[] = [];
      
      for (const entry of results) {
        if (entry.synonyms) {
          for (const synonym of entry.synonyms) {
            const synonymEntry = this.getEntryByWord(synonym);
            if (synonymEntry && !resultIds.has(synonymEntry.id)) {
              synonymEntries.push(synonymEntry);
              resultIds.add(synonymEntry.id);
            }
          }
        }
      }
      
      results.push(...synonymEntries);
    }
    
    // If include derivatives, add entries with the same root
    if (includeDerivatives) {
      const derivativeEntries: LexiconEntry[] = [];
      
      for (const entry of results) {
        if (entry.root) {
          const entriesWithSameRoot = this.getEntriesByRoot(entry.root);
          for (const derivative of entriesWithSameRoot) {
            if (!resultIds.has(derivative.id)) {
              derivativeEntries.push(derivative);
              resultIds.add(derivative.id);
            }
          }
        }
      }
      
      results.push(...derivativeEntries);
    }
    
    return results;
  }
  
  /**
   * Get all semantic fields
   * @returns Array of semantic fields
   */
  public getSemanticFields(): string[] {
    return Array.from(this.semanticFieldIndex.keys());
  }
  
  /**
   * Get all parts of speech
   * @returns Array of parts of speech
   */
  public getPartsOfSpeech(): string[] {
    return Array.from(this.posIndex.keys());
  }
  
  /**
   * Get all roots
   * @returns Array of roots
   */
  public getRoots(): string[] {
    return Array.from(this.rootIndex.keys());
  }
  
  /**
   * Get lexicon statistics
   * @returns Statistics about the lexicon
   */
  public getStatistics(): Record<string, unknown> {
    return {
      entryCount: this.entries.size,
      rootCount: this.rootIndex.size,
      semanticFieldCount: this.semanticFieldIndex.size,
      posCount: this.posIndex.size
    };
  }
  
  /**
   * Export the lexicon to a JSON file
   * @param filePath - Path to output file
   */
  public async exportToFile(filePath: string): Promise<void> {
    const entries = Array.from(this.entries.values());
    await fs.writeFile(filePath, JSON.stringify(entries, null, 2), 'utf-8');
    console.log(`Exported ${entries.length} entries to ${filePath}`);
  }
}

// Export singleton instance
export const lexiconManager = new LexiconManager();