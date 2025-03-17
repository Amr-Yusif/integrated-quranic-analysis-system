import { MLWordExpander } from '../../../src/core/ml/word_expander';

// Mock for compromise and its plugins
jest.mock('compromise', () => {
  const mock = {
    extend: jest.fn(),
    // Mock document methods
    has: jest.fn().mockReturnValue(false)
  };
  return jest.fn(() => mock);
});

jest.mock('compromise-arabic', () => ({}));

describe('MLWordExpander', () => {
  let wordExpander: MLWordExpander;
  
  beforeEach(() => {
    wordExpander = new MLWordExpander();
  });
  
  describe('extractWords', () => {
    it('should extract Arabic words from text', async () => {
      const text = 'هذا نص عربي للاختبار مع بعض الكلمات مثل علم وإيمان ورحمة';
      
      const result = await wordExpander.extractWords(text);
      
      // Verify we got an array of words
      expect(Array.isArray(result)).toBe(true);
      // Should contain words like "علم", "إيمان", "رحمة" and not stop words like "مع"
      expect(result).toContain('علم');
      expect(result).toContain('إيمان');
      expect(result).toContain('رحمة');
      expect(result).not.toContain('مع');
    });
    
    it('should remove diacritics and normalize words', async () => {
      const text = 'العِلْمُ نُورٌ والإيمانُ قوةٌ';
      
      const result = await wordExpander.extractWords(text);
      
      // Should contain normalized words without diacritics
      expect(result).toContain('العلم');
      expect(result).toContain('نور');
    });
    
    it('should handle empty text', async () => {
      const text = '';
      
      const result = await wordExpander.extractWords(text);
      
      expect(result).toEqual([]);
    });
    
    it('should handle non-Arabic text', async () => {
      const text = 'This is English text with no Arabic words';
      
      const result = await wordExpander.extractWords(text);
      
      expect(result).toEqual([]);
    });
  });
  
  describe('generateLexiconEntry', () => {
    it('should generate a lexicon entry for an Arabic word', async () => {
      const word = 'علم';
      
      const entry = await wordExpander.generateLexiconEntry(word);
      
      // Verify entry structure
      expect(entry).toBeDefined();
      expect(entry?.id).toBeDefined();
      expect(entry?.word).toBe(word);
      expect(entry?.definitions).toBeDefined();
      expect(Array.isArray(entry?.definitions)).toBe(true);
    });
    
    it('should include linguistic features in generated entries', async () => {
      const word = 'رحمة';
      
      const entry = await wordExpander.generateLexiconEntry(word);
      
      // Check for linguistic features
      expect(entry?.root).toBeDefined();
      expect(entry?.pos).toBeDefined();
      
      // At least one of these features should be defined
      const hasLinguisticFeatures = !!(
        entry?.semanticFields || 
        entry?.synonyms || 
        entry?.derivatives
      );
      expect(hasLinguisticFeatures).toBe(true);
    });
    
    it('should return null for invalid input', async () => {
      const word = '';
      
      const entry = await wordExpander.generateLexiconEntry(word);
      
      expect(entry).toBeNull();
    });
  });
  
  describe('detectRoot', () => {
    // Accessing private method for testing
    it('should detect root for known patterns', async () => {
      // We need to cast to access private method
      // @ts-ignore - accessing private method for testing
      const root = await wordExpander.detectRoot('كاتب');
      
      // Should detect "كتب" as the root of "كاتب"
      expect(root).toBe('كتب');
    });
    
    it('should return input for short words', async () => {
      // @ts-ignore - accessing private method for testing
      const root = await wordExpander.detectRoot('علم');
      
      // Short words (3 letters) are likely roots themselves
      expect(root).toBe('علم');
    });
  });
  
  describe('detectPos', () => {
    it('should detect part of speech based on patterns', async () => {
      // @ts-ignore - accessing private method for testing
      const pos = await wordExpander.detectPos('الكتاب');
      
      // Words starting with "ال" are likely nouns
      expect(pos).toBe('اسم');
    });
  });
  
  describe('generateSynonyms', () => {
    it('should generate synonyms for known words', async () => {
      // @ts-ignore - accessing private method for testing
      const synonyms = await wordExpander.generateSynonyms('علم');
      
      // Should have synonyms for "علم"
      expect(Array.isArray(synonyms)).toBe(true);
      expect(synonyms?.length).toBeGreaterThan(0);
      expect(synonyms).toContain('معرفة');
    });
    
    it('should return undefined for unknown words', async () => {
      // @ts-ignore - accessing private method for testing
      const synonyms = await wordExpander.generateSynonyms('كلمةغيرموجودة');
      
      expect(synonyms).toBeUndefined();
    });
  });
  
  describe('generateDerivatives', () => {
    it('should generate derivatives based on root', async () => {
      // @ts-ignore - accessing private method for testing
      const derivatives = await wordExpander.generateDerivatives('علم', 'علم');
      
      // Should have derivatives for "علم"
      expect(Array.isArray(derivatives)).toBe(true);
      expect(derivatives?.length).toBeGreaterThan(0);
      expect(derivatives).toContain('عالم');
    });
    
    it('should return undefined if root is undefined', async () => {
      // @ts-ignore - accessing private method for testing
      const derivatives = await wordExpander.generateDerivatives('كلمة', undefined);
      
      expect(derivatives).toBeUndefined();
    });
  });
});