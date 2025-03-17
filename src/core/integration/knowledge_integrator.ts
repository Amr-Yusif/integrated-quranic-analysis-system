import { v4 as uuidv4 } from 'uuid';

/**
 * KnowledgeNode represents a single node in the knowledge graph.
 * It can represent a concept, entity, attribute, or other knowledge element.
 */
export class KnowledgeNode {
  public id: string;
  public type: string;
  public name: string;
  public source: string;
  public confidence: number;
  public attributes: Record<string, unknown>;
  public relationships: Map<string, { type: string; confidence: number }>;
  public verificationResults: Array<{
    timestamp: string;
    method: string;
    result: boolean;
    confidence: number;
    details: Record<string, unknown>;
  }>;
  
  constructor(
    type: string,
    name: string,
    source: string,
    attributes: Record<string, unknown> = {}
  ) {
    this.id = uuidv4();
    this.type = type;
    this.name = name;
    this.source = source;
    this.confidence = 1.0;
    this.attributes = attributes;
    this.relationships = new Map();
    this.verificationResults = [];
  }
  
  /**
   * Add a relationship to another node
   * @param targetNodeId - ID of the target node
   * @param type - Type of relationship
   * @param confidence - Confidence score for the relationship
   */
  public addRelationship(targetNodeId: string, type: string, confidence: number): void {
    this.relationships.set(targetNodeId, { type, confidence });
  }
  
  /**
   * Add a verification result for this node
   * @param method - Verification method used
   * @param result - Boolean result of verification
   * @param confidence - Confidence of the verification
   * @param details - Additional details about the verification
   */
  public addVerificationResult(
    method: string,
    result: boolean,
    confidence: number,
    details: Record<string, unknown> = {}
  ): void {
    this.verificationResults.push({
      timestamp: new Date().toISOString(),
      method,
      result,
      confidence,
      details
    });
    
    // Update overall confidence based on verification
    this._updateConfidence();
  }
  
  /**
   * Get all relationships for this node
   * @returns Array of relationships with IDs, types, and confidence
   */
  public getRelationships(): Array<{ nodeId: string; type: string; confidence: number }> {
    return Array.from(this.relationships.entries()).map(([nodeId, data]) => ({
      nodeId,
      type: data.type,
      confidence: data.confidence
    }));
  }
  
  /**
   * Get verification status for this node
   * @returns Verification status with overall score and details
   */
  public getVerificationStatus(): {
    isVerified: boolean;
    score: number;
    results: typeof this.verificationResults;
  } {
    const positiveResults = this.verificationResults.filter(r => r.result);
    const isVerified = positiveResults.length > 0;
    const score = this.verificationResults.length > 0 
      ? positiveResults.reduce((sum, r) => sum + r.confidence, 0) / this.verificationResults.length
      : 0;
    
    return {
      isVerified,
      score,
      results: this.verificationResults
    };
  }
  
  /**
   * Update the overall confidence based on verification results
   */
  private _updateConfidence(): void {
    if (this.verificationResults.length === 0) {
      return;
    }
    
    // Calculate weighted average of verification results
    const totalWeight = this.verificationResults.reduce((sum, r) => sum + r.confidence, 0);
    const weightedSum = this.verificationResults.reduce((sum, r) => {
      return sum + (r.result ? r.confidence : -r.confidence);
    }, 0);
    
    // Normalize to 0-1 range
    const normalizedConfidence = (weightedSum + totalWeight) / (2 * totalWeight);
    
    // Apply with dampening to avoid dramatic shifts
    this.confidence = 0.3 * this.confidence + 0.7 * normalizedConfidence;
  }
}

/**
 * KnowledgeIntegrator provides methods for integrating knowledge from various sources
 * and building a coherent knowledge graph with verification capabilities.
 */
export class KnowledgeIntegrator {
  private nodes: Map<string, KnowledgeNode>;
  private sources: Set<string>;
  private verificationMethods: Array<{
    name: string;
    verify: (node: KnowledgeNode) => Promise<{ result: boolean; confidence: number; details: Record<string, unknown> }>;
  }>;
  
  constructor() {
    this.nodes = new Map();
    this.sources = new Set();
    
    // Initialize verification methods
    this.initializeVerificationMethods();
  }
  
  /**
   * Initialize verification methods
   */
  private initializeVerificationMethods(): void {
    this.verificationMethods = [
      {
        name: 'source_reliability',
        verify: async (node) => {
          // In a real system, this would check the reliability of the source
          const sourceReliability = this.getSourceReliability(node.source);
          
          return {
            result: sourceReliability > 0.7,
            confidence: sourceReliability,
            details: {
              sourceReliability,
              source: node.source
            }
          };
        }
      },
      {
        name: 'attribute_consistency',
        verify: async (node) => {
          // In a real system, this would check consistency of attributes
          const consistencyScore = this.checkAttributeConsistency(node);
          
          return {
            result: consistencyScore > 0.6,
            confidence: consistencyScore,
            details: {
              consistencyScore,
              attributes: Object.keys(node.attributes)
            }
          };
        }
      },
      {
        name: 'relationship_coherence',
        verify: async (node) => {
          // In a real system, this would analyze relationship coherence
          const coherenceScore = this.checkRelationshipCoherence(node);
          
          return {
            result: coherenceScore > 0.5,
            confidence: coherenceScore,
            details: {
              coherenceScore,
              relationshipCount: node.relationships.size
            }
          };
        }
      }
    ];
  }
  
