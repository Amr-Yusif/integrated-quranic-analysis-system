import { KnowledgeNode, KnowledgeIntegrator } from './knowledge_integrator';

describe('KnowledgeNode', () => {
  let node: KnowledgeNode;
  
  beforeEach(() => {
    node = new KnowledgeNode(
      'concept',
      'تقوى',
      'quran',
      { category: 'قيمة', importance: 'high' }
    );
  });
  
  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(node.id).toBeDefined();
      expect(node.type).toBe('concept');
      expect(node.name).toBe('تقوى');
      expect(node.source).toBe('quran');
      expect(node.confidence).toBe(1.0);
      expect(node.attributes).toEqual({ category: 'قيمة', importance: 'high' });
      expect(node.relationships.size).toBe(0);
      expect(node.verificationResults).toEqual([]);
    });
  });
  
  describe('addRelationship', () => {
    it('should add a relationship', () => {
      const targetId = 'target-id';
      node.addRelationship(targetId, 'implies', 0.8);
      
      expect(node.relationships.has(targetId)).toBe(true);
      expect(node.relationships.get(targetId)).toEqual({ type: 'implies', confidence: 0.8 });
    });
  });
  
  describe('addVerificationResult', () => {
    it('should add a verification result', () => {
      node.addVerificationResult('source_reliability', true, 0.9, { source: 'quran' });
      
      expect(node.verificationResults.length).toBe(1);
      expect(node.verificationResults[0].method).toBe('source_reliability');
      expect(node.verificationResults[0].result).toBe(true);
      expect(node.verificationResults[0].confidence).toBe(0.9);
      expect(node.verificationResults[0].details).toEqual({ source: 'quran' });
    });
    
    it('should update confidence based on verification', () => {
      // Initial confidence is 1.0
      expect(node.confidence).toBe(1.0);
      
      // Add negative verification
      node.addVerificationResult('test_method', false, 0.8);
      
      // Confidence should decrease
      expect(node.confidence).toBeLessThan(1.0);
      
      // Add positive verification
      node.addVerificationResult('test_method_2', true, 0.9);
      
      // Confidence should increase but still be less than 1.0
      expect(node.confidence).toBeGreaterThan(0.5);
      expect(node.confidence).toBeLessThan(1.0);
    });
  });
  
  describe('getVerificationStatus', () => {
    it('should return correct verification status when not verified', () => {
      const status = node.getVerificationStatus();
      
      expect(status.isVerified).toBe(false);
      expect(status.score).toBe(0);
      expect(status.results).toEqual([]);
    });
    
    it('should return correct verification status when verified', () => {
      node.addVerificationResult('test_method_1', true, 0.8);
      node.addVerificationResult('test_method_2', false, 0.6);
      
      const status = node.getVerificationStatus();
      
      expect(status.isVerified).toBe(true);
      expect(status.score).toBe(0.4); // (0.8 + (-0.6)) / 2
      expect(status.results.length).toBe(2);
    });
  });
});

