// ============================================================================
// Genetic Algorithm Operators
// Mutation and Crossover operations for layout evolution
// ============================================================================

import { PRNG } from '../prng.js';
import {
  GeneticLayout,
  GridSystem,
  LayoutElement,
  GridPosition,
  GeneticAlgorithmConfig,
  PRNGLike,
  MutationOperator,
  CrossoverOperator,
} from './types.js';
import { createGrid, placeElement, removeElement, findAvailablePosition, cloneGrid } from './grid-system.js';

// ============================================================================
// Mutation Operators
// ============================================================================

/**
 * Position Mutation - Move an element to a new position
 */
export const positionMutation: MutationOperator = {
  name: 'position',
  mutate: (layout: GeneticLayout, prng: PRNGLike): GeneticLayout => {
    const newLayout = cloneGeneticLayout(layout);
    const elementIds = [...newLayout.elements.keys()];
    if (elementIds.length === 0) return newLayout;

    const targetId = prng.pick(elementIds);
    const element = newLayout.elements.get(targetId)!;

    // Remove from current position
    removeElement(newLayout.grid, targetId);

    // Find new position
    const minW = Math.max(1, Math.floor(element.minWidth));
    const maxW = Math.min(newLayout.grid.dimensions.columns, Math.ceil(element.maxWidth));
    const minH = Math.max(1, Math.floor(element.minHeight));
    const maxH = Math.min(newLayout.grid.dimensions.rows, Math.ceil(element.maxHeight));

    const width = prng.int(minW, maxW);
    const height = prng.int(minH, maxH);

    const position = findAvailablePosition(newLayout.grid, width, height);
    if (position) {
      placeElement(newLayout.grid, element, position);
    } else {
      // Try to place at original position or any available spot
      const fallback = findAvailablePosition(newLayout.grid, minW, minH);
      if (fallback) {
        placeElement(newLayout.grid, element, fallback);
      }
    }

    return newLayout;
  },
};

/**
 * Size Mutation - Change the dimensions of an element
 */
export const sizeMutation: MutationOperator = {
  name: 'size',
  mutate: (layout: GeneticLayout, prng: PRNGLike): GeneticLayout => {
    const newLayout = cloneGeneticLayout(layout);
    const elementIds = [...newLayout.elements.keys()];
    if (elementIds.length === 0) return newLayout;

    const targetId = prng.pick(elementIds);
    const element = newLayout.elements.get(targetId)!;

    removeElement(newLayout.grid, targetId);

    // Vary size by ±20%
    const currentWidth = element.position
      ? element.position.columnEnd - element.position.columnStart
      : (element.minWidth + element.maxWidth) / 2;
    const currentHeight = element.position
      ? element.position.rowEnd - element.position.rowStart
      : (element.minHeight + element.maxHeight) / 2;

    const widthVariation = prng.range(0.8, 1.2);
    const heightVariation = prng.range(0.8, 1.2);

    const newWidth = clamp(
      Math.round(currentWidth * widthVariation),
      Math.max(1, Math.floor(element.minWidth)),
      Math.min(newLayout.grid.dimensions.columns, Math.ceil(element.maxWidth))
    );
    const newHeight = clamp(
      Math.round(currentHeight * heightVariation),
      Math.max(1, Math.floor(element.minHeight)),
      Math.min(newLayout.grid.dimensions.rows, Math.ceil(element.maxHeight))
    );

    const position = findAvailablePosition(newLayout.grid, newWidth, newHeight);
    if (position) {
      placeElement(newLayout.grid, element, position);
    } else {
      // Restore with original constraints
      const fallback = findAvailablePosition(
        newLayout.grid,
        Math.max(1, Math.floor(element.minWidth)),
        Math.max(1, Math.floor(element.minHeight))
      );
      if (fallback) {
        placeElement(newLayout.grid, element, fallback);
      }
    }

    return newLayout;
  },
};

/**
 * Swap Mutation - Swap positions of two elements
 */
