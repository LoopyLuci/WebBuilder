// ============================================================================
// Genetic Algorithm Engine
// Main evolutionary algorithm for layout optimization
// ============================================================================

import { PRNG } from '../prng.js';
import {
  GeneticLayout,
  GridSystem,
  LayoutElement,
  GeneticAlgorithmConfig,
  GeneticResult,
  GenerationStats,
  DEFAULT_GENETIC_CONFIG,
  LayoutScoreWeights,
  DEFAULT_SCORE_WEIGHTS,
} from './types.js';
import { createGrid, placeElement, findAvailablePosition, cloneGrid } from './grid-system.js';
import { calculateFitness } from './fitness.js';
import {
  MUTATION_OPERATORS,
  CROSSOVER_OPERATORS,
  positionMutation,
  sizeMutation,
  swapMutation,
} from './genetic-operators.js';

/**
 * Genetic Algorithm Engine for layout generation
 * Evolves layouts over generations using selection, crossover, and mutation
 */
export class GeneticAlgorithmEngine {
  private config: GeneticAlgorithmConfig;
  private weights: LayoutScoreWeights;
  private prng: PRNG;
  private population: GeneticLayout[] = [];
  private generation = 0;
  private bestEver: GeneticLayout | null = null;
  private stagnationCounter = 0;
  private history: GenerationStats[] = [];

  constructor(
    seed: string | number,
    config: Partial<GeneticAlgorithmConfig> = {},
    weights: Partial<LayoutScoreWeights> = {}
  ) {
    this.prng = new PRNG(seed);
    this.config = { ...DEFAULT_GENETIC_CONFIG, ...config };
    this.weights = { ...DEFAULT_SCORE_WEIGHTS, ...weights };
  }

  /**
   * Initialize the population with random layouts
   */
  initialize(elements: LayoutElement[], grid: GridSystem): void {
    this.population = [];
    this.generation = 0;
    this.bestEver = null;
    this.stagnationCounter = 0;
    this.history = [];

    for (let i = 0; i < this.config.populationSize; i++) {
      const layout = this.createRandomLayout(elements, grid, i);
      this.population.push(layout);
    }

    // Evaluate initial population
    this.evaluatePopulation();
  }

  /**
   * Run the genetic algorithm for the specified number of generations
   */
  run(elements: LayoutElement[], grid: GridSystem): GeneticResult {
    const startTime = Date.now();

    // Initialize if not already done
    if (this.population.length === 0) {
      this.initialize(elements, grid);
    }

    while (this.generation < this.config.maxGenerations) {
      // Check convergence
      if (this.hasConverged()) {
        break;
      }

      // Evolve one generation
      this.evolve();
    }

    const duration = Date.now() - startTime;

    return {
      bestLayout: this.bestEver!,
      history: this.history,
      totalGenerations: this.generation,
      finalScore: this.bestEver?.fitness.total ?? 0,
      duration,
    };
  }

  /**
   * Evolve one generation
   */
  evolve(): void {
    const newPopulation: GeneticLayout[] = [];

    // Elitism: keep the best individuals
    const sorted = [...this.population].sort((a, b) => b.fitness.total - a.fitness.total);
    for (let i = 0; i < this.config.elitismCount && i < sorted.length; i++) {
      newPopulation.push(sorted[i]);
    }

    // Generate offspring to fill the rest of the population
    while (newPopulation.length < this.config.populationSize) {
      // Selection
      const parent1 = this.tournamentSelection();
      const parent2 = this.tournamentSelection();

      let offspring: GeneticLayout;

      // Crossover
      if (this.prng.next() < this.config.crossoverRate) {
        const crossoverOp = this.prng.pick(CROSSOVER_OPERATORS);
        offspring = crossoverOp.crossover(parent1, parent2, this.prng);
      } else {
        offspring = this.cloneLayout(parent1);
      }

      // Mutation
      if (this.prng.next() < this.config.mutationRate) {
        const mutationOp = this.prng.pick(MUTATION_OPERATORS);
        offspring = mutationOp.mutate(offspring, this.prng);
      }

      offspring.generation = this.generation + 1;
      newPopulation.push(offspring);
    }

    this.population = newPopulation;
    this.generation++;
    this.evaluatePopulation();
    this.recordStats();
  }

  /**
   * Get the current best layout
   */
  getBestLayout(): GeneticLayout | null {
    return this.bestEver;
  }

  /**
   * Get the current population
   */
  getPopulation(): GeneticLayout[] {
    return [...this.population];
  }

  /**
   * Get the current generation number
   */
  getGeneration(): number {
    return this.generation;
  }

