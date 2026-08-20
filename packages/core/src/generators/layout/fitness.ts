// ============================================================================
// Fitness Function for Layout Quality
// Evaluates layouts based on design principles:
// - Visual Hierarchy
// - Balance
// - Rhythm
// - Proportion
// - Alignment
// - Spacing
// - Whitespace
// - Harmony
// ============================================================================

import {
  FitnessScore,
  GridSystem,
  LayoutElement,
  LayoutScoreWeights,
  DEFAULT_SCORE_WEIGHTS,
} from './types.js';

/**
 * Calculate the complete fitness score for a layout
 */
export function calculateFitness(
  elements: Map<string, LayoutElement>,
  grid: GridSystem,
  weights: LayoutScoreWeights = DEFAULT_SCORE_WEIGHTS
): FitnessScore {
  const hierarchy = scoreHierarchy(elements, grid);
  const balance = scoreBalance(elements, grid);
  const rhythm = scoreRhythm(elements, grid);
  const proportion = scoreProportion(elements, grid);
  const alignment = scoreAlignment(elements, grid);
  const spacing = scoreSpacing(elements, grid);
  const whitespace = scoreWhitespace(elements, grid);
  const harmony = scoreHarmony(elements, grid);

  const total =
    hierarchy * weights.hierarchy +
    balance * weights.balance +
    rhythm * weights.rhythm +
    proportion * weights.proportion +
    alignment * weights.alignment +
    spacing * weights.spacing +
    whitespace * weights.whitespace +
    harmony * weights.harmony;

  return {
    total,
    hierarchy,
    balance,
    rhythm,
    proportion,
    alignment,
    spacing,
    whitespace,
    harmony,
  };
}

/**
 * Visual Hierarchy Score
 * Higher priority elements should be larger and positioned more prominently
 * (top-left in LTR reading patterns, larger area)
 */
export function scoreHierarchy(
  elements: Map<string, LayoutElement>,
  grid: GridSystem
): number {
  const positioned = [...elements.values()].filter(e => e.position);
  if (positioned.length === 0) return 0;
  if (positioned.length === 1) return 1;

  // Sort by priority descending
  const sorted = [...positioned].sort((a, b) => b.priority - a.priority);
  let score = 0;
  let comparisons = 0;

  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const high = sorted[i];
      const low = sorted[j];
      if (high.priority > low.priority) {
        comparisons++;
        const highArea = getElementArea(high);
        const lowArea = getElementArea(low);

        // Higher priority should have more area
        if (highArea >= lowArea) {
          score += 1;
        } else {
          const ratio = highArea / Math.max(1, lowArea);
          score += ratio;
        }

        // Higher priority should be positioned higher (lower row index)
        const highCenterY = (high.position!.rowStart + high.position!.rowEnd) / 2;
        const lowCenterY = (low.position!.rowStart + low.position!.rowEnd) / 2;
        if (highCenterY <= lowCenterY) {
          score += 0.5;
        }
        comparisons += 0.5;
      }
    }
  }

  return comparisons > 0 ? Math.min(1, score / comparisons) : 1;
}

/**
 * Balance Score
 * Layout should be visually balanced around the center of gravity
 * Uses the principle of moments (weighted centroid)
 */
export function scoreBalance(
  elements: Map<string, LayoutElement>,
  grid: GridSystem
): number {
  const positioned = [...elements.values()].filter(e => e.position);
  if (positioned.length === 0) return 0;

  const gridCenterX = grid.dimensions.columns / 2;
  const gridCenterY = grid.dimensions.rows / 2;

  let totalMomentX = 0;
  let totalMomentY = 0;
  let totalMass = 0;

  for (const el of positioned) {
    const centerX = (el.position!.columnStart + el.position!.columnEnd) / 2;
    const centerY = (el.position!.rowStart + el.position!.rowEnd) / 2;
    const area = getElementArea(el);
    const mass = area * el.priority;

    totalMomentX += (centerX - gridCenterX) * mass;
    totalMomentY += (centerY - gridCenterY) * mass;
    totalMass += mass;
  }

  if (totalMass === 0) return 1;

  // Normalized offset from center (0 = perfect balance, 1 = completely off)
  const offsetX = Math.abs(totalMomentX / totalMass) / grid.dimensions.columns;
  const offsetY = Math.abs(totalMomentY / totalMass) / grid.dimensions.rows;

  return 1 - Math.min(1, (offsetX + offsetY) * 2);
}