export const swapMutation: MutationOperator = {
  name: 'swap',
  mutate: (layout: GeneticLayout, prng: PRNGLike): GeneticLayout => {
    const newLayout = cloneGeneticLayout(layout);
    const elementIds = [...newLayout.elements.keys()];
    if (elementIds.length < 2) return newLayout;

    const idx1 = prng.int(0, elementIds.length - 1);
    let idx2 = prng.int(0, elementIds.length - 1);
    while (idx2 === idx1) {
      idx2 = prng.int(0, elementIds.length - 1);
    }

    const id1 = elementIds[idx1];
    const id2 = elementIds[idx2];
    const el1 = newLayout.elements.get(id1)!;
    const el2 = newLayout.elements.get(id2)!;

    const pos1 = el1.position ? { ...el1.position } : null;
    const pos2 = el2.position ? { ...el2.position } : null;

    removeElement(newLayout.grid, id1);
    removeElement(newLayout.grid, id2);

    if (pos2) {
      const canPlace1 = canFit(newLayout.grid, pos2, el1);
      if (canPlace1) {
        placeElement(newLayout.grid, el1, pos2);
      }
    }
    if (pos1) {
      const canPlace2 = canFit(newLayout.grid, pos1, el2);
      if (canPlace2) {
        placeElement(newLayout.grid, el2, pos1);
      }
    }

    return newLayout;
  },
};

/**
 * Grow Mutation - Expand an element's size
 */
export const growMutation: MutationOperator = {
  name: 'grow',
  mutate: (layout: GeneticLayout, prng: PRNGLike): GeneticLayout => {
    const newLayout = cloneGeneticLayout(layout);
    const elementIds = [...newLayout.elements.keys()];
    if (elementIds.length === 0) return newLayout;

    // Prefer higher priority elements
    const sorted = elementIds.sort(
      (a, b) => newLayout.elements.get(b)!.priority - newLayout.elements.get(a)!.priority
    );
    const targetId = prng.next() < 0.6 ? sorted[0] : prng.pick(elementIds);
    const element = newLayout.elements.get(targetId)!;

    if (!element.position) return newLayout;

    removeElement(newLayout.grid, targetId);

    const growDir = prng.pick(['right', 'down', 'both'] as const);
    const pos = { ...element.position };

    if (growDir === 'right' || growDir === 'both') {
      pos.columnEnd = Math.min(pos.columnEnd + 1, newLayout.grid.dimensions.columns);
    }
    if (growDir === 'down' || growDir === 'both') {
      pos.rowEnd = Math.min(pos.rowEnd + 1, newLayout.grid.dimensions.rows);
    }

    // Check if new size is valid
    if (
      pos.columnEnd - pos.columnStart <= element.maxWidth &&
      pos.rowEnd - pos.rowStart <= element.maxHeight
    ) {
      const canPlace = isAreaFree(newLayout.grid, pos, targetId);
      if (canPlace) {
        placeElement(newLayout.grid, element, pos);
        return newLayout;
      }
    }

    // Restore original position
    placeElement(newLayout.grid, element, element.position);
    return newLayout;
  },
};

/**
 * Shrink Mutation - Reduce an element's size
 */
export const shrinkMutation: MutationOperator = {
  name: 'shrink',
  mutate: (layout: GeneticLayout, prng: PRNGLike): GeneticLayout => {
    const newLayout = cloneGeneticLayout(layout);
    const elementIds = [...newLayout.elements.keys()];
    if (elementIds.length === 0) return newLayout;

    const targetId = prng.pick(elementIds);
    const element = newLayout.elements.get(targetId)!;

    if (!element.position) return newLayout;

    const pos = { ...element.position };
    const currentW = pos.columnEnd - pos.columnStart;
    const currentH = pos.rowEnd - pos.rowStart;

    if (currentW <= element.minWidth && currentH <= element.minHeight) {
      return newLayout;
    }

    removeElement(newLayout.grid, targetId);

    const shrinkDir = prng.pick(['left', 'up', 'both'] as const);

    if (shrinkDir === 'left' || shrinkDir === 'both') {
      pos.columnStart = Math.min(pos.columnStart + 1, pos.columnEnd - Math.ceil(element.minWidth));
    }
    if (shrinkDir === 'up' || shrinkDir === 'both') {
      pos.rowStart = Math.min(pos.rowStart + 1, pos.rowEnd - Math.ceil(element.minHeight));
    }

    if (
      pos.columnEnd - pos.columnStart >= element.minWidth &&
      pos.rowEnd - pos.rowStart >= element.minHeight &&
      pos.columnStart >= 0 &&
      pos.rowStart >= 0
    ) {
      placeElement(newLayout.grid, element, pos);
    } else {
      // Restore
      placeElement(newLayout.grid, element, element.position);
    }

    return newLayout;
  },
};

