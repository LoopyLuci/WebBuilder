// ============================================================================
// Layout Generation Types
// Type definitions for constraint-based layout generation
// ============================================================================

export interface GridCell {
  row: number;
  column: number;
  occupied: boolean;
  elementId: string | null;
}

export interface GridDimensions {
  rows: number;
  columns: number;
}

export interface GridSystem {
  dimensions: GridDimensions;
  cells: GridCell[][];
  gutter: number;
  margin: number;
  maxWidth: number;
}

export interface LayoutElement {
  id: string;
  type: ElementType;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  priority: number; // 1-10, higher = more important
  aspectRatio?: number;
  position?: GridPosition;
  styles: ElementStyles;
}

export type ElementType =
  | 'hero'
  | 'features'
  | 'cta'
  | 'testimonials'
  | 'pricing'
  | 'stats'
  | 'faq'
  | 'content'
  | 'gallery'
  | 'form'
  | 'footer'
  | 'header'
  | 'sidebar'
  | 'card'
  | 'image'
  | 'text'
  | 'button';

export interface GridPosition {
  rowStart: number;
  rowEnd: number;
  columnStart: number;
  columnEnd: number;
}

export interface ElementStyles {
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  borderRadius?: string;
}

export interface Constraint {
  id: string;
  type: ConstraintType;
  elements: string[];
  weight: number;
  evaluate: (elements: Map<string, LayoutElement>, grid: GridSystem) => number;
}

export type ConstraintType =
  | 'adjacency'
  | 'alignment'
  | 'spacing'
  | 'proportion'
  | 'hierarchy'
  | 'balance'
  | 'sequence'
  | 'containment'
  | 'symmetry';

export interface ConstraintSatisfactionResult {
  satisfied: boolean;
  violations: ConstraintViolation[];
  score: number;
  iterations: number;
}

export interface ConstraintViolation {
  constraintId: string;
  severity: number;
  message: string;
  elements: string[];
}

export interface FitnessScore {
  total: number;
  hierarchy: number;
  balance: number;
  rhythm: number;
  proportion: number;
  alignment: number;
  spacing: number;
  whitespace: number;
  harmony: number;
}

export interface GeneticLayout {
  id: string;
  elements: Map<string, LayoutElement>;
  grid: GridSystem;
  fitness: FitnessScore;
  generation: number;
}

export interface GeneticAlgorithmConfig {
  populationSize: number;
  maxGenerations: number;
  mutationRate: number;
  crossoverRate: number;
  elitismCount: number;
  tournamentSize: number;
  convergenceThreshold: number;
  stagnationLimit: number;
}

export interface GeneticResult {
  bestLayout: GeneticLayout;
  history: GenerationStats[];
  totalGenerations: number;
  finalScore: number;
  duration: number;
}

export interface GenerationStats {
  generation: number;
  bestFitness: number;
  averageFitness: number;
  worstFitness: number;
  diversity: number;
}

export interface MutationOperator {
  name: string;
  mutate: (layout: GeneticLayout, prng: PRNGLike) => GeneticLayout;
}

export interface CrossoverOperator {
  name: string;
  crossover: (parent1: GeneticLayout, parent2: GeneticLayout, prng: PRNGLike) => GeneticLayout;
}

export interface PRNGLike {
  next(): number;
  range(min: number, max: number): number;
  int(min: number, max: number): number;
  bool(probability?: number): boolean;
  pick<T>(arr: T[]): T;
  shuffle<T>(arr: T[]): T[];
}

export interface LayoutScoreWeights {
  hierarchy: number;
  balance: number;
  rhythm: number;
  proportion: number;
  alignment: number;
  spacing: number;
  whitespace: number;
  harmony: number;
}

export const DEFAULT_SCORE_WEIGHTS: LayoutScoreWeights = {
  hierarchy: 0.20,
  balance: 0.18,
  rhythm: 0.12,
  proportion: 0.15,
  alignment: 0.10,
  spacing: 0.10,
  whitespace: 0.08,
  harmony: 0.07,
};

export const DEFAULT_GENETIC_CONFIG: GeneticAlgorithmConfig = {
  populationSize: 50,
  maxGenerations: 100,
  mutationRate: 0.15,
  crossoverRate: 0.8,
  elitismCount: 3,
  tournamentSize: 5,
  convergenceThreshold: 0.95,
  stagnationLimit: 20,
};