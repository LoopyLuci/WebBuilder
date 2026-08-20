// ============================================================================
// Voronoi Diagram Visualizer
// Renders Voronoi diagrams with various distance metrics
// ============================================================================

import { PRNG } from '../generators/prng.js';
import type { VoronoiParams } from './types.js';

/**
 * Calculate distance based on metric type
 */
function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  metric: VoronoiParams['distanceMetric']
): number {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  
  switch (metric) {
    case 'euclidean':
      return Math.sqrt(dx * dx + dy * dy);
    case 'manhattan':
      return dx + dy;
    case 'chebyshev':
      return Math.max(dx, dy);
  }
}

/**
 * Generate Voronoi seeds deterministically
 */
function generateSeeds(count: number, seed: string, width: number, height: number): Array<{ x: number; y: number; color: [number, number, number] }> {
  const prng = new PRNG(seed);
  const seeds: Array<{ x: number; y: number; color: [number, number, number] }> = [];
  
  for (let i = 0; i < count; i++) {
    seeds.push({
      x: prng.range(0, width),
      y: prng.range(0, height),
      color: [
        Math.floor(prng.range(80, 255)),
        Math.floor(prng.range(80, 255)),
        Math.floor(prng.range(80, 255)),
      ],
    });
  }
  
  return seeds;
}

/**
 * Render Voronoi diagram to ImageData
 */
export function renderVoronoi(
  width: number,
  height: number,
  params: VoronoiParams
): ImageData {
  const imageData = new ImageData(width, height);
  const data = imageData.data;
  const seeds = generateSeeds(params.pointCount, params.seed, width, height);

  // Fill background
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 15;
    data[i + 1] = 15;
    data[i + 2] = 25;
    data[i + 3] = 255;
  }

  // Calculate pixel assignments
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let nearestDist = Infinity;
      let nearestIdx = 0;
      let secondDist = Infinity;

      for (let i = 0; i < seeds.length; i++) {
        const d = distance(x, y, seeds[i].x, seeds[i].y, params.distanceMetric);
        if (d < nearestDist) {
          secondDist = nearestDist;
          nearestDist = d;
          nearestIdx = i;
        } else if (d < secondDist) {
          secondDist = d;
        }
      }

      const idx = (y * width + x) * 4;
      const seed = seeds[nearestIdx];

      if (params.colorMode === 'cells') {
        data[idx] = seed.color[0];
        data[idx + 1] = seed.color[1];
        data[idx + 2] = seed.color[2];
        data[idx + 3] = 255;
      } else if (params.colorMode === 'random') {
        data[idx] = seed.color[0];
        data[idx + 1] = seed.color[1];
        data[idx + 2] = seed.color[2];
        data[idx + 3] = 255;
      } else {
        // distance coloring
        const maxDist = Math.min(width, height) / 4;
        const t = Math.min(1, nearestDist / maxDist);
        data[idx] = Math.floor((1 - t) * 255);
        data[idx + 1] = Math.floor((1 - t) * 200);
        data[idx + 2] = Math.floor(t * 255);
        data[idx + 3] = 255;
      }
    }
  }

  // Draw edges
  if (params.showEdges) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let nearestDist = Infinity;
        let nearestIdx = 0;

        for (let i = 0; i < seeds.length; i++) {
          const d = distance(x, y, seeds[i].x, seeds[i].y, params.distanceMetric);
          if (d < nearestDist) {
            nearestDist = d;
            nearestIdx = i;
          }
        }

        // Check neighbors for edges
        const neighbors = [
          [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            let nDist = Infinity;
            let nIdx = 0;
            for (let i = 0; i < seeds.length; i++) {
              const d = distance(nx, ny, seeds[i].x, seeds[i].y, params.distanceMetric);
              if (d < nDist) {
                nDist = d;
                nIdx = i;
              }
            }
            if (nIdx !== nearestIdx) {
              const idx = (y * width + x) * 4;
              data[idx] = 255;
              data[idx + 1] = 255;
              data[idx + 2] = 255;
              data[idx + 3] = 255;
              break;
            }
          }
        }
      }
    }
  }

  // Draw points
  if (params.showPoints) {
    for (const seed of seeds) {
      const px = Math.floor(seed.x);
      const py = Math.floor(seed.y);
      const radius = 3;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy <= radius * radius) {
            const x = px + dx;
            const y = py + dy;
            if (x >= 0 && x < width && y >= 0 && y < height) {
              const idx = (y * width + x) * 4;
              data[idx] = 255;
              data[idx + 1] = 255;
              data[idx + 2] = 255;
              data[idx + 3] = 255;
            }
          }
        }
      }
    }
  }

  return imageData;
}

/**
 * Create Voronoi visualizer
 */
export function createVoronoiVisualizer(
  canvas: HTMLCanvasElement,
  params: VoronoiParams
): { render: () => void; updateParams: (p: Partial<VoronoiParams>) => void } {
  const ctx = canvas.getContext('2d')!;
  let currentParams = { ...params };

  function render() {
    const imageData = renderVoronoi(canvas.width, canvas.height, currentParams);
    ctx.putImageData(imageData, 0, 0);
  }

  function updateParams(p: Partial<VoronoiParams>) {
    currentParams = { ...currentParams, ...p };
    render();
  }

  return { render, updateParams };
}