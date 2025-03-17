import { v4 as uuidv4 } from 'uuid';
import { PatternDiscovery } from './pattern_discovery';
import { ReasoningEngine } from './reasoning_engine';

interface Entity {
  id: string;
  type: string;
  name: string;
  attributes: Record<string, unknown>;
  references: Array<{
    text: string;
    source: string;
    position: {
      start: number;
      end: number;
    };
  }>;
}

interface Relationship {
  id: string;
  type: string;
  sourceEntityId: string;
  targetEntityId: string;
  confidence: number;
  evidence: Array<{
    source: string;
    text: string;
  }>;
}

interface AnalysisResult {
  id: string;
  text: string;
  entities: Entity[];
  relationships: Relationship[];
  patterns: Array<Record<string, unknown>>;
  metadata: {
    timestamp: string;
    duration: number;
    parameters: Record<string, unknown>;
  };
}

/**
 * IntegratedQuranAnalysis provides methods for performing comprehensive analysis of Quranic text
 * by combining pattern discovery, entity extraction, and relationship analysis.
 */
export class IntegratedQuranAnalysis {
  private patternDiscovery: PatternDiscovery;
  private reasoningEngine: ReasoningEngine;
  private entityTypes: string[];
  private relationshipTypes: string[];
  
  constructor() {
    this.patternDiscovery = new PatternDiscovery();
    this.reasoningEngine = new ReasoningEngine();
    
    // Define entity types for extraction
    this.entityTypes = [
      'person',
      'place',
      'concept',
      'event',
      'attribute',
      'command',
      'prohibition'
    ];
    
    // Define relationship types
    this.relationshipTypes = [
      'has_attribute',
      'located_in',
      'part_of',
      'performs',
      'receives',
      'causes',
      'implies',
      'contrasts_with',
      'similar_to'
    ];
  }
  