/**
 * Rhythm Score
 * Elements should create a sense of visual rhythm through repetition and progression
 * Checks for consistent sizing patterns and regular intervals
 */
export function scoreRhythm(
  elements: Map<string, LayoutElement>,
  grid: GridSystem
): number {
  const positioned = [...elements.values()].filter(e => e.position);
  if (positioned.length < 3) return 0.5;

  // Check for consistent heights (horizontal rhythm)
  const heights = positioned.map(e => e.position!.rowEnd - e.position!.rowStart);
  const widths = positioned.map(e => e.position!.columnEnd - e.position!.columnStart);

  const heightRhythm = calculateConsistency(heights);
  const widthRhythm = calculateConsistency(widths);

  // Check for regular vertical spacing
  const sortedByRow = [...positioned].sort((a, b) => a.position!.rowStart - b.position!.rowStart);
  const rowGaps: number[] = [];
  for (let i = 1; i < sortedByRow.length; i++) {
    const gap = sortedByRow[i].position!.rowStart - sortedByRow[i - 1].position!.rowEnd;
    if (gap >= 0) rowGaps.push(gap);
  }

  // Check for regular horizontal spacing
  const sortedByCol = [...positioned].sort((a, b) => a.position!.columnStart - b.position!.columnStart);
  const colGaps: number[] = [];
  for (let i = 1; i < sortedByCol.length; i++) {
    const gap = sortedByCol[i].position!.columnStart - sortedByCol[i - 1].position!.columnEnd;
    if (gap >= 0) colGaps.push(gap);
  }

  const rowRhythm = rowGaps.length > 1 ? calculateConsistency(rowGaps) : 0.5;
  const colRhythm = colGaps.length > 1 ? calculateConsistency(colGaps) : 0.5;

  return (heightRhythm + widthRhythm + rowRhythm + colRhythm) / 4;
}

/**
 * Proportion Score
 * Elements should use harmonious proportions (golden ratio, rule of thirds)
 */
export function scoreProportion(
  elements: Map<string, LayoutElement>,
  grid: GridSystem
): number {
  const positioned = [...elements.values()].filter(e => e.position);
  if (positioned.length === 0) return 0;

  const PHI = 1.618033988749895;
  let totalScore = 0;

  for (const el of positioned) {
    const width = el.position!.columnEnd - el.position!.columnStart;
    const height = el.position!.rowEnd - el.position!.rowStart;
    if (height === 0) continue;

    const ratio = width / height;

    // Check golden ratio
    const phiDiff = Math.min(
      Math.abs(ratio - PHI),
      Math.abs(ratio - 1 / PHI)
    );
    const phiScore = Math.max(0, 1 - phiDiff / PHI);

    // Check rule of thirds (1:1, 2:1, 1:2, 3:1, 1:3)
    const niceRatios = [0.5, 1, 1.5, 2, 3];
    let niceScore = 0;
    for (const r of niceRatios) {
      const diff = Math.abs(ratio - r) / r;
      niceScore = Math.max(niceScore, Math.max(0, 1 - diff));
    }

    // Check if element respects its own aspect ratio preference
    let aspectScore = 1;
    if (el.aspectRatio) {
      const aspectDiff = Math.abs(ratio - el.aspectRatio) / el.aspectRatio;
      aspectScore = Math.max(0, 1 - aspectDiff);
    }

    totalScore += (phiScore * 0.3 + niceScore * 0.4 + aspectScore * 0.3);
  }

  return totalScore / positioned.length;
}