  /**
   * Get the evolution history
   */
  getHistory(): GenerationStats[] {
    return [...this.history];
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Create a random layout for initial population
   */
  private createRandomLayout(elements: LayoutElement[], grid: GridSystem, index: number): GeneticLayout {
    const newGrid = cloneGrid(grid);
    const newElements = new Map<string, LayoutElement>();

    // Reset grid
    for (let r = 0; r < newGrid.dimensions.rows; r++) {
      for (let c = 0; c < newGrid.dimensions.columns; c++) {
        newGrid.cells[r][c].occupied = false;
        newGrid.cells[r][c].elementId = null;
      }
    }

    // Shuffle element order for variety
    const shuffled = this.prng.shuffle([...elements]);

    for (const el of shuffled) {
      const newEl: LayoutElement = {
        ...el,
        position: undefined,
        styles: { ...el.styles },
      };

      // Try to place with random size within constraints
      const minW = Math.max(1, Math.floor(el.minWidth));
      const maxW = Math.min(newGrid.dimensions.columns, Math.ceil(el.maxWidth));
      const minH = Math.max(1, Math.floor(el.minHeight));
      const maxH = Math.min(newGrid.dimensions.rows, Math.ceil(el.maxHeight));

      const width = this.prng.int(minW, maxW);
      const height = this.prng.int(minH, maxH);

      const position = findAvailablePosition(newGrid, width, height);
      if (position) {
        placeElement(newGrid, newEl, position);
      }

      newElements.set(el.id, newEl);
    }

    const layout: GeneticLayout = {
      id: `layout_${index}`,
      elements: newElements,
      grid: newGrid,
      fitness: { total: 0, hierarchy: 0, balance: 0, rhythm: 0, proportion: 0, alignment: 0, spacing: 0, whitespace: 0, harmony: 0 },
      generation: 0,
    };

    // Evaluate fitness
    layout.fitness = calculateFitness(newElements, newGrid, this.weights);

    return layout;
  }

  /**
   * Evaluate fitness for the entire population
   */
  private evaluatePopulation(): void {
    for (const layout of this.population) {
      layout.fitness = calculateFitness(layout.elements, layout.grid, this.weights);
    }

    // Update best ever
    const currentBest = this.population.reduce((best, layout) =>
      layout.fitness.total > best.fitness.total ? layout : best
    );

    if (!this.bestEver || currentBest.fitness.total > this.bestEver.fitness.total) {
      this.bestEver = this.cloneLayout(currentBest);
      this.stagnationCounter = 0;
    } else {
      this.stagnationCounter++;
    }
  }

  /**
   * Tournament selection
   */
  private tournamentSelection(): GeneticLayout {
    let best: GeneticLayout | null = null;

    for (let i = 0; i < this.config.tournamentSize; i++) {
      const candidate = this.prng.pick(this.population);
      if (!best || candidate.fitness.total > best.fitness.total) {
        best = candidate;
      }
    }

    return best!;
  }

  /**
   * Check if the algorithm has converged
   */
  private hasConverged(): boolean {
    // Check stagnation
    if (this.stagnationCounter >= this.config.stagnationLimit) {
      return true;
    }

    // Check fitness threshold
    if (this.bestEver && this.bestEver.fitness.total >= this.config.convergenceThreshold) {
      return true;
    }

    // Check population diversity
    const diversity = this.calculateDiversity();
    if (diversity < 0.05) {
      return true;
    }

    return false;
  }

  /**
   * Calculate population diversity (0-1)
   */
  private calculateDiversity(): number {
    if (this.population.length < 2) return 0;

    const fitnesses = this.population.map(p => p.fitness.total);
    const avg = fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length;
    const variance = fitnesses.reduce((sum, f) => sum + Math.pow(f - avg, 2), 0) / fitnesses.length;
    const stdDev = Math.sqrt(variance);

    return Math.min(1, stdDev * 4); // Normalize
  }

  /**
   * Record generation statistics
   */
  private recordStats(): void {
    const fitnesses = this.population.map(p => p.fitness.total);
    const stats: GenerationStats = {
      generation: this.generation,
      bestFitness: Math.max(...fitnesses),
      averageFitness: fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length,
      worstFitness: Math.min(...fitnesses),
      diversity: this.calculateDiversity(),
    };
    this.history.push(stats);
  }

  /**
   * Clone a layout
   */
  private cloneLayout(layout: GeneticLayout): GeneticLayout {
    const newElements = new Map<string, LayoutElement>();
    for (const [id, el] of layout.elements) {
      newElements.set(id, {
        ...el,
        position: el.position ? { ...el.position } : undefined,
        styles: { ...el.styles },
      });
    }

    return {
      id: layout.id + '_clone',
      elements: newElements,
      grid: cloneGrid(layout.grid),
      fitness: { ...layout.fitness },
      generation: layout.generation,
    };
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Generate an optimized layout using genetic algorithm
 */
export function generateOptimalLayout(
  elements: LayoutElement[],
  grid: GridSystem,
  seed: string | number = 'layout',
  config: Partial<GeneticAlgorithmConfig> = {},
  weights: Partial<LayoutScoreWeights> = {}
): GeneticResult {
  const engine = new GeneticAlgorithmEngine(seed, config, weights);
  engine.initialize(elements, grid);
  return engine.run(elements, grid);
}

/**
 * Quick layout generation with default settings
 */
export function quickLayout(
  elements: LayoutElement[],
  rows: number,
  columns: number,
  seed: string = 'quick'
): GeneticLayout {
  const grid = createGrid(rows, columns);
  const engine = new GeneticAlgorithmEngine(seed, {
    populationSize: 30,
    maxGenerations: 50,
  });
  engine.initialize(elements, grid);
  const result = engine.run(elements, grid);
  return result.bestLayout;
}