  /**
   * Analyze text using integrated approach combining multiple analysis methods
   * @param text - The text to analyze
   * @param parameters - Optional parameters for analysis
   * @returns Promise with analysis results
   */
  public async analyzeText(
    text: string,
    parameters: Record<string, unknown> = {}
  ): Promise<AnalysisResult> {
    const startTime = Date.now();
    const analysisId = uuidv4();
    
    try {
      // 1. Discover patterns
      const patterns = await this.patternDiscovery.detectPatterns(text, parameters);
      
      // 2. Extract entities
      const entities = await this.extractEntities(text, parameters);
      
      // 3. Discover relationships between entities
      const relationships = await this.discoverRelationships(entities, text, parameters);
      
      // 4. Calculate metadata
      const duration = Date.now() - startTime;
      
      // 5. Return integrated analysis result
      return {
        id: analysisId,
        text,
        entities,
        relationships,
        patterns,
        metadata: {
          timestamp: new Date().toISOString(),
          duration,
          parameters
        }
      };
    } catch (error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }
  
  /**
   * Extract entities from text
   * @param text - The text to extract entities from
   * @param parameters - Optional parameters for extraction
   * @returns Promise with array of extracted entities
   */
  public async extractEntities(
    text: string,
    parameters: Record<string, unknown> = {}
  ): Promise<Entity[]> {
    const entities: Entity[] = [];
    const minConfidence = (parameters.minConfidence as number) || 0.7;
    
    // In a real system, this would use NLP/ML techniques for entity extraction
    // For demonstration, using simple pattern matching on key terms
    
    // Sample entities to detect in Quranic text
    const entityTerms: Record<string, { type: string, attributes: Record<string, unknown> }> = {
      'الله': { type: 'concept', attributes: { category: 'ذات إلهية' } },
      'الرحمن': { type: 'concept', attributes: { category: 'اسم من أسماء الله' } },
      'الرحيم': { type: 'concept', attributes: { category: 'اسم من أسماء الله' } },
      'المؤمنون': { type: 'person', attributes: { category: 'جماعة', faith: 'إيمان' } },
      'المتقون': { type: 'person', attributes: { category: 'جماعة', attribute: 'تقوى' } },
      'الكافرون': { type: 'person', attributes: { category: 'جماعة', faith: 'كفر' } },
      'الجنة': { type: 'place', attributes: { category: 'آخرة', function: 'ثواب' } },
      'النار': { type: 'place', attributes: { category: 'آخرة', function: 'عقاب' } },
      'الصلاة': { type: 'concept', attributes: { category: 'عبادة' } },
      'الزكاة': { type: 'concept', attributes: { category: 'عبادة' } },
      'الصيام': { type: 'concept', attributes: { category: 'عبادة' } },
      'الحج': { type: 'concept', attributes: { category: 'عبادة' } },
      'التقوى': { type: 'attribute', attributes: { category: 'قيمة' } },
      'الإيمان': { type: 'attribute', attributes: { category: 'قيمة' } },
      'الصبر': { type: 'attribute', attributes: { category: 'قيمة' } },
      'القيامة': { type: 'event', attributes: { category: 'آخرة' } }
    };
    
    // Extract entities based on term matching
    for (const [term, details] of Object.entries(entityTerms)) {
      const regex = new RegExp(`\\b${term}\\b`, 'g');
      const matches = Array.from(text.matchAll(regex));
      
      if (matches.length > 0) {
        const entity: Entity = {
          id: uuidv4(),
          type: details.type,
          name: term,
          attributes: details.attributes,
          references: matches.map(match => ({
            text: match[0],
            source: 'text_match',
            position: {
              start: match.index || 0,
              end: (match.index || 0) + match[0].length
            }
          }))
        };
        
        entities.push(entity);
      }
    }
    
    // Advanced entity extraction logic would go here
    // This could include NER (Named Entity Recognition), semantic parsing, etc.
    
    return entities;
  }
  
  /**
   * Discover relationships between entities
   * @param entities - Entities to discover relationships between
   * @param text - The original text context
   * @param parameters - Optional parameters for relationship discovery
   * @returns Promise with array of discovered relationships
   */
  public async discoverRelationships(
    entities: Entity[],
    text: string,
    parameters: Record<string, unknown> = {}
  ): Promise<Relationship[]> {
    const relationships: Relationship[] = [];
    const minConfidence = (parameters.minConfidence as number) || 0.7;
    
    // 1. Check for co-occurrence-based relationships
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entityA = entities[i];
        const entityB = entities[j];
        
        // Check if entities appear close to each other in text
        const proximityScore = this.calculateProximity(entityA, entityB);
        
        if (proximityScore > 0.6) {
          // Entities appear close together, suggest a relationship
          relationships.push({
            id: uuidv4(),
            type: 'co_occurs_with',
            sourceEntityId: entityA.id,
            targetEntityId: entityB.id,
            confidence: proximityScore,
            evidence: [{
              source: 'proximity_analysis',
              text: `Entities appear in close proximity in the text`
            }]
          });
        }
      }
    }
    
    // 2. Check for attribute relationships
    entities.forEach(entity => {
      if (entity.type === 'person' || entity.type === 'concept') {
        // Find attributes that might apply to this entity
        const attributeEntities = entities.filter(e => 
          e.type === 'attribute' && 
          this.checkAttributeApplicability(entity, e)
        );
        
        attributeEntities.forEach(attribute => {
          relationships.push({
            id: uuidv4(),
            type: 'has_attribute',
            sourceEntityId: entity.id,
            targetEntityId: attribute.id,
            confidence: 0.75,
            evidence: [{
              source: 'attribute_analysis',
              text: `Entity ${entity.name} may have attribute ${attribute.name}`
            }]
          });
        });
      }
    });
    
