import { v4 as uuidv4 } from 'uuid';

interface Pattern {
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

/**
 * PatternDiscovery provides methods for detecting linguistic and semantic patterns in text.
 */
export class PatternDiscovery {
  // Common Quranic patterns to detect
  private linguisticPatterns: Array<{
    name: string;
    regex: RegExp;
    type: string;
    metadataFn: (match: RegExpMatchArray) => Record<string, unknown>;
  }>;
  
  constructor() {
    // Initialize patterns to detect
    this.linguisticPatterns = [
      {
        name: 'إن/لم/ثم',
        regex: /\bإن\b.*?\bلم\b.*?\bثم\b/g,
        type: 'conditional_sequence',
        metadataFn: (match) => ({
          patternType: 'conditional_sequence',
          structure: 'condition-negation-result'
        })
      },
      {
        name: 'وما/إلا',
        regex: /\bوما\b.*?\bإلا\b/g,
        type: 'exclusivity',
        metadataFn: (match) => ({
          patternType: 'exclusivity',
          structure: 'negation-exception'
        })
      },
      {
        name: 'يا أيها',
        regex: /\bيا أيها\b[^.!؟]*[.!؟]/g,
        type: 'address',
        metadataFn: (match) => ({
          patternType: 'address',
          addressee: match[0].replace(/\bيا أيها\b/, '').trim().split(' ')[0]
        })
      },
      {
        name: 'متكررة',
        regex: /(\b\w+\b)\s+\1(\s+\1)*/g,
        type: 'repetition',
        metadataFn: (match) => ({
          patternType: 'repetition',
          repeatedWord: match[1],
          count: match[0].split(/\s+/).length
        })
      }
    ];
  }
  
  /**
   * Detect patterns in the provided text
   * @param text - The text to analyze for patterns
   * @param parameters - Optional parameters for pattern detection
   * @returns Promise with array of detected patterns
   */
  public async detectPatterns(
    text: string,
    parameters: Record<string, unknown> = {}
  ): Promise<Pattern[]> {
    const minConfidence = (parameters.minConfidence as number) || 0.7;
    const patterns: Pattern[] = [];
    
    // Detect linguistic patterns
    const linguisticPatterns = this.detectLinguisticPatterns(text, minConfidence);
    patterns.push(...linguisticPatterns);
    
    // Detect semantic patterns (more complex implementation)
    if (parameters.includeSemanticPatterns) {
      const semanticPatterns = await this.detectSemanticPatterns(text, minConfidence);
      patterns.push(...semanticPatterns);
    }
    
    return patterns;
  }
  
  /**
   * Detect linguistic patterns using regular expressions
   * @param text - The text to analyze
   * @param minConfidence - Minimum confidence threshold
   * @returns Array of detected linguistic patterns
   */
  private detectLinguisticPatterns(text: string, minConfidence: number): Pattern[] {
    const patterns: Pattern[] = [];
    
    for (const pattern of this.linguisticPatterns) {
      const matches = Array.from(text.matchAll(pattern.regex));
      
      for (const match of matches) {
        const startIndex = match.index || 0;
        const endIndex = startIndex + match[0].length;
        
        // Calculate confidence based on pattern characteristics
        // In a real system, this would use more sophisticated confidence calculation
        const confidence = this.calculatePatternConfidence(match[0], pattern.type);
        
        if (confidence >= minConfidence) {
          patterns.push({
            id: uuidv4(),
            type: pattern.type,
            text: match[0],
            position: {
              start: startIndex,
              end: endIndex
            },
            confidence,
            metadata: {
              patternName: pattern.name,
              ...pattern.metadataFn(match)
            }
          });
        }
      }
    }
    
    return patterns;
  }
  
  /**
   * Detect semantic patterns using more complex analysis
   * @param text - The text to analyze
   * @param minConfidence - Minimum confidence threshold
   * @returns Promise with array of detected semantic patterns
   */
  private async detectSemanticPatterns(text: string, minConfidence: number): Promise<Pattern[]> {
    // In a real system, this would use NLP, machine learning, or other advanced techniques
    // For now, using a simplified approach
    const patterns: Pattern[] = [];
    
    // Example: detect question-answer pattern
    const questionMatches = Array.from(text.matchAll(/([^.!؟]*\?\s*[^.!؟]*\.)/g));
    
    for (const match of questionMatches) {
      const questionText = match[0];
      const startIndex = match.index || 0;
      const endIndex = startIndex + questionText.length;
      
      patterns.push({
        id: uuidv4(),
        type: 'question_answer',
        text: questionText,
        position: {
          start: startIndex,
          end: endIndex
        },
        confidence: 0.85,
        metadata: {
          patternName: 'question_answer',
          question: questionText.split('?')[0] + '?',
          answer: questionText.split('?')[1]
        }
      });
    }
    
    // Example: detect theme repetition
    const themes = ['هداية', 'رحمة', 'عذاب', 'توحيد', 'إيمان', 'كفر'];
    
    for (const theme of themes) {
      const themeRegex = new RegExp(`\\b${theme}\\b`, 'g');
      const matches = Array.from(text.matchAll(themeRegex));
      
      if (matches.length >= 3) {
        // Found a repeated theme
        const positions = matches.map(m => m.index || 0);
        const averageDistance = this.calculateAverageDistance(positions);
        
        if (averageDistance < 100) { // Arbitrary threshold for proximity
          patterns.push({
            id: uuidv4(),
            type: 'theme_repetition',
            text: text.substring(
              Math.max(0, positions[0] - 20),
              Math.min(text.length, positions[positions.length - 1] + 20)
            ),
            position: {
              start: positions[0],
              end: positions[positions.length - 1] + theme.length
            },
            confidence: 0.75 + (0.05 * matches.length), // Higher confidence with more occurrences
            metadata: {
              patternName: 'theme_repetition',
              theme,
              occurrences: matches.length,
              averageDistance
            }
          });
        }
      }
    }
    
    return patterns;
  }
  
  /**
   * Calculate confidence for a detected pattern
   * @param text - The pattern text
   * @param type - The pattern type
   * @returns Confidence score between 0 and 1
   */
  private calculatePatternConfidence(text: string, type: string): number {
    // In a real system, this would use more sophisticated confidence calculation
    // For simplicity, using basic heuristics
    let confidence = 0.7; // Base confidence
    
    // Adjust confidence based on pattern length
    if (text.length > 20) {
      confidence += 0.1;
    }
    
    // Adjust confidence based on pattern type
    if (type === 'conditional_sequence') {
      confidence += 0.1;
    } else if (type === 'exclusivity') {
      confidence += 0.15;
    }
    
    // Cap confidence at 1.0
    return Math.min(confidence, 1.0);
  }
  
  /**
   * Calculate average distance between positions
   * @param positions - Array of positions
   * @returns Average distance
   */
  private calculateAverageDistance(positions: number[]): number {
    if (positions.length <= 1) {
      return 0;
    }
    
    let totalDistance = 0;
    for (let i = 1; i < positions.length; i++) {
      totalDistance += positions[i] - positions[i - 1];
    }
    
    return totalDistance / (positions.length - 1);
  }
}