  /**
   * Add a knowledge node to the integrator
   * @param node - The knowledge node to add
   * @param verify - Whether to verify the node immediately
   * @returns Promise with the added node
   */
  public async addKnowledgeNode(
    node: KnowledgeNode, 
    verify: boolean = true
  ): Promise<KnowledgeNode> {
    // Add to collection
    this.nodes.set(node.id, node);
    this.sources.add(node.source);
    
    // Verify if requested
    if (verify) {
      await this.verifyKnowledgeNode(node.id);
    }
    
    return node;
  }
  
  /**
   * Create and add a new knowledge node
   * @param type - Node type
   * @param name - Node name
   * @param source - Source of the knowledge
   * @param attributes - Node attributes
   * @param verify - Whether to verify immediately
   * @returns Promise with the created node
   */
  public async createKnowledgeNode(
    type: string,
    name: string,
    source: string,
    attributes: Record<string, unknown> = {},
    verify: boolean = true
  ): Promise<KnowledgeNode> {
    const node = new KnowledgeNode(type, name, source, attributes);
    return this.addKnowledgeNode(node, verify);
  }
  
  /**
   * Create a relationship between two knowledge nodes
   * @param sourceNodeId - ID of the source node
   * @param targetNodeId - ID of the target node
   * @param type - Type of relationship
   * @param confidence - Confidence score for the relationship
   * @param bidirectional - Whether the relationship is bidirectional
   * @returns Boolean indicating success
   */
  public createRelationship(
    sourceNodeId: string,
    targetNodeId: string,
    type: string,
    confidence: number = 1.0,
    bidirectional: boolean = false
  ): boolean {
    const sourceNode = this.nodes.get(sourceNodeId);
    const targetNode = this.nodes.get(targetNodeId);
    
    if (!sourceNode || !targetNode) {
      return false;
    }
    
    // Add relationship
    sourceNode.addRelationship(targetNodeId, type, confidence);
    
    // If bidirectional, add reverse relationship
    if (bidirectional) {
      const reverseType = this.getReverseRelationshipType(type);
      targetNode.addRelationship(sourceNodeId, reverseType, confidence);
    }
    
    return true;
  }
  
  /**
   * Get a knowledge node by ID
   * @param id - ID of the node to retrieve
   * @returns The knowledge node or undefined if not found
   */
  public getKnowledgeNode(id: string): KnowledgeNode | undefined {
    return this.nodes.get(id);
  }
  
  /**
   * Get knowledge nodes by type
   * @param type - Type of nodes to retrieve
   * @returns Array of knowledge nodes of the specified type
   */
  public getKnowledgeNodesByType(type: string): KnowledgeNode[] {
    return Array.from(this.nodes.values()).filter(node => node.type === type);
  }
  
  /**
   * Get knowledge nodes by source
   * @param source - Source of nodes to retrieve
   * @returns Array of knowledge nodes from the specified source
   */
  public getKnowledgeNodesBySource(source: string): KnowledgeNode[] {
    return Array.from(this.nodes.values()).filter(node => node.source === source);
  }
  