/**
 * Alignment Score
 * Elements should align to common edges and baselines
 */
export function scoreAlignment(
  elements: Map<string, LayoutElement>,
  grid: GridSystem
): number {
  const positioned = [...elements.values()].filter(e => e.position);
  if (positioned.length < 2) return 1;

  // Collect all edge positions
  const leftEdges = new Map<number, number>();
  const rightEdges = new Map<number, number>();
  const topEdges = new Map<number, number>();
  const bottomEdges = new Map<number, number>();

  for (const el of positioned) {
    const p = el.position!;
    leftEdges.set(p.columnStart, (leftEdges.get(p.columnStart) || 0) + 1);
    rightEdges.set(p.columnEnd, (rightEdges.get(p.columnEnd) || 0) + 1);
    topEdges.set(p.rowStart, (topEdges.get(p.rowStart) || 0) + 1);
    bottomEdges.set(p.rowEnd, (bottomEdges.get(p.rowEnd) || 0) + 1);
  }

  // Score based on how many elements share common alignments
  const maxLeft = Math.max(...leftEdges.values());
  const maxRight = Math.max(...rightEdges.values());
  const maxTop = Math.max(...topEdges.values());
  const maxBottom = Math.max(...bottomEdges.values());

  const leftScore = maxLeft / positioned.length;
  const rightScore = maxRight / positioned.length;
  const topScore = maxTop / positioned.length;
  const bottomScore = maxBottom / positioned.length;

  return (leftScore + rightScore + topScore + bottomScore) / 4;
}

/**
 * Spacing Score
 * Elements should have consistent, adequate spacing
 */
export function scoreSpacing(
  elements: Map<string, LayoutElement>,
  grid: GridSystem
): number {
  const positioned = [...elements.values()].filter(e => e.position);
  if (positioned.length < 2) return 1;

  const gaps: number[] = [];

  for (let i = 0; i < positioned.length; i++) {
    for (let j = i + 1; j < positioned.length; j++) {
      const p1 = positioned[i].position!;
      const p2 = positioned[j].position!;

      // Calculate minimum gap between two rectangles
      let gap: number;
      if (p1.columnEnd <= p2.columnStart) {
        gap = p2.columnStart - p1.columnEnd;
      } else if (p2.columnEnd <= p1.columnStart) {
        gap = p1.columnStart - p2.columnEnd;
      } else if (p1.rowEnd <= p2.rowStart) {
        gap = p2.rowStart - p1.rowEnd;
      } else if (p2.rowEnd <= p1.rowStart) {
        gap = p1.rowStart - p2.rowEnd;
      } else {
        gap = 0; // Overlapping
      }

      gaps.push(gap);
    }
  }

  if (gaps.length === 0) return 1;

  // Check consistency of gaps
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variance = gaps.reduce((sum, g) => sum + Math.pow(g - avgGap, 2), 0) / gaps.length;
  const stdDev = Math.sqrt(variance);

  // Lower coefficient of variation = more consistent
  const cv = avgGap > 0 ? stdDev / avgGap : 0;
  const consistencyScore = Math.max(0, 1 - cv);

  // Check for adequate spacing (at least 1 cell gap preferred)
  const minGap = Math.min(...gaps);
  const adequacyScore = minGap >= 0.5 ? 1 : minGap >= 0 ? 0.5 : 0;

  return consistencyScore * 0.6 + adequacyScore * 0.4;
}

/**
 * Whitespace Score
 * Layout should have appropriate amount of whitespace (not too crowded, not too empty)
 * Ideal whitespace is typically 20-40% of total area
 */