describe('KnowledgeIntegrator', () => {
  let integrator: KnowledgeIntegrator;
  
  beforeEach(() => {
    integrator = new KnowledgeIntegrator();
  });
  
  describe('createKnowledgeNode', () => {
    it('should create and add a node', async () => {
      const node = await integrator.createKnowledgeNode(
        'concept',
        'إيمان',
        'quran',
        { category: 'قيمة' },
        false // don't verify
      );
      
      expect(node.id).toBeDefined();
      expect(node.type).toBe('concept');
      expect(node.name).toBe('إيمان');
      
      // Should be retrievable
      const retrievedNode = integrator.getKnowledgeNode(node.id);
      expect(retrievedNode).toBeDefined();
      expect(retrievedNode?.name).toBe('إيمان');
    });
  });
  
  describe('createRelationship', () => {
    it('should create a relationship between nodes', async () => {
      const node1 = await integrator.createKnowledgeNode('concept', 'إيمان', 'quran', {}, false);
      const node2 = await integrator.createKnowledgeNode('concept', 'عمل صالح', 'quran', {}, false);
      
      const result = integrator.createRelationship(node1.id, node2.id, 'implies', 0.9);
      
      expect(result).toBe(true);
      
      // Check relationship was added
      const retrievedNode = integrator.getKnowledgeNode(node1.id);
      expect(retrievedNode?.relationships.has(node2.id)).toBe(true);
      expect(retrievedNode?.relationships.get(node2.id)?.type).toBe('implies');
    });
    
    it('should create bidirectional relationships when specified', async () => {
      const node1 = await integrator.createKnowledgeNode('concept', 'إيمان', 'quran', {}, false);
      const node2 = await integrator.createKnowledgeNode('concept', 'عمل صالح', 'quran', {}, false);
      
      const result = integrator.createRelationship(node1.id, node2.id, 'related_to', 0.8, true);
      
      expect(result).toBe(true);
      
      // Check relationship was added to both nodes
      const retrievedNode1 = integrator.getKnowledgeNode(node1.id);
      const retrievedNode2 = integrator.getKnowledgeNode(node2.id);
      
      expect(retrievedNode1?.relationships.has(node2.id)).toBe(true);
      expect(retrievedNode2?.relationships.has(node1.id)).toBe(true);
    });
    
    it('should return false for non-existent nodes', () => {
      const result = integrator.createRelationship('fake-id-1', 'fake-id-2', 'implies');
      expect(result).toBe(false);
    });
  });
  
  describe('verifyKnowledgeNode', () => {
    it('should verify a node', async () => {
      // Create a node with high reliability source
      const node = await integrator.createKnowledgeNode(
        'concept',
        'التقوى',
        'quran',
        { category: 'قيمة' },
        false // don't verify initially
      );
      
      // Verify the node
      const results = await integrator.verifyKnowledgeNode(node.id);
      
      // Should have verification results
      expect(results.length).toBeGreaterThan(0);
      
      // Get the node and check verification status
      const retrievedNode = integrator.getKnowledgeNode(node.id);
      const status = retrievedNode?.getVerificationStatus();
      
      expect(status?.isVerified).toBe(true);
      expect(status?.results.length).toBeGreaterThan(0);
    });
    
    it('should throw error for non-existent node', async () => {
      await expect(integrator.verifyKnowledgeNode('fake-id')).rejects.toThrow();
    });
  });
  
  describe('searchKnowledgeNodes', () => {
    it('should find nodes by name', async () => {
      await integrator.createKnowledgeNode('concept', 'التقوى', 'quran', {}, false);
      await integrator.createKnowledgeNode('concept', 'الإيمان', 'quran', {}, false);
      await integrator.createKnowledgeNode('concept', 'الصبر', 'quran', {}, false);
      
      const results = integrator.searchKnowledgeNodes('تقوى');
      
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('التقوى');
    });
    
    it('should find nodes by attribute', async () => {
      await integrator.createKnowledgeNode('concept', 'التقوى', 'quran', { category: 'قيمة' }, false);
      await integrator.createKnowledgeNode('attribute', 'خشية', 'quran', { category: 'صفة' }, false);
      
      const results = integrator.searchKnowledgeNodes('صفة');
      
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('خشية');
    });
  });
  
  describe('getStatistics', () => {
    it('should return correct statistics', async () => {
      // Add some nodes and relationships
      const node1 = await integrator.createKnowledgeNode('concept', 'التقوى', 'quran', {}, true);
      const node2 = await integrator.createKnowledgeNode('concept', 'الإيمان', 'quran', {}, true);
      const node3 = await integrator.createKnowledgeNode('attribute', 'خشية', 'hadith_sahih', {}, true);
      
      integrator.createRelationship(node1.id, node3.id, 'has_attribute');
      integrator.createRelationship(node2.id, node3.id, 'implies');
      
      const stats = integrator.getStatistics();
      
      expect(stats.nodeCount).toBe(3);
      expect(stats.sourceCount).toBe(2);
      expect(stats.verifiedNodeCount).toBeGreaterThan(0);
      expect(stats.relationshipTypeCounts).toHaveProperty('has_attribute');
      expect(stats.relationshipTypeCounts).toHaveProperty('implies');
    });
  });
});