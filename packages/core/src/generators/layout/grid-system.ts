// ============================================================================
// Grid System Engine
// Flexible grid system with support for CSS Grid-like layouts
// ============================================================================

import { GridSystem, GridCell, GridDimensions, LayoutElement, GridPosition } from './types.js';

/**
 * Create a new grid system with the specified dimensions
 */
export function createGrid(
  rows: number,
  columns: number,
  options: { gutter?: number; margin?: number; maxWidth?: number } = {}
): GridSystem {
  const { gutter = 16, margin = 24, maxWidth = 1280 } = options;
  
  const cells: GridCell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < columns; c++) {
      row.push({
        row: r,
        column: c,
        occupied: false,
        elementId: null,
      });
    }
    cells.push(row);
  }

  return {
    dimensions: { rows, columns },
    cells,
    gutter,
    margin,
    maxWidth,
  };
}

/**
 * Place an element on the grid at the specified position
 */
export function placeElement(
  grid: GridSystem,
  element: LayoutElement,
  position: GridPosition
): boolean {
  // Check bounds
  if (
    position.rowStart < 0 ||
    position.rowEnd > grid.dimensions.rows ||
    position.columnStart < 0 ||
    position.columnEnd > grid.dimensions.columns
  ) {
    return false;
  }

  // Check if cells are available
  for (let r = position.rowStart; r < position.rowEnd; r++) {
    for (let c = position.columnStart; c < position.columnEnd; c++) {
      if (grid.cells[r][c].occupied) {
        return false;
      }
    }
  }

  // Place element
  for (let r = position.rowStart; r < position.rowEnd; r++) {
    for (let c = position.columnStart; c < position.columnEnd; c++) {
      grid.cells[r][c].occupied = true;
      grid.cells[r][c].elementId = element.id;
    }
  }

  element.position = position;
  return true;
}

/**
 * Remove an element from the grid
 */
export function removeElement(grid: GridSystem, elementId: string): void {
  for (let r = 0; r < grid.dimensions.rows; r++) {
    for (let c = 0; c < grid.dimensions.columns; c++) {
      if (grid.cells[r][c].elementId === elementId) {
        grid.cells[r][c].occupied = false;
        grid.cells[r][c].elementId = null;
      }
    }
  }
}

/**
 * Find the next available position for an element of given size
 */
export function findAvailablePosition(
  grid: GridSystem,
  width: number,
  height: number
): GridPosition | null {
  for (let r = 0; r <= grid.dimensions.rows - height; r++) {
    for (let c = 0; c <= grid.dimensions.columns - width; c++) {
      let available = true;
      for (let dr = 0; dr < height && available; dr++) {
        for (let dc = 0; dc < width && available; dc++) {
          if (grid.cells[r + dr][c + dc].occupied) {
            available = false;
          }
        }
      }
      if (available) {
        return {
          rowStart: r,
          rowEnd: r + height,
          columnStart: c,
          columnEnd: c + width,
        };
      }
    }
  }
  return null;
}

/**
 * Get all occupied positions for an element
 */
export function getElementCells(grid: GridSystem, elementId: string): GridCell[] {
  const result: GridCell[] = [];
  for (let r = 0; r < grid.dimensions.rows; r++) {
    for (let c = 0; c < grid.dimensions.columns; c++) {
      if (grid.cells[r][c].elementId === elementId) {
        result.push(grid.cells[r][c]);
      }
    }
  }
  return result;
}

/**
 * Calculate the bounding box of an element
 */
export function getElementBounds(grid: GridSystem, elementId: string): GridPosition | null {
  const cells = getElementCells(grid, elementId);
  if (cells.length === 0) return null;

  let minRow = Infinity, maxRow = -Infinity;
  let minCol = Infinity, maxCol = -Infinity;

  for (const cell of cells) {
    minRow = Math.min(minRow, cell.row);
    maxRow = Math.max(maxRow, cell.row);
    minCol = Math.min(minCol, cell.column);
    maxCol = Math.max(maxCol, cell.column);
  }

  return {
    rowStart: minRow,
    rowEnd: maxRow + 1,
    columnStart: minCol,
    columnEnd: maxCol + 1,
  };
}

/**
 * Get the center point of an element
 */