    // 3. Check for semantic relationships based on entity types
    const semanticRules: Array<{
      sourceType: string;
      targetType: string;
      relationshipType: string;
      confidenceScore: number;
    }> = [
      { sourceType: 'person', targetType: 'place', relationshipType: 'located_in', confidenceScore: 0.6 },
      { sourceType: 'person', targetType: 'event', relationshipType: 'participates_in', confidenceScore: 0.7 },
      { sourceType: 'concept', targetType: 'concept', relationshipType: 'related_to', confidenceScore: 0.5 },
      { sourceType: 'event', targetType: 'place', relationshipType: 'occurs_in', confidenceScore: 0.7 }
    ];
    
    semanticRules.forEach(rule => {
      const sourceEntities = entities.filter(e => e.type === rule.sourceType);
      const targetEntities = entities.filter(e => e.type === rule.targetType);
      
      sourceEntities.forEach(source => {
        targetEntities.forEach(target => {
          if (source.id !== target.id) {
            // Check if there's semantic basis for relationship
            const semanticScore = this.calculateSemanticSimilarity(source, target);
            
            if (semanticScore > 0.5) {
              relationships.push({
                id: uuidv4(),
                type: rule.relationshipType,
                sourceEntityId: source.id,
                targetEntityId: target.id,
                confidence: rule.confidenceScore * semanticScore,
                evidence: [{
                  source: 'semantic_analysis',
                  text: `Semantic relationship between ${source.name} and ${target.name}`
                }]
              });
            }
          }
        });
      });
    });
    
    // Filter by confidence threshold
    return relationships.filter(rel => rel.confidence >= minConfidence);
  }
  
  /**
   * Calculate proximity score between two entities
   * @param entityA - First entity
   * @param entityB - Second entity
   * @returns Proximity score between 0 and 1
   */
  private calculateProximity(entityA: Entity, entityB: Entity): number {
    if (entityA.references.length === 0 || entityB.references.length === 0) {
      return 0;
    }
    
    // Find minimum distance between any references of the two entities
    let minDistance = Infinity;
    
    for (const refA of entityA.references) {
      for (const refB of entityB.references) {
        const distanceA = Math.abs(refA.position.end - refB.position.start);
        const distanceB = Math.abs(refB.position.end - refA.position.start);
        const distance = Math.min(distanceA, distanceB);
        
        if (distance < minDistance) {
          minDistance = distance;
        }
      }
    }
    
    // Normalize distance to a proximity score between 0 and 1
    // Closer entities have higher scores
    if (minDistance === Infinity) {
      return 0;
    }
    
    // If distance is less than 50 characters, consider it close
    const proximityScore = Math.max(0, 1 - (minDistance / 100));
    return proximityScore;
  }
  
  /**
   * Check if an attribute is applicable to an entity
   * @param entity - Entity to check
   * @param attribute - Attribute to check applicability
   * @returns Boolean indicating applicability
   */
  private checkAttributeApplicability(entity: Entity, attribute: Entity): boolean {
    // In a real system, this would use more sophisticated logic
    // For demonstration, using simple category matching
    
    if (entity.type === 'person' && 
        attribute.attributes['category'] === 'قيمة') {
      return true;
    }
    
    if (entity.type === 'concept' && 
        entity.attributes['category'] === attribute.attributes['category']) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Calculate semantic similarity between entities
   * @param entityA - First entity
   * @param entityB - Second entity
   * @returns Similarity score between 0 and 1
   */
  private calculateSemanticSimilarity(entityA: Entity, entityB: Entity): number {
    // In a real system, this would use embeddings or other semantic models
    // For demonstration, using simple attribute matching
    
    let score = 0.0;
    const attributesA = Object.entries(entityA.attributes);
    const attributesB = Object.entries(entityB.attributes);
    
    // Count matching attributes
    let matchCount = 0;
    
    for (const [keyA, valueA] of attributesA) {
      for (const [keyB, valueB] of attributesB) {
        if (keyA === keyB && valueA === valueB) {
          matchCount++;
        }
      }
    }
    
    // Calculate score based on attribute matches
    if (attributesA.length > 0 && attributesB.length > 0) {
      const maxPossibleMatches = Math.min(attributesA.length, attributesB.length);
      score = matchCount / maxPossibleMatches;
    }
    
    return score;
  }
}