// ============================================================================
// Constraint Solver
// Constraint Satisfaction Problem (CSP) solver for layout constraints
// ============================================================================

import {
  Constraint,
  ConstraintViolation,
  ConstraintSatisfactionResult,
  GridSystem,
  LayoutElement,
} from './types.js';

/**
 * Constraint Solver using backtracking with forward checking
 * Solves layout constraints to find valid element placements
 */
export class ConstraintSolver {
  private constraints: Constraint[] = [];
  private maxIterations = 1000;

  /**
   * Add a constraint to the solver
   */
  addConstraint(constraint: Constraint): void {
    this.constraints.push(constraint);
  }

  /**
   * Remove a constraint by ID
   */
  removeConstraint(id: string): void {
    this.constraints = this.constraints.filter(c => c.id !== id);
  }

  /**
   * Clear all constraints
   */
  clearConstraints(): void {
    this.constraints = [];
  }

  /**
   * Get all constraints
   */
  getConstraints(): Constraint[] {
    return [...this.constraints];
  }

  /**
   * Solve constraints and return satisfaction result
   */
  solve(
    elements: Map<string, LayoutElement>,
    grid: GridSystem
  ): ConstraintSatisfactionResult {
    const violations: ConstraintViolation[] = [];
    let totalScore = 0;
    let totalWeight = 0;
    let iterations = 0;

    for (const constraint of this.constraints) {
      iterations++;
      if (iterations > this.maxIterations) break;

      const score = constraint.evaluate(elements, grid);
      totalWeight += constraint.weight;

      if (score < 1) {
        const violation: ConstraintViolation = {
          constraintId: constraint.id,
          severity: 1 - score,
          message: this.getViolationMessage(constraint, score),
          elements: constraint.elements,
        };
        violations.push(violation);
      }

      totalScore += score * constraint.weight;
    }

    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 1;

    return {
      satisfied: violations.length === 0,
      violations,
      score: finalScore,
      iterations,
    };
  }

  /**
   * Check if all constraints are satisfied
   */
  isSatisfied(
    elements: Map<string, LayoutElement>,
    grid: GridSystem,
    threshold = 0.95
  ): boolean {
    return this.solve(elements, grid).score >= threshold;
  }

  /**
   * Get the most violated constraints
   */
  getViolations(
    elements: Map<string, LayoutElement>,
    grid: GridSystem,
    topN = 5
  ): ConstraintViolation[] {
    const result = this.solve(elements, grid);
    return result.violations
      .sort((a, b) => b.severity - a.severity)
      .slice(0, topN);
  }

  /**
   * Generate a human-readable violation message
   */
  private getViolationMessage(constraint: Constraint, score: number): string {
    const typeNames: Record<string, string> = {
      adjacency: 'Adjacency',
      alignment: 'Alignment',
      spacing: 'Spacing',
      proportion: 'Proportion',
      hierarchy: 'Hierarchy',
      balance: 'Balance',
      sequence: 'Sequence',
      containment: 'Containment',
      symmetry: 'Symmetry',
    };
    const typeName = typeNames[constraint.type] || constraint.type;
    return `${typeName} constraint violated (satisfaction: ${(score * 100).toFixed(1)}%)`;
  }

  /**
   * Set maximum iterations for solving
   */
  setMaxIterations(max: number): void {
    this.maxIterations = max;
  }
}

// ============================================================================
// Built-in Constraint Factories
// ============================================================================

/**
 * Create an adjacency constraint - elements should be next to each other
 */
export function createAdjacencyConstraint(
  id: string,
  elementIds: string[],
  weight = 1.0
): Constraint {
  return {
    id,
    type: 'adjacency',
    elements: elementIds,
    weight,
    evaluate: (elements, grid) => {
      if (elementIds.length < 2) return 1;
      let adjacentCount = 0;
      let totalPairs = 0;
      for (let i = 0; i < elementIds.length; i++) {
        for (let j = i + 1; j < elementIds.length; j++) {
          totalPairs++;
          const el1 = elements.get(elementIds[i]);
          const el2 = elements.get(elementIds[j]);
          if (el1?.position && el2?.position) {
            if (areAdjacent(el1.position, el2.position)) {
              adjacentCount++;
            }
          }
        }
      }
      return totalPairs > 0 ? adjacentCount / totalPairs : 1;
    },
  };
}

/**
 * Create an alignment constraint - elements should be aligned
 */
