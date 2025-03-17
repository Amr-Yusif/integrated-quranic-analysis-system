import { PatternDiscovery } from './pattern_discovery';

describe('PatternDiscovery', () => {
  let patternDiscovery: PatternDiscovery;
  
  beforeEach(() => {
    patternDiscovery = new PatternDiscovery();
  });
  
  describe('detectPatterns', () => {
    it('should detect conditional sequence patterns', async () => {
      // Sample text with conditional sequence pattern
      const text = 'إن لم تتب ثم تعمل صالحاً فلن تنجو.';
      
      const patterns = await patternDiscovery.detectPatterns(text);
      
      // Should find at least one pattern
      expect(patterns.length).toBeGreaterThan(0);
      
      // Should include a conditional_sequence pattern
      const conditionalPattern = patterns.find(p => p.type === 'conditional_sequence');
      expect(conditionalPattern).toBeDefined();
      expect(conditionalPattern?.confidence).toBeGreaterThanOrEqual(0.7);
    });
    
    it('should detect exclusivity patterns', async () => {
      // Sample text with exclusivity pattern
      const text = 'وما أرسلناك إلا رحمة للعالمين.';
      
      const patterns = await patternDiscovery.detectPatterns(text);
      
      // Should find at least one pattern
      expect(patterns.length).toBeGreaterThan(0);
      
      // Should include an exclusivity pattern
      const exclusivityPattern = patterns.find(p => p.type === 'exclusivity');
      expect(exclusivityPattern).toBeDefined();
      expect(exclusivityPattern?.confidence).toBeGreaterThanOrEqual(0.7);
    });
    
    it('should detect address patterns', async () => {
      // Sample text with address pattern
      const text = 'يا أيها الناس اتقوا ربكم.';
      
      const patterns = await patternDiscovery.detectPatterns(text);
      
      // Should find at least one pattern
      expect(patterns.length).toBeGreaterThan(0);
      
      // Should include an address pattern
      const addressPattern = patterns.find(p => p.type === 'address');
      expect(addressPattern).toBeDefined();
      expect(addressPattern?.confidence).toBeGreaterThanOrEqual(0.7);
      
      // Should extract the addressee
      expect(addressPattern?.metadata).toHaveProperty('addressee', 'الناس');
    });
    
    it('should respect minConfidence parameter', async () => {
      const text = 'إن لم تتب ثم تعمل صالحاً فلن تنجو.';
      
      // Set very high confidence threshold
      const patterns = await patternDiscovery.detectPatterns(text, { minConfidence: 0.99 });
      
      // Should not find any patterns due to high threshold
      expect(patterns.length).toBe(0);
    });
    
    it('should detect semantic patterns when requested', async () => {
      const text = 'ما سبب نزول سورة الإخلاص؟ نزلت ردا على سؤال المشركين عن صفة الله.';
      
      // Include semantic patterns
      const patterns = await patternDiscovery.detectPatterns(text, { includeSemanticPatterns: true });
      
      // Should find question-answer pattern
      const questionPattern = patterns.find(p => p.type === 'question_answer');
      expect(questionPattern).toBeDefined();
    });
    
    it('should not detect semantic patterns when not requested', async () => {
      const text = 'ما سبب نزول سورة الإخلاص؟ نزلت ردا على سؤال المشركين عن صفة الله.';
      
      // Don't include semantic patterns (default behavior)
      const patterns = await patternDiscovery.detectPatterns(text);
      
      // Should not find question-answer pattern
      const questionPattern = patterns.find(p => p.type === 'question_answer');
      expect(questionPattern).toBeUndefined();
    });
  });
  
  describe('private methods', () => {
    it('should calculate pattern confidence correctly', async () => {
      // Test with different patterns to ensure confidence varies
      const text1 = 'إن لم تتب ثم تعمل صالحاً فلن تنجو.'; // conditional_sequence
      const text2 = 'وما أرسلناك إلا رحمة للعالمين.'; // exclusivity
      
      const patterns1 = await patternDiscovery.detectPatterns(text1);
      const patterns2 = await patternDiscovery.detectPatterns(text2);
      
      // Exclusivity should have higher confidence
      const conditionalPattern = patterns1.find(p => p.type === 'conditional_sequence');
      const exclusivityPattern = patterns2.find(p => p.type === 'exclusivity');
      
      expect(conditionalPattern).toBeDefined();
      expect(exclusivityPattern).toBeDefined();
      
      if (conditionalPattern && exclusivityPattern) {
        expect(exclusivityPattern.confidence).toBeGreaterThan(conditionalPattern.confidence);
      }
    });
  });
});