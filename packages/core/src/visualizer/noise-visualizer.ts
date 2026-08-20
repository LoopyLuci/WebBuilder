// ============================================================================
// Noise Visualizer
// Renders 2D/3D noise (Perlin, Simplex, Worley) to a canvas
// ============================================================================

import { PerlinNoise, SimplexNoise, FractalNoise } from '../generators/noise.js';
import { PRNG } from '../generators/prng.js';
import type { NoiseParams } from './types.js';

/**
 * Worley (cellular) noise generator
 */
class WorleyNoise {
  private prng: PRNG;
  private seed: string;

  constructor(seed: string) {
    this.seed = seed;
    this.prng = new PRNG(seed);
  }

  /**
   * Generate Worley noise at (x, y)
   * Returns [F1, F2] distances to nearest and second-nearest points
   */
  noise2d(x: number, y: number): [number, number] {
    const cellX = Math.floor(x);
    const cellY = Math.floor(y);
    let f1 = Infinity;
    let f2 = Infinity;

    // Check 3x3 neighborhood of cells
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const cx = cellX + dx;
        const cy = cellY + dy;
        // Deterministic random point in this cell
        const cellPrng = new PRNG(`${this.seed}-${cx}-${cy}`);
        const px = cx + cellPrng.next();
        const py = cy + cellPrng.next();
        const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        if (dist < f1) {
          f2 = f1;
          f1 = dist;
        } else if (dist < f2) {
          f2 = dist;
        }
      }
    }

    return [f1, f2];
  }
}

/**
 * Color mapping utilities
 */
function grayscaleColor(value: number): [number, number, number] {
  const v = Math.floor(value * 255);
  return [v, v, v];
}

function heatmapColor(value: number): [number, number, number] {
  const v = Math.max(0, Math.min(1, value));
  const r = Math.floor(Math.min(1, v * 2) * 255);
  const g = Math.floor(Math.min(1, Math.max(0, v * 2 - 0.5)) * 255);
  const b = Math.floor(Math.min(1, Math.max(0, v * 3 - 1.5)) * 255);
  return [r, g, b];
}

function colorNoise(value: number, x: number, y: number): [number, number, number] {
  const v = Math.max(0, Math.min(1, value));
  const r = Math.floor(Math.abs(Math.sin(v * Math.PI * 2 + x * 0.01)) * 255);
  const g = Math.floor(Math.abs(Math.sin(v * Math.PI * 2 + y * 0.01 + 2.094)) * 255);
  const b = Math.floor(Math.abs(Math.sin(v * Math.PI * 2 + x * 0.01 + 4.189)) * 255);
  return [r, g, b];
}

/**
 * Render noise to an ImageData buffer
 */
export function renderNoise(
  width: number,
  height: number,
  params: NoiseParams
): ImageData {
  const imageData = new ImageData(width, height);
  const data = imageData.data;

  let perlin: PerlinNoise | null = null;
  let simplex: SimplexNoise | null = null;
  let worley: WorleyNoise | null = null;
  let fractal: FractalNoise | null = null;

  if (params.type === 'perlin') {
    perlin = new PerlinNoise(params.seed);
    fractal = new FractalNoise(perlin, params.octaves, params.lacunarity, params.persistence);
  } else if (params.type === 'simplex') {
    simplex = new SimplexNoise(params.seed);
    fractal = new FractalNoise(simplex, params.octaves, params.lacunarity, params.persistence);
  } else if (params.type === 'worley') {
    worley = new WorleyNoise(params.seed);
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value: number;

      if (worley) {
        const [f1, f2] = worley.noise2d(x * params.scale * 10, y * params.scale * 10);
        value = f2 - f1; // Cell border effect
        value = Math.max(0, Math.min(1, value * 2));
      } else if (fractal) {
        if (params.dimension === '3d') {
          value = fractal.fbm3d(x * params.scale, y * params.scale, params.zOffset);
        } else {
          value = fractal.fbm2d(x * params.scale, y * params.scale);
        }
        value = (value + 1) / 2; // Normalize to [0, 1]
      } else {
        value = 0.5;
      }

      let color: [number, number, number];
      if (params.colorMode === 'grayscale') {
        color = grayscaleColor(value);
      } else if (params.colorMode === 'heatmap') {
        color = heatmapColor(value);
      } else {
        color = colorNoise(value, x, y);
      }

      const idx = (y * width + x) * 4;
      data[idx] = color[0];
      data[idx + 1] = color[1];
      data[idx + 2] = color[2];
      data[idx + 3] = 255;
    }
  }

  return imageData;
}

/**
 * Create a noise visualizer that renders to a canvas
 */
export function createNoiseVisualizer(
  canvas: HTMLCanvasElement,
  params: NoiseParams
): { render: () => void; updateParams: (p: Partial<NoiseParams>) => void } {
  const ctx = canvas.getContext('2d')!;
  let currentParams = { ...params };

  function render() {
    const imageData = renderNoise(canvas.width, canvas.height, currentParams);
    ctx.putImageData(imageData, 0, 0);
  }

  function updateParams(p: Partial<NoiseParams>) {
    currentParams = { ...currentParams, ...p };
    render();
  }

  return { render, updateParams };
}