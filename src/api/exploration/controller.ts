import { SystematicExplorer } from '../../core/explorer/systematic_explorer';
import { PatternDiscovery } from '../../core/explorer/pattern_discovery';
import { ReasoningEngine } from '../../core/explorer/reasoning_engine';
import { ExplorationMethod, ExplorationResult, RelationshipResult, PatternResult } from './types';

export class SystematicExplorerController {
  private explorer: SystematicExplorer;
  private patternDiscovery: PatternDiscovery;
  private reasoningEngine: ReasoningEngine;

  constructor() {
    this.explorer = new SystematicExplorer();
    this.patternDiscovery = new PatternDiscovery();
    this.reasoningEngine = new ReasoningEngine();
  }

  public async getExplorationMethods(): Promise<ExplorationMethod[]> {
    return [
      {
        id: 'systematic',
        name: 'Systematic Exploration',
        description: 'Systematically explore concepts and their relationships'
      },
      {
        id: 'pattern',
        name: 'Pattern Discovery',
        description: 'Discover linguistic and semantic patterns in text'
      },
      {
        id: 'reasoning',
        name: 'Reasoning Engine',
        description: 'Use reasoning to discover new relationships and inferences'
      }
    ];
  }

  public async startExploration(concept: string, parameters: Record<string, unknown>): Promise<ExplorationResult> {
    try {
      const result = await this.explorer.exploreConcept(concept, parameters);
      
      return {
        id: result.id,
        concept: result.concept,
        timestamp: new Date().toISOString(),
        status: 'completed',
        results: result.results
      };
    } catch (error) {
      throw new Error(`Exploration failed: ${error.message}`);
    }
  }

  public async getExplorationById(id: string): Promise<ExplorationResult | null> {
    try {
      const result = await this.explorer.getExplorationById(id);
      
      if (!result) {
        return null;
      }
      
      return {
        id: result.id,
        concept: result.concept,
        timestamp: result.timestamp,
        status: result.status,
        results: result.results
      };
    } catch (error) {
      throw new Error(`Failed to retrieve exploration: ${error.message}`);
    }
  }

  public async discoverRelationships(
    sourceId: string, 
    targetId: string, 
    parameters: Record<string, unknown>
  ): Promise<RelationshipResult[]> {
    try {
      const relationships = await this.reasoningEngine.discoverRelations(sourceId, targetId, parameters);
      
      return relationships.map(rel => ({
        id: rel.id,
        sourceId: rel.sourceId,
        targetId: rel.targetId,
        type: rel.type,
        confidence: rel.confidence,
        evidence: rel.evidence
      }));
    } catch (error) {
      throw new Error(`Relationship discovery failed: ${error.message}`);
    }
  }

  public async discoverPatterns(
    text: string, 
    parameters: Record<string, unknown>
  ): Promise<PatternResult[]> {
    try {
      const patterns = await this.patternDiscovery.detectPatterns(text, parameters);
      
      return patterns.map(pattern => ({
        id: pattern.id,
        type: pattern.type,
        text: pattern.text,
        position: pattern.position,
        confidence: pattern.confidence,
        metadata: pattern.metadata
      }));
    } catch (error) {
      throw new Error(`Pattern discovery failed: ${error.message}`);
    }
  }
}