// ============================================================================
// Crossover Operators
// ============================================================================

/**
 * Single-Point Crossover - Split grid and combine halves from parents
 */
export const singlePointCrossover: CrossoverOperator = {
  name: 'single-point',
  crossover: (parent1: GeneticLayout, parent2: GeneticLayout, prng: PRNGLike): GeneticLayout => {
    const grid = cloneGrid(parent1.grid);
    const elements = new Map<string, LayoutElement>();

    const splitAxis = prng.pick(['horizontal', 'vertical'] as const);
    const splitPoint =
      splitAxis === 'horizontal'
        ? prng.int(1, grid.dimensions.rows - 1)
        : prng.int(1, grid.dimensions.columns - 1);

    // Reset grid cells
    for (let r = 0; r < grid.dimensions.rows; r++) {
      for (let c = 0; c < grid.dimensions.columns; c++) {
        grid.cells[r][c].occupied = false;
        grid.cells[r][c].elementId = null;
      }
    }

    // Place elements based on which side of split they belong to
    for (const [id, el] of parent1.elements) {
      const p2El = parent2.elements.get(id);
      if (!p2El) continue;

      const p1Center = getElCenter(el);
      const p2Center = getElCenter(p2El);

      let useParent1: boolean;
      if (splitAxis === 'horizontal') {
        useParent1 = p1Center.y < splitPoint;
      } else {
        useParent1 = p1Center.x < splitPoint;
      }

      const sourceEl = useParent1 ? el : p2El;
      const newEl = cloneElement(sourceEl);
      elements.set(id, newEl);

      if (newEl.position) {
        if (canPlaceAt(grid, newEl.position)) {
          placeElement(grid, newEl, newEl.position);
        } else {
          // Find nearby position
          const fallback = findNearbyPosition(grid, newEl.position, prng);
          if (fallback) {
            placeElement(grid, newEl, fallback);
          }
        }
      }
    }

    return {
      id: prng.int(0, 1000000).toString(),
      elements,
      grid,
      fitness: { total: 0, hierarchy: 0, balance: 0, rhythm: 0, proportion: 0, alignment: 0, spacing: 0, whitespace: 0, harmony: 0 },
      generation: Math.max(parent1.generation, parent2.generation) + 1,
    };
  },
};

/**
 * Uniform Crossover - Randomly pick positions from either parent
 */
export const uniformCrossover: CrossoverOperator = {
  name: 'uniform',
  crossover: (parent1: GeneticLayout, parent2: GeneticLayout, prng: PRNGLike): GeneticLayout => {
    const grid = cloneGrid(parent1.grid);
    const elements = new Map<string, LayoutElement>();

    // Reset grid cells
    for (let r = 0; r < grid.dimensions.rows; r++) {
      for (let c = 0; c < grid.dimensions.columns; c++) {
        grid.cells[r][c].occupied = false;
        grid.cells[r][c].elementId = null;
      }
    }

    for (const [id, el] of parent1.elements) {
      const p2El = parent2.elements.get(id);
      if (!p2El) continue;

      const useParent1 = prng.bool(0.5);
      const sourceEl = useParent1 ? el : p2El;
      const newEl = cloneElement(sourceEl);
      elements.set(id, newEl);

      if (newEl.position) {
        if (canPlaceAt(grid, newEl.position)) {
          placeElement(grid, newEl, newEl.position);
        } else {
          const fallback = findNearbyPosition(grid, newEl.position, prng);
          if (fallback) {
            placeElement(grid, newEl, fallback);
          }
        }
      }
    }

    return {
      id: prng.int(0, 1000000).toString(),
      elements,
      grid,
      fitness: { total: 0, hierarchy: 0, balance: 0, rhythm: 0, proportion: 0, alignment: 0, spacing: 0, whitespace: 0, harmony: 0 },
      generation: Math.max(parent1.generation, parent2.generation) + 1,
    };
  },
};

/**
 * Area Crossover - Divide grid into quadrants and combine from parents
 */
