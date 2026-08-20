// ============================================================================
// Layout Scoring System
// Scores layouts based on design principles:
// - Visual Hierarchy: Elements arranged by importance
// - Balance: Visual weight distribution
// - Rhythm: Repetition and progression
// - Proportion: Harmonious size relationships
// - Alignment: Elements share common edges
// - Spacing: Consistent gaps between elements
// - Whitespace: Appropriate breathing room
// - Harmony: Overall gestalt cohesion
// ============================================================================

import { FitnessScore, GridSystem, LayoutElement } from './types.js';

export interface DesignPrinciple {
  name: string;
  description: string;
  weight: number;
  score: number;
}

export interface LayoutAnalysis {
  principles: DesignPrinciple[];
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

/**
 * Analyze a layout and return detailed scoring with suggestions
 */
export function analyzeLayout(
  elements: Map<string, LayoutElement>,
  grid: GridSystem,
  fitness: FitnessScore
): LayoutAnalysis {
  const principles: DesignPrinciple[] = [
    {
      name: 'Visual Hierarchy',
      description: 'Elements are sized and positioned according to their importance',
      weight: 0.20,
      score: fitness.hierarchy,
    },
    {
      name: 'Balance',
      description: 'Visual weight is evenly distributed across the layout',
      weight: 0.18,
      score: fitness.balance,
    },
    {
      name: 'Rhythm',
      description: 'Consistent patterns create visual rhythm and flow',
      weight: 0.12,
      score: fitness.rhythm,
    },
    {
      name: 'Proportion',
      description: 'Element sizes follow harmonious ratios (golden ratio, rule of thirds)',
      weight: 0.15,
      score: fitness.proportion,
    },
    {
      name: 'Alignment',
      description: 'Elements align to common edges and baselines',
      weight: 0.10,
      score: fitness.alignment,
    },
    {
      name: 'Spacing',
      description: 'Consistent gaps between elements create order',
      weight: 0.10,
      score: fitness.spacing,
    },
    {
      name: 'Whitespace',
      description: 'Appropriate empty space gives elements room to breathe',
      weight: 0.08,
      score: fitness.whitespace,
    },
    {
      name: 'Harmony',
      description: 'Overall visual cohesion following gestalt principles',
      weight: 0.07,
      score: fitness.harmony,
    },
  ];

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  // Analyze each principle
  for (const principle of principles) {
    if (principle.score >= 0.8) {
      strengths.push(principle.name);
    } else if (principle.score < 0.5) {
      weaknesses.push(principle.name);
      suggestions.push(getSuggestion(principle.name, principle.score));
    }
  }

  return {
    principles,
    overallScore: fitness.total,
    strengths,
    weaknesses,
    suggestions,
  };
}

/**
 * Get improvement suggestion for a design principle
 */
function getSuggestion(principleName: string, score: number): string {
  const suggestions: Record<string, string[]> = {
    'Visual Hierarchy': [
      'Increase size difference between high and low priority elements',
      'Move higher priority elements toward the top of the layout',
      'Use whitespace to emphasize important elements',
    ],
    Balance: [
      'Redistribute element sizes to balance visual weight',
      'Add whitespace to lighter areas of the layout',
      'Consider asymmetric balance with a clear focal point',
    ],
    Rhythm: [
      'Create consistent spacing patterns between elements',
      'Use repeated element sizes for visual rhythm',
      'Align elements to a regular grid structure',
    ],
    Proportion: [
      'Adjust element ratios toward golden ratio (1:1.618)',
      'Use power-of-two or rule-of-thirds proportions',
      'Maintain consistent aspect ratios for similar elements',
    ],
    Alignment: [
      'Snap element edges to common alignment lines',
      'Use a consistent grid for positioning',
      'Align text baselines across columns',
    ],
    Spacing: [
      'Standardize gaps between elements',
      'Use a spacing scale (4px, 8px, 16px, 32px)',
      'Increase whitespace between unrelated elements',
    ],
    Whitespace: [
      score < 0.5
        ? 'Add more empty space around important elements'
        : 'Consider adding more content to fill excessive whitespace',
      'Use margins to create breathing room',
      'Group related elements with proximity',
    ],
    Harmony: [
      'Group related elements together',
      'Use consistent sizing for similar element types',
      'Create clear visual flow lines through the layout',
    ],
  };

  const options = suggestions[principleName] || ['Review and adjust this aspect of the layout'];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Compare two layouts and return which is better
 */
export function compareLayouts(
  fitness1: FitnessScore,
  fitness2: FitnessScore
): { winner: 1 | 2 | 0; margin: number; details: string[] } {
  const details: string[] = [];
  let score1 = 0;
  let score2 = 0;

  const keys: (keyof FitnessScore)[] = [
    'hierarchy',
    'balance',
    'rhythm',
    'proportion',
    'alignment',
    'spacing',
    'whitespace',
    'harmony',
  ];

  for (const key of keys) {
    if (fitness1[key] > fitness2[key]) {
      score1++;
      details.push(`Layout 1 has better ${key} (${(fitness1[key] * 100).toFixed(1)}% vs ${(fitness2[key] * 100).toFixed(1)}%)`);
    } else if (fitness2[key] > fitness1[key]) {
      score2++;
      details.push(`Layout 2 has better ${key} (${(fitness2[key] * 100).toFixed(1)}% vs ${(fitness1[key] * 100).toFixed(1)}%)`);
    }
  }

  const winner: 1 | 2 | 0 = score1 > score2 ? 1 : score2 > score1 ? 2 : 0;
  const margin = Math.abs(fitness1.total - fitness2.total);

  return { winner, margin, details };
}

/**
 * Grade a layout score (A-F scale)
 */
export function gradeLayout(score: number): { grade: string; description: string } {
  if (score >= 0.9) return { grade: 'A', description: 'Excellent layout with strong design principles' };
  if (score >= 0.8) return { grade: 'B', description: 'Good layout with minor improvements possible' };
  if (score >= 0.7) return { grade: 'C', description: 'Acceptable layout with room for improvement' };
  if (score >= 0.6) return { grade: 'D', description: 'Below average, needs significant changes' };
  return { grade: 'F', description: 'Poor layout, major redesign recommended' };
}

/**
 * Calculate element relationship metrics
 */
export function calculateElementMetrics(
  elements: Map<string, LayoutElement>,
  grid: GridSystem
): {
  averageSize: number;
  sizeVariance: number;
  coverageRatio: number;
  overlapCount: number;
} {
  const positioned = [...elements.values()].filter(e => e.position);
  if (positioned.length === 0) {
    return { averageSize: 0, sizeVariance: 0, coverageRatio: 0, overlapCount: 0 };
  }

  const areas = positioned.map(e => {
    const w = e.position!.columnEnd - e.position!.columnStart;
    const h = e.position!.rowEnd - e.position!.rowStart;
    return w * h;
  });

  const totalCells = grid.dimensions.rows * grid.dimensions.columns;
  const totalArea = areas.reduce((a, b) => a + b, 0);

  const averageSize = totalArea / positioned.length;
  const sizeVariance =
    areas.reduce((sum, a) => sum + Math.pow(a - averageSize, 2), 0) / positioned.length;
  const coverageRatio = totalArea / totalCells;

  // Count overlaps (should be 0 for valid layouts)
  let overlapCount = 0;
  for (let i = 0; i < positioned.length; i++) {
    for (let j = i + 1; j < positioned.length; j++) {
      const p1 = positioned[i].position!;
      const p2 = positioned[j].position!;
      if (
        p1.columnStart < p2.columnEnd &&
        p1.columnEnd > p2.columnStart &&
        p1.rowStart < p2.rowEnd &&
        p1.rowEnd > p2.rowStart
      ) {
        overlapCount++;
      }
    }
  }

  return { averageSize, sizeVariance, coverageRatio, overlapCount };
}