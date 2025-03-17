export interface ExplorationMethod {
  id: string;
  name: string;
  description: string;
}

export interface ExplorationResult {
  id: string;
  concept: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  results: Array<Record<string, unknown>>;
}

export interface RelationshipResult {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  confidence: number;
  evidence: Array<{
    source: string;
    text: string;
  }>;
}

export interface PatternResult {
  id: string;
  type: string;
  text: string;
  position: {
    start: number;
    end: number;
  };
  confidence: number;
  metadata: Record<string, unknown>;
}