export const areaCrossover: CrossoverOperator = {
  name: 'area',
  crossover: (parent1: GeneticLayout, parent2: GeneticLayout, prng: PRNGLike): GeneticLayout => {
    const grid = cloneGrid(parent1.grid);
    const elements = new Map<string, LayoutElement>();

    const midRow = Math.floor(grid.dimensions.rows / 2);
    const midCol = Math.floor(grid.dimensions.columns / 2);

    // Reset grid cells
    for (let r = 0; r < grid.dimensions.rows; r++) {
      for (let c = 0; c < grid.dimensions.columns; c++) {
        grid.cells[r][c].occupied = false;
        grid.cells[r][c].elementId = null;
      }
    }

    for (const [id, el] of parent1.elements) {
      const p2El = parent2.elements.get(id);
      if (!p2El) continue;

      const center = getElCenter(el);
      const quadrant =
        center.y < midRow
          ? center.x < midCol
            ? 'tl'
            : 'tr'
          : center.x < midCol
          ? 'bl'
          : 'br';

      // Alternate which parent contributes each quadrant
      const useParent1 = ['tl', 'br'].includes(quadrant) ? prng.bool(0.7) : prng.bool(0.3);
      const sourceEl = useParent1 ? el : p2El;
      const newEl = cloneElement(sourceEl);
      elements.set(id, newEl);

      if (newEl.position) {
        if (canPlaceAt(grid, newEl.position)) {
          placeElement(grid, newEl, newEl.position);
        } else {
          const fallback = findNearbyPosition(grid, newEl.position, prng);
          if (fallback) {
            placeElement(grid, newEl, fallback);
          }
        }
      }
    }

    return {
      id: prng.int(0, 1000000).toString(),
      elements,
      grid,
      fitness: { total: 0, hierarchy: 0, balance: 0, rhythm: 0, proportion: 0, alignment: 0, spacing: 0, whitespace: 0, harmony: 0 },
      generation: Math.max(parent1.generation, parent2.generation) + 1,
    };
  },
};

/**
 * Blend Crossover - Interpolate between parent positions
 */
export const blendCrossover: CrossoverOperator = {
  name: 'blend',
  crossover: (parent1: GeneticLayout, parent2: GeneticLayout, prng: PRNGLike): GeneticLayout => {
    const grid = cloneGrid(parent1.grid);
    const elements = new Map<string, LayoutElement>();

    // Reset grid cells
    for (let r = 0; r < grid.dimensions.rows; r++) {
      for (let c = 0; c < grid.dimensions.columns; c++) {
        grid.cells[r][c].occupied = false;
        grid.cells[r][c].elementId = null;
      }
    }

    for (const [id, el] of parent1.elements) {
      const p2El = parent2.elements.get(id);
      if (!p2El) continue;

      const newEl = cloneElement(el);
      elements.set(id, newEl);

      if (el.position && p2El.position) {
        const alpha = prng.range(0.3, 0.7);
        const blendedPos: GridPosition = {
          rowStart: Math.round(el.position.rowStart * alpha + p2El.position.rowStart * (1 - alpha)),
          rowEnd: Math.round(el.position.rowEnd * alpha + p2El.position.rowEnd * (1 - alpha)),
          columnStart: Math.round(el.position.columnStart * alpha + p2El.position.columnStart * (1 - alpha)),
          columnEnd: Math.round(el.position.columnEnd * alpha + p2El.position.columnEnd * (1 - alpha)),
        };

        // Ensure valid position
        blendedPos.rowStart = Math.max(0, Math.min(blendedPos.rowStart, grid.dimensions.rows - 1));
        blendedPos.rowEnd = Math.max(blendedPos.rowStart + 1, Math.min(blendedPos.rowEnd, grid.dimensions.rows));
        blendedPos.columnStart = Math.max(0, Math.min(blendedPos.columnStart, grid.dimensions.columns - 1));
        blendedPos.columnEnd = Math.max(blendedPos.columnStart + 1, Math.min(blendedPos.columnEnd, grid.dimensions.columns));

        if (canPlaceAt(grid, blendedPos)) {
          placeElement(grid, newEl, blendedPos);
        } else {
          const fallback = findNearbyPosition(grid, blendedPos, prng);
          if (fallback) {
            placeElement(grid, newEl, fallback);
          }
        }
      }
    }

    return {
      id: prng.int(0, 1000000).toString(),
      elements,
      grid,
      fitness: { total: 0, hierarchy: 0, balance: 0, rhythm: 0, proportion: 0, alignment: 0, spacing: 0, whitespace: 0, harmony: 0 },
      generation: Math.max(parent1.generation, parent2.generation) + 1,
    };
  },
};