export function scoreWhitespace(
  elements: Map<string, LayoutElement>,
  grid: GridSystem
): number {
  const totalCells = grid.dimensions.rows * grid.dimensions.columns;
  let occupiedCells = 0;

  for (const el of elements.values()) {
    if (el.position) {
      const width = el.position.columnEnd - el.position.columnStart;
      const height = el.position.rowEnd - el.position.rowStart;
      occupiedCells += width * height;
    }
  }

  const whitespaceRatio = 1 - occupiedCells / totalCells;

  // Ideal whitespace is between 20% and 40%
  if (whitespaceRatio >= 0.2 && whitespaceRatio <= 0.4) {
    return 1;
  } else if (whitespaceRatio < 0.2) {
    // Too crowded
    return Math.max(0, whitespaceRatio / 0.2);
  } else {
    // Too empty
    return Math.max(0, 1 - (whitespaceRatio - 0.4) / 0.3);
  }
}

/**
 * Harmony Score
 * Overall visual harmony based on gestalt principles
 * Checks for proximity, similarity, and continuity
 */
export function scoreHarmony(
  elements: Map<string, LayoutElement>,
  grid: GridSystem
): number {
  const positioned = [...elements.values()].filter(e => e.position);
  if (positioned.length < 2) return 0.5;

  // Proximity: related elements should be grouped
  const proximityScore = calculateProximity(positioned);

  // Similarity: elements of same type should have similar sizes
  const similarityScore = calculateSimilarity(positioned);

  // Continuity: elements should form clear flow lines
  const continuityScore = calculateContinuity(positioned);

  return proximityScore * 0.4 + similarityScore * 0.3 + continuityScore * 0.3;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getElementArea(el: LayoutElement): number {
  if (!el.position) return 0;
  const width = el.position.columnEnd - el.position.columnStart;
  const height = el.position.rowEnd - el.position.rowStart;
  return width * height;
}

function calculateConsistency(values: number[]): number {
  if (values.length < 2) return 0.5;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  if (avg === 0) return 1;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / avg;
  return Math.max(0, 1 - cv);
}

function calculateProximity(elements: LayoutElement[]): number {
  // Group elements by type and check if same-type elements are close together
  const byType = new Map<string, LayoutElement[]>();
  for (const el of elements) {
    const group = byType.get(el.type) || [];
    group.push(el);
    byType.set(el.type, group);
  }

  let totalScore = 0;
  let groups = 0;

  for (const group of byType.values()) {
    if (group.length < 2) continue;
    groups++;

    let groupScore = 0;
    let pairs = 0;

    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const c1 = getCenter(group[i]);
        const c2 = getCenter(group[j]);
        const dist = Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2));
        // Closer = higher score, with diminishing returns
        groupScore += 1 / (1 + dist * 0.5);
        pairs++;
      }
    }

    if (pairs > 0) {
      totalScore += groupScore / pairs;
    }
  }

  return groups > 0 ? totalScore / groups : 0.5;
}

function calculateSimilarity(elements: LayoutElement[]): number {
  // Check if elements of the same type have similar areas
  const byType = new Map<string, number[]>();
  for (const el of elements) {
    const area = getElementArea(el);
    const areas = byType.get(el.type) || [];
    areas.push(area);
    byType.set(el.type, areas);
  }

  let totalScore = 0;
  let groups = 0;

  for (const areas of byType.values()) {
    if (areas.length < 2) continue;
    groups++;
    totalScore += calculateConsistency(areas);
  }

  return groups > 0 ? totalScore / groups : 0.5;
}

function calculateContinuity(elements: LayoutElement[]): number {
  // Check if elements form clear horizontal or vertical flow lines
  const centers = elements.map(getCenter);

  // Check horizontal alignment (same Y)
  const yCoords = centers.map(c => c.y);
  const yConsistency = calculateConsistency(yCoords);

  // Check vertical alignment (same X)
  const xCoords = centers.map(c => c.x);
  const xConsistency = calculateConsistency(xCoords);

  return Math.max(yConsistency, xConsistency);
}

function getCenter(el: LayoutElement): { x: number; y: number } {
  if (!el.position) return { x: 0, y: 0 };
  return {
    x: (el.position.columnStart + el.position.columnEnd) / 2,
    y: (el.position.rowStart + el.position.rowEnd) / 2,
  };
}