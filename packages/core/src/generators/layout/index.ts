// ============================================================================
// Layout Generator - Main Entry Point
// Constraint Satisfaction + Genetic Algorithm Layout Generation System
// ============================================================================

export * from './types.js';
export * from './grid-system.js';
export * from './constraint-solver.js';
export * from './fitness.js';
export * from './genetic-operators.js';
export * from './genetic-engine.js';
export * from './scoring.js';

import { PRNG } from '../prng.js';
import {
  GridSystem,
  LayoutElement,
  GeneticAlgorithmConfig,
  LayoutScoreWeights,
  GeneticResult,
  FitnessScore,
  ElementType,
} from './types.js';
import { createGrid, placeElement, findAvailablePosition } from './grid-system.js';
import { ConstraintSolver } from './constraint-solver.js';
import {
  createAdjacencyConstraint,
  createAlignmentConstraint,
  createSpacingConstraint,
  createHierarchyConstraint,
  createBalanceConstraint,
} from './constraint-solver.js';
import { calculateFitness } from './fitness.js';
import { GeneticAlgorithmEngine, generateOptimalLayout } from './genetic-engine.js';
import { analyzeLayout, gradeLayout, LayoutAnalysis } from './scoring.js';

export interface LayoutGeneratorConfig {
  rows: number;
  columns: number;
  seed: string;
  geneticConfig?: Partial<GeneticAlgorithmConfig>;
  weights?: LayoutScoreWeights;
}

export interface LayoutGeneratorResult {
  grid: GridSystem;
  elements: Map<string, LayoutElement>;
  fitness: FitnessScore;
  analysis: LayoutAnalysis;
  geneticResult: GeneticResult;
}

/**
 * Main Layout Generator class
 * Combines constraint satisfaction with genetic algorithm optimization
 */
export class LayoutGenerator {
  private config: LayoutGeneratorConfig;
  private prng: PRNG;
  private solver: ConstraintSolver;

  constructor(config: LayoutGeneratorConfig) {
    this.config = config;
    this.prng = new PRNG(config.seed);
    this.solver = new ConstraintSolver();
  }

  /**
   * Generate an optimized layout from elements
   */
  generate(elements: LayoutElement[]): LayoutGeneratorResult {
    // Create grid
    const grid = createGrid(this.config.rows, this.config.columns);

    // Add default constraints
    this.addDefaultConstraints(elements);

    // Run genetic algorithm
    const geneticResult = generateOptimalLayout(
      elements,
      grid,
      this.config.seed,
      this.config.geneticConfig,
      this.config.weights
    );

    // Calculate final fitness
    const fitness = calculateFitness(
      geneticResult.bestLayout.elements,
      geneticResult.bestLayout.grid,
      this.config.weights
    );

    // Analyze result
    const analysis = analyzeLayout(
      geneticResult.bestLayout.elements,
      geneticResult.bestLayout.grid,
      fitness
    );

    return {
      grid: geneticResult.bestLayout.grid,
      elements: geneticResult.bestLayout.elements,
      fitness,
      analysis,
      geneticResult,
    };
  }

  /**
   * Add a custom constraint
   */
  addConstraint(constraint: Parameters<ConstraintSolver['addConstraint']>[0]): void {
    this.solver.addConstraint(constraint);
  }

  /**
   * Get the constraint solver
   */
  getSolver(): ConstraintSolver {
    return this.solver;
  }

  /**
   * Add default constraints for layout quality
   */
  private addDefaultConstraints(elements: LayoutElement[]): void {
    // Hierarchy constraint
    this.solver.addConstraint(
      createHierarchyConstraint('hierarchy-default', 1.5)
    );

    // Balance constraint
    this.solver.addConstraint(
      createBalanceConstraint('balance-default', 1.2)
    );

    // Alignment constraint for all elements
    const elementIds = elements.map(e => e.id);
    this.solver.addConstraint(
      createAlignmentConstraint('alignment-default', elementIds, 'both', 1.0)
    );

    // Spacing constraint
    this.solver.addConstraint(
      createSpacingConstraint('spacing-default', elementIds, 1, 0.8)
    );
  }
}

/**
 * Quick layout generation with sensible defaults
 */
export function generateLayout(
  elementTypes: ElementType[],
  rows: number = 8,
  columns: number = 12,
  seed: string = 'layout'
): LayoutGeneratorResult {
  const elements = createElementsFromTypes(elementTypes, seed);
  const generator = new LayoutGenerator({
    rows,
    columns,
    seed,
  });
  return generator.generate(elements);
}

/**
 * Create layout elements from type specifications
 */
export function createElementsFromTypes(types: ElementType[], seed: string): LayoutElement[] {
  const prng = new PRNG(seed);
  const elementConfig: Record<ElementType, Partial<LayoutElement>> = {
    hero: { minWidth: 6, maxWidth: 12, minHeight: 3, maxHeight: 5, priority: 10 },
    features: { minWidth: 4, maxWidth: 12, minHeight: 2, maxHeight: 4, priority: 7 },
    cta: { minWidth: 4, maxWidth: 8, minHeight: 2, maxHeight: 3, priority: 8 },
    testimonials: { minWidth: 4, maxWidth: 8, minHeight: 2, maxHeight: 3, priority: 6 },
    pricing: { minWidth: 6, maxWidth: 12, minHeight: 3, maxHeight: 5, priority: 7 },
    stats: { minWidth: 3, maxWidth: 6, minHeight: 1, maxHeight: 2, priority: 5 },
    faq: { minWidth: 4, maxWidth: 8, minHeight: 2, maxHeight: 4, priority: 6 },
    content: { minWidth: 4, maxWidth: 8, minHeight: 2, maxHeight: 4, priority: 7 },
    gallery: { minWidth: 4, maxWidth: 12, minHeight: 2, maxHeight: 4, priority: 6 },
    form: { minWidth: 4, maxWidth: 8, minHeight: 3, maxHeight: 5, priority: 7 },
    footer: { minWidth: 8, maxWidth: 12, minHeight: 2, maxHeight: 3, priority: 3 },
    header: { minWidth: 8, maxWidth: 12, minHeight: 1, maxHeight: 2, priority: 9 },
    sidebar: { minWidth: 2, maxWidth: 4, minHeight: 4, maxHeight: 8, priority: 5 },
    card: { minWidth: 2, maxWidth: 4, minHeight: 2, maxHeight: 3, priority: 5 },
    image: { minWidth: 2, maxWidth: 6, minHeight: 2, maxHeight: 4, priority: 4 },
    text: { minWidth: 2, maxWidth: 6, minHeight: 1, maxHeight: 3, priority: 5 },
    button: { minWidth: 1, maxWidth: 3, minHeight: 1, maxHeight: 1, priority: 6 },
  };

  return types.map((type, i) => {
    const config = elementConfig[type] || elementConfig.content;
    return {
      id: `${type}-${i}`,
      type,
      minWidth: config.minWidth!,
      maxWidth: config.maxWidth!,
      minHeight: config.minHeight!,
      maxHeight: config.maxHeight!,
      priority: config.priority!,
      styles: {
        padding: `${prng.range(0.5, 2)}rem`,
        backgroundColor: prng.bool(0.3) ? `var(--color-neutral-${prng.int(1, 4)}00)` : 'transparent',
      },
    };
  });
}