  /**
   * Search for knowledge nodes by name or attribute
   * @param query - Search query
   * @returns Array of matching knowledge nodes
   */
  public searchKnowledgeNodes(query: string): KnowledgeNode[] {
    const lowercaseQuery = query.toLowerCase();
    
    return Array.from(this.nodes.values()).filter(node => {
      // Check name
      if (node.name.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      // Check attributes
      for (const [key, value] of Object.entries(node.attributes)) {
        if (
          key.toLowerCase().includes(lowercaseQuery) ||
          String(value).toLowerCase().includes(lowercaseQuery)
        ) {
          return true;
        }
      }
      
      return false;
    });
  }
  
  /**
   * Verify a knowledge node
   * @param nodeId - ID of the node to verify
   * @returns Promise with verification results
   */
  public async verifyKnowledgeNode(
    nodeId: string
  ): Promise<Array<{ method: string; result: boolean; confidence: number; details: Record<string, unknown> }>> {
    const node = this.nodes.get(nodeId);
    
    if (!node) {
      throw new Error(`Node with ID ${nodeId} not found`);
    }
    
    const results = [];
    
    // Apply each verification method
    for (const method of this.verificationMethods) {
      try {
        const result = await method.verify(node);
        
        // Add verification result to node
        node.addVerificationResult(
          method.name,
          result.result,
          result.confidence,
          result.details
        );
        
        results.push({
          method: method.name,
          result: result.result,
          confidence: result.confidence,
          details: result.details
        });
      } catch (error) {
        console.error(`Verification method ${method.name} failed:`, error);
      }
    }
    
    return results;
  }
  
  /**
   * Get reverse relationship type
   * @param type - Original relationship type
   * @returns Reverse relationship type
   */
  private getReverseRelationshipType(type: string): string {
    // Map of relationship types to their reverse
    const reverseMap: Record<string, string> = {
      'contains': 'contained_in',
      'contains_part': 'part_of',
      'causes': 'caused_by',
      'precedes': 'follows',
      'parent_of': 'child_of',
      'implies': 'implied_by',
      'supports': 'supported_by',
      'contradicts': 'contradicted_by'
    };
    
    // Return reverse type if known, otherwise return original with _by suffix
    return reverseMap[type] || `${type}_by`;
  }
  
  /**
   * Get the reliability score for a source
   * @param source - Source name
   * @returns Reliability score between 0 and 1
   */
  private getSourceReliability(source: string): number {
    // In a real system, this would use a database of source reliability scores
    // For demonstration, using some sample scores
    const reliabilityScores: Record<string, number> = {
      'quran': 1.0,
      'hadith_sahih': 0.95,
      'hadith_hasan': 0.8,
      'tafsir_ibn_kathir': 0.9,
      'tafsir_tabari': 0.85,
      'linguistic_analysis': 0.75,
      'inference': 0.6,
      'user_input': 0.5
    };
    
    return reliabilityScores[source] || 0.5;
  }
  
  /**
   * Check the consistency of node attributes
   * @param node - Node to check
   * @returns Consistency score between 0 and 1
   */
  private checkAttributeConsistency(node: KnowledgeNode): number {
    // In a real system, this would perform sophisticated consistency checks
    // For demonstration, using a simple heuristic based on attribute count and node type
    
    // More attributes generally indicate more specific knowledge
    const attributeCount = Object.keys(node.attributes).length;
    let score = Math.min(0.5 + (attributeCount * 0.1), 1.0);
    
    // Adjust based on node type
    if (node.type === 'concept' && !node.attributes['definition']) {
      // Concepts should have definitions
      score *= 0.8;
    } else if (node.type === 'event' && !node.attributes['time']) {
      // Events should have temporal information
      score *= 0.8;
    }
    
    return score;
  }
  
  /**
   * Check the coherence of node relationships
   * @param node - Node to check
   * @returns Coherence score between 0 and 1
   */
  private checkRelationshipCoherence(node: KnowledgeNode): number {
    if (node.relationships.size === 0) {
      // No relationships to check
      return 0.5;
    }
    
    // In a real system, this would analyze graph properties
    // For demonstration, using relationship count as a proxy for coherence
    const relationshipCount = node.relationships.size;
    const scoreByCount = Math.min(0.5 + (relationshipCount * 0.05), 0.9);
    
    // Check for contradictory relationships
    const contradictionPenalty = this._checkContradictions(node);
    
    return Math.max(0.1, scoreByCount - contradictionPenalty);
  }
  
  /**
   * Check for contradictions in relationships
   * @param node - Node to check
   * @returns Contradiction penalty between 0 and 0.5
   */
  private _checkContradictions(node: KnowledgeNode): number {
    // In a real system, this would use logical rules to detect contradictions
    // For demonstration, using a simplified check
    
    let contradictionPenalty = 0;
    const relationships = node.getRelationships();
    
    // Check for potentially contradictory relationship types
    const hasSimilarTo = relationships.some(r => r.type === 'similar_to');
    const hasOppositeOf = relationships.some(r => r.type === 'opposite_of');
    
    if (hasSimilarTo && hasOppositeOf) {
      // Having both similar and opposite relationships could indicate inconsistency
      contradictionPenalty += 0.2;
    }
    
    // Check for bidirectional relationships that should be consistent
    // This would involve more complex logic in a real system
    
    return contradictionPenalty;
  }
  
  /**
   * Get statistics about the knowledge graph
   * @returns Statistics about nodes, sources, and verification
   */
  public getStatistics(): Record<string, unknown> {
    const nodeCount = this.nodes.size;
    const sourceCount = this.sources.size;
    
    // Count verified nodes
    const verifiedNodes = Array.from(this.nodes.values()).filter(node => {
      const status = node.getVerificationStatus();
      return status.isVerified && status.score > 0.7;
    });
    
    // Count relationship types
    const relationshipTypes = new Map<string, number>();
    for (const node of this.nodes.values()) {
      for (const { type } of node.getRelationships()) {
        relationshipTypes.set(type, (relationshipTypes.get(type) || 0) + 1);
      }
    }
    
    return {
      nodeCount,
      sourceCount,
      verifiedNodeCount: verifiedNodes.length,
      verificationRate: nodeCount > 0 ? verifiedNodes.length / nodeCount : 0,
      relationshipTypeCounts: Object.fromEntries(relationshipTypes.entries())
    };
  }
}