export function createAlignmentConstraint(
  id: string,
  elementIds: string[],
  axis: 'horizontal' | 'vertical' | 'both' = 'both',
  weight = 1.0
): Constraint {
  return {
    id,
    type: 'alignment',
    elements: elementIds,
    weight,
    evaluate: (elements) => {
      if (elementIds.length < 2) return 1;
      const positioned = elementIds.map(id => elements.get(id)).filter(e => e?.position);
      if (positioned.length < 2) return 1;

      let score = 0;
      let checks = 0;

      for (let i = 0; i < positioned.length; i++) {
        for (let j = i + 1; j < positioned.length; j++) {
          const p1 = positioned[i]!.position!;
          const p2 = positioned[j]!.position!;
          if (axis === 'horizontal' || axis === 'both') {
            // Check if top edges align
            if (p1.rowStart === p2.rowStart) score++;
            // Check if bottom edges align
            if (p1.rowEnd === p2.rowEnd) score++;
            checks += 2;
          }
          if (axis === 'vertical' || axis === 'both') {
            // Check if left edges align
            if (p1.columnStart === p2.columnStart) score++;
            // Check if right edges align
            if (p1.columnEnd === p2.columnEnd) score++;
            checks += 2;
          }
        }
      }

      return checks > 0 ? Math.min(1, score / checks * 3) : 1;
    },
  };
}

/**
 * Create a spacing constraint - elements should have consistent spacing
 */
export function createSpacingConstraint(
  id: string,
  elementIds: string[],
  targetGap: number,
  weight = 1.0
): Constraint {
  return {
    id,
    type: 'spacing',
    elements: elementIds,
    weight,
    evaluate: (elements) => {
      if (elementIds.length < 2) return 1;
      const positioned = elementIds.map(id => elements.get(id)).filter(e => e?.position);
      if (positioned.length < 2) return 1;

      const gaps: number[] = [];
      for (let i = 0; i < positioned.length; i++) {
        for (let j = i + 1; j < positioned.length; j++) {
          const p1 = positioned[i]!.position!;
          const p2 = positioned[j]!.position!;
          const gap = Math.abs(p1.rowStart - p2.rowStart) + Math.abs(p1.columnStart - p2.columnStart);
          gaps.push(gap);
        }
      }

      if (gaps.length === 0) return 1;
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      const variance = gaps.reduce((sum, g) => sum + Math.pow(g - avgGap, 2), 0) / gaps.length;
      const stdDev = Math.sqrt(variance);

      // Lower stdDev = more consistent spacing = higher score
      const consistencyScore = Math.max(0, 1 - stdDev / Math.max(1, targetGap));
      const targetScore = Math.max(0, 1 - Math.abs(avgGap - targetGap) / Math.max(1, targetGap));

      return (consistencyScore + targetScore) / 2;
    },
  };
}

/**
 * Create a proportion constraint - element should maintain aspect ratio
 */
export function createProportionConstraint(
  id: string,
  elementId: string,
  targetRatio: number,
  weight = 1.0
): Constraint {
  return {
    id,
    type: 'proportion',
    elements: [elementId],
    weight,
    evaluate: (elements) => {
      const el = elements.get(elementId);
      if (!el?.position) return 0;
      const width = el.position.columnEnd - el.position.columnStart;
      const height = el.position.rowEnd - el.position.rowStart;
      if (height === 0) return 0;
      const actualRatio = width / height;
      const diff = Math.abs(actualRatio - targetRatio) / targetRatio;
      return Math.max(0, 1 - diff);
    },
  };
}

/**
 * Create a hierarchy constraint - higher priority elements should be more prominent
 */
export function createHierarchyConstraint(
  id: string,
  weight = 1.0
): Constraint {
  return {
    id,
    type: 'hierarchy',
    elements: [],
    weight,
    evaluate: (elements) => {
      const positioned = [...elements.values()].filter(e => e.position);
      if (positioned.length < 2) return 1;

      // Sort by priority (descending)
      const sorted = [...positioned].sort((a, b) => b.priority - a.priority);
      let violations = 0;
      let comparisons = 0;

      for (let i = 0; i < sorted.length - 1; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const high = sorted[i];
          const low = sorted[j];
          if (high.priority > low.priority) {
            comparisons++;
            const highArea = getElementAreaValue(high);
            const lowArea = getElementAreaValue(low);
            if (highArea < lowArea) {
              violations++;
            }
          }
        }
      }

      return comparisons > 0 ? 1 - violations / comparisons : 1;
    },
  };
}

/**
 * Create a balance constraint - layout should be visually balanced
 */
