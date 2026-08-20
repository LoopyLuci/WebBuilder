// ============================================================================
// Fractal Visualizer
// Renders Mandelbrot and Julia set fractals
// ============================================================================

import type { FractalParams } from './types.js';

/**
 * Color schemes for fractal rendering
 */
function getColor(t: number, scheme: FractalParams['colorScheme']): [number, number, number] {
  const v = Math.max(0, Math.min(1, t));
  
  switch (scheme) {
    case 'classic': {
      const r = Math.floor(v * 255);
      const g = Math.floor(v * v * 255);
      const b = Math.floor(v * v * v * 255);
      return [r, g, b];
    }
    case 'fire': {
      const r = Math.floor(Math.min(1, v * 3) * 255);
      const g = Math.floor(Math.min(1, Math.max(0, v * 3 - 1)) * 255);
      const b = Math.floor(Math.min(1, Math.max(0, v * 3 - 2)) * 255);
      return [r, g, b];
    }
    case 'ocean': {
      const r = Math.floor(v * v * 128);
      const g = Math.floor(v * 200);
      const b = Math.floor(128 + v * 127);
      return [r, g, b];
    }
    case 'neon': {
      const r = Math.floor(Math.abs(Math.sin(v * Math.PI * 2)) * 255);
      const g = Math.floor(Math.abs(Math.sin(v * Math.PI * 2 + 2.094)) * 255);
      const b = Math.floor(Math.abs(Math.sin(v * Math.PI * 2 + 4.189)) * 255);
      return [r, g, b];
    }
  }
}

/**
 * Render fractal to ImageData
 */
export function renderFractal(
  width: number,
  height: number,
  params: FractalParams
): ImageData {
  const imageData = new ImageData(width, height);
  const data = imageData.data;

  const aspectRatio = width / height;
  const zoom = params.zoom;
  const halfWidth = 1.5 / zoom;
  const halfHeight = 1.5 / zoom;
  const xMin = params.centerX - halfWidth * aspectRatio;
  const yMin = params.centerY - halfHeight;

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const x0 = xMin + (px / width) * halfWidth * 2 * aspectRatio;
      const y0 = yMin + (py / height) * halfHeight * 2;

      let x = 0;
      let y = 0;
      let iteration = 0;

      if (params.type === 'mandelbrot') {
        // z = z^2 + c, where c = (x0, y0), z starts at 0
        while (x * x + y * y <= 4 && iteration < params.maxIterations) {
          const xtemp = x * x - y * y + x0;
          y = 2 * x * y + y0;
          x = xtemp;
          iteration++;
        }
      } else {
        // Julia set: z = z^2 + c, where c is fixed, z starts at (x0, y0)
        const cx = params.juliaReal;
        const cy = params.juliaImag;
        while (x * x + y * y <= 4 && iteration < params.maxIterations) {
          const xtemp = x * x - y * y + cx;
          y = 2 * x * y + cy;
          x = xtemp;
          iteration++;
        }
      }

      const idx = (py * width + px) * 4;
      if (iteration === params.maxIterations) {
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 255;
      } else {
        // Smooth coloring
        const log2 = Math.log(2);
        const smoothed = iteration + 1 - Math.log(Math.log(Math.sqrt(x * x + y * y))) / log2;
        const t = smoothed / params.maxIterations;
        const color = getColor(t, params.colorScheme);
        data[idx] = color[0];
        data[idx + 1] = color[1];
        data[idx + 2] = color[2];
        data[idx + 3] = 255;
      }
    }
  }

  return imageData;
}

/**
 * Create fractal visualizer
 */
export function createFractalVisualizer(
  canvas: HTMLCanvasElement,
  params: FractalParams
): { render: () => void; updateParams: (p: Partial<FractalParams>) => void } {
  const ctx = canvas.getContext('2d')!;
  let currentParams = { ...params };

  function render() {
    const imageData = renderFractal(canvas.width, canvas.height, currentParams);
    ctx.putImageData(imageData, 0, 0);
  }

  function updateParams(p: Partial<FractalParams>) {
    currentParams = { ...currentParams, ...p };
    render();
  }

  return { render, updateParams };
}