export function getElementCenter(grid: GridSystem, elementId: string): { x: number; y: number } | null {
  const bounds = getElementBounds(grid, elementId);
  if (!bounds) return null;

  return {
    x: (bounds.columnStart + bounds.columnEnd) / 2,
    y: (bounds.rowStart + bounds.rowEnd) / 2,
  };
}

/**
 * Calculate the area of an element in grid cells
 */
export function getElementArea(element: LayoutElement): number {
  if (!element.position) return 0;
  const width = element.position.columnEnd - element.position.columnStart;
  const height = element.position.rowEnd - element.position.rowStart;
  return width * height;
}

/**
 * Get the width of an element in columns
 */
export function getElementWidth(element: LayoutElement): number {
  if (!element.position) return 0;
  return element.position.columnEnd - element.position.columnStart;
}

/**
 * Get the height of an element in rows
 */
export function getElementHeight(element: LayoutElement): number {
  if (!element.position) return 0;
  return element.position.rowEnd - element.position.rowStart;
}

/**
 * Check if two elements are adjacent
 */
export function areElementsAdjacent(grid: GridSystem, id1: string, id2: string): boolean {
  const bounds1 = getElementBounds(grid, id1);
  const bounds2 = getElementBounds(grid, id2);
  if (!bounds1 || !bounds2) return false;

  // Check horizontal adjacency
  const horizontalAdj =
    (bounds1.columnEnd === bounds2.columnStart || bounds2.columnEnd === bounds1.columnStart) &&
    bounds1.rowStart < bounds2.rowEnd &&
    bounds2.rowStart < bounds1.rowEnd;

  // Check vertical adjacency
  const verticalAdj =
    (bounds1.rowEnd === bounds2.rowStart || bounds2.rowEnd === bounds1.rowStart) &&
    bounds1.columnStart < bounds2.columnEnd &&
    bounds2.columnStart < bounds1.columnEnd;

  return horizontalAdj || verticalAdj;
}

/**
 * Get all empty regions in the grid
 */
export function getEmptyRegions(grid: GridSystem): GridPosition[] {
  const regions: GridPosition[] = [];
  const visited = new Set<string>();

  for (let r = 0; r < grid.dimensions.rows; r++) {
    for (let c = 0; c < grid.dimensions.columns; c++) {
      const key = `${r},${c}`;
      if (grid.cells[r][c].occupied || visited.has(key)) continue;

      // Find the largest rectangle starting at (r, c)
      let maxC = c;
      while (maxC < grid.dimensions.columns && !grid.cells[r][maxC].occupied) {
        maxC++;
      }

      let maxR = r;
      let canExpand = true;
      while (canExpand && maxR < grid.dimensions.rows) {
        for (let cc = c; cc < maxC; cc++) {
          if (grid.cells[maxR][cc].occupied) {
            canExpand = false;
            break;
          }
        }
        if (canExpand) maxR++;
      }

      // Mark visited
      for (let rr = r; rr < maxR; rr++) {
        for (let cc = c; cc < maxC; cc++) {
          visited.add(`${rr},${cc}`);
        }
      }

      regions.push({
        rowStart: r,
        rowEnd: maxR,
        columnStart: c,
        columnEnd: maxC,
      });
    }
  }

  return regions;
}

/**
 * Calculate grid utilization (0-1)
 */
export function getGridUtilization(grid: GridSystem): number {
  let occupied = 0;
  const total = grid.dimensions.rows * grid.dimensions.columns;
  for (let r = 0; r < grid.dimensions.rows; r++) {
    for (let c = 0; c < grid.dimensions.columns; c++) {
      if (grid.cells[r][c].occupied) occupied++;
    }
  }
  return occupied / total;
}

/**
 * Generate CSS grid-template-areas string
 */
export function generateGridTemplateAreas(grid: GridSystem): string {
  const lines: string[] = [];
  for (let r = 0; r < grid.dimensions.rows; r++) {
    const rowStr = grid.cells[r].map(c => c.elementId || '.').join(' ');
    lines.push(`"${rowStr}"`);
  }
  return lines.join('\n');
}

/**
 * Clone a grid system
 */
export function cloneGrid(grid: GridSystem): GridSystem {
  return {
    dimensions: { ...grid.dimensions },
    cells: grid.cells.map(row => row.map(cell => ({ ...cell }))),
    gutter: grid.gutter,
    margin: grid.margin,
    maxWidth: grid.maxWidth,
  };
}