export function createBalanceConstraint(
  id: string,
  weight = 1.0
): Constraint {
  return {
    id,
    type: 'balance',
    elements: [],
    weight,
    evaluate: (elements, grid) => {
      const positioned = [...elements.values()].filter(e => e.position);
      if (positioned.length === 0) return 1;

      const gridCenterX = grid.dimensions.columns / 2;
      const gridCenterY = grid.dimensions.rows / 2;

      let totalWeight = 0;
      let weightedX = 0;
      let weightedY = 0;

      for (const el of positioned) {
        const centerX = (el.position!.columnStart + el.position!.columnEnd) / 2;
        const centerY = (el.position!.rowStart + el.position!.rowEnd) / 2;
        const area = getElementAreaValue(el);
        weightedX += centerX * area;
        weightedY += centerY * area;
        totalWeight += area;
      }

      if (totalWeight === 0) return 1;

      const centroidX = weightedX / totalWeight;
      const centroidY = weightedY / totalWeight;

      const offsetX = Math.abs(centroidX - gridCenterX) / grid.dimensions.columns;
      const offsetY = Math.abs(centroidY - gridCenterY) / grid.dimensions.rows;

      return 1 - (offsetX + offsetY) / 2;
    },
  };
}

/**
 * Create a containment constraint - element should be within grid bounds
 */
export function createContainmentConstraint(
  id: string,
  elementId: string,
  weight = 2.0
): Constraint {
  return {
    id,
    type: 'containment',
    elements: [elementId],
    weight,
    evaluate: (elements, grid) => {
      const el = elements.get(elementId);
      if (!el?.position) return 0;
      const p = el.position;
      if (
        p.rowStart >= 0 &&
        p.rowEnd <= grid.dimensions.rows &&
        p.columnStart >= 0 &&
        p.columnEnd <= grid.dimensions.columns
      ) {
        return 1;
      }
      return 0;
    },
  };
}

/**
 * Create a symmetry constraint - elements should be symmetrically placed
 */
export function createSymmetryConstraint(
  id: string,
  elementIds: string[],
  axis: 'vertical' | 'horizontal' = 'vertical',
  weight = 1.0
): Constraint {
  return {
    id,
    type: 'symmetry',
    elements: elementIds,
    weight,
    evaluate: (elements, grid) => {
      if (elementIds.length < 2) return 1;
      const positioned = elementIds.map(id => elements.get(id)).filter(e => e?.position);
      if (positioned.length < 2) return 1;

      const center = axis === 'vertical'
        ? grid.dimensions.columns / 2
        : grid.dimensions.rows / 2;

      let totalScore = 0;
      let pairs = 0;

      for (let i = 0; i < positioned.length; i++) {
        for (let j = i + 1; j < positioned.length; j++) {
          const p1 = positioned[i]!.position!;
          const p2 = positioned[j]!.position!;
          if (axis === 'vertical') {
            const c1 = (p1.columnStart + p1.columnEnd) / 2;
            const c2 = (p2.columnStart + p2.columnEnd) / 2;
            const dist1 = Math.abs(c1 - center);
            const dist2 = Math.abs(c2 - center);
            const maxDist = Math.max(dist1, dist2, 1);
            totalScore += 1 - Math.abs(dist1 - dist2) / maxDist;
          } else {
            const c1 = (p1.rowStart + p1.rowEnd) / 2;
            const c2 = (p2.rowStart + p2.rowEnd) / 2;
            const dist1 = Math.abs(c1 - center);
            const dist2 = Math.abs(c2 - center);
            const maxDist = Math.max(dist1, dist2, 1);
            totalScore += 1 - Math.abs(dist1 - dist2) / maxDist;
          }
          pairs++;
        }
      }

      return pairs > 0 ? totalScore / pairs : 1;
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

interface Position {
  rowStart: number;
  rowEnd: number;
  columnStart: number;
  columnEnd: number;
}

function areAdjacent(p1: Position, p2: Position): boolean {
  const horizontalAdj =
    (p1.columnEnd === p2.columnStart || p2.columnEnd === p1.columnStart) &&
    p1.rowStart < p2.rowEnd &&
    p2.rowStart < p1.rowEnd;

  const verticalAdj =
    (p1.rowEnd === p2.rowStart || p2.rowEnd === p1.rowStart) &&
    p1.columnStart < p2.columnEnd &&
    p2.columnStart < p1.columnEnd;

  return horizontalAdj || verticalAdj;
}

function getElementAreaValue(el: LayoutElement): number {
  if (!el.position) return 0;
  const width = el.position.columnEnd - el.position.columnStart;
  const height = el.position.rowEnd - el.position.rowStart;
  return width * height;
}