// ============================================================================
// Available Operators
// ============================================================================

export const MUTATION_OPERATORS: MutationOperator[] = [
  positionMutation,
  sizeMutation,
  swapMutation,
  growMutation,
  shrinkMutation,
];

export const CROSSOVER_OPERATORS: CrossoverOperator[] = [
  singlePointCrossover,
  uniformCrossover,
  areaCrossover,
  blendCrossover,
];

// ============================================================================
// Helper Functions
// ============================================================================

function cloneGeneticLayout(layout: GeneticLayout): GeneticLayout {
  const newElements = new Map<string, LayoutElement>();
  for (const [id, el] of layout.elements) {
    newElements.set(id, cloneElement(el));
  }
  return {
    id: layout.id + '_clone',
    elements: newElements,
    grid: cloneGrid(layout.grid),
    fitness: { ...layout.fitness },
    generation: layout.generation,
  };
}

function cloneElement(el: LayoutElement): LayoutElement {
  return {
    ...el,
    position: el.position ? { ...el.position } : undefined,
    styles: { ...el.styles },
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getElCenter(el: LayoutElement): { x: number; y: number } {
  if (!el.position) return { x: 0, y: 0 };
  return {
    x: (el.position.columnStart + el.position.columnEnd) / 2,
    y: (el.position.rowStart + el.position.rowEnd) / 2,
  };
}

function canFit(grid: GridSystem, pos: GridPosition, el: LayoutElement): boolean {
  const width = pos.columnEnd - pos.columnStart;
  const height = pos.rowEnd - pos.rowStart;
  return (
    width >= el.minWidth &&
    width <= el.maxWidth &&
    height >= el.minHeight &&
    height <= el.maxHeight &&
    canPlaceAt(grid, pos)
  );
}

function canPlaceAt(grid: GridSystem, pos: GridPosition): boolean {
  for (let r = pos.rowStart; r < pos.rowEnd; r++) {
    for (let c = pos.columnStart; c < pos.columnEnd; c++) {
      if (r < 0 || r >= grid.dimensions.rows || c < 0 || c >= grid.dimensions.columns) {
        return false;
      }
      if (grid.cells[r][c].occupied) {
        return false;
      }
    }
  }
  return true;
}

function isAreaFree(grid: GridSystem, pos: GridPosition, excludeId: string): boolean {
  for (let r = pos.rowStart; r < pos.rowEnd; r++) {
    for (let c = pos.columnStart; c < pos.columnEnd; c++) {
      if (r < 0 || r >= grid.dimensions.rows || c < 0 || c >= grid.dimensions.columns) {
        return false;
      }
      const cell = grid.cells[r][c];
      if (cell.occupied && cell.elementId !== excludeId) {
        return false;
      }
    }
  }
  return true;
}

function findNearbyPosition(grid: GridSystem, target: GridPosition, prng: PRNGLike): GridPosition | null {
  const width = target.columnEnd - target.columnStart;
  const height = target.rowEnd - target.rowStart;

  // Try the exact position first
  if (canPlaceAt(grid, target)) {
    return target;
  }

  // Try positions in expanding ring
  for (let radius = 1; radius < Math.max(grid.dimensions.rows, grid.dimensions.columns); radius++) {
    const candidates: GridPosition[] = [];

    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (Math.abs(dr) !== radius && Math.abs(dc) !== radius) continue;

        const newPos: GridPosition = {
          rowStart: target.rowStart + dr,
          rowEnd: target.rowStart + dr + height,
          columnStart: target.columnStart + dc,
          columnEnd: target.columnStart + dc + width,
        };

        if (
          newPos.rowStart >= 0 &&
          newPos.rowEnd <= grid.dimensions.rows &&
          newPos.columnStart >= 0 &&
          newPos.columnEnd <= grid.dimensions.columns &&
          canPlaceAt(grid, newPos)
        ) {
          candidates.push(newPos);
        }
      }
    }

    if (candidates.length > 0) {
      return prng.pick(candidates);
    }
  }

  return findAvailablePosition(grid, width, height);
}