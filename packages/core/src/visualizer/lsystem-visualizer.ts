// ============================================================================
// L-System Visualizer
// Renders Lindenmayer system fractals
// ============================================================================

import type { LSystemParams } from './types.js';

/**
 * Generate L-system string from axiom and rules
 */
export function generateLSystem(
  axiom: string,
  rules: Record<string, string>,
  iterations: number
): string {
  let current = axiom;

  for (let i = 0; i < iterations; i++) {
    let next = '';
    for (const char of current) {
      next += rules[char] !== undefined ? rules[char] : char;
    }
    current = next;
    // Safety limit
    if (current.length > 100000) break;
  }

  return current;
}

/**
 * Parse L-system result into line segments
 */
interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  depth: number;
}

function parseLSystem(
  lstring: string,
  startX: number,
  startY: number,
  angle: number,
  lineLength: number
): { segments: Segment[]; bounds: { minX: number; maxX: number; minY: number; maxY: number } } {
  const segments: Segment[] = [];
  let x = startX;
  let y = startY;
  let currentAngle = angle;
  let depth = 0;

  const stack: Array<{ x: number; y: number; angle: number; depth: number }> = [];
  let minX = x, maxX = x, minY = y, maxY = y;

  for (const char of lstring) {
    switch (char) {
      case 'F':
      case 'G': {
        const rad = (currentAngle * Math.PI) / 180;
        const newX = x + Math.cos(rad) * lineLength;
        const newY = y + Math.sin(rad) * lineLength;
        segments.push({ x1: x, y1: y, x2: newX, y2: newY, depth });
        x = newX;
        y = newY;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        break;
      }
      case 'f': {
        const rad = (currentAngle * Math.PI) / 180;
        x += Math.cos(rad) * lineLength;
        y += Math.sin(rad) * lineLength;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        break;
      }
      case '+':
        currentAngle += angle;
        break;
      case '-':
        currentAngle -= angle;
        break;
      case '[':
        stack.push({ x, y, angle: currentAngle, depth });
        depth++;
        break;
      case ']':
        const state = stack.pop();
        if (state) {
          x = state.x;
          y = state.y;
          currentAngle = state.angle;
          depth = state.depth;
        }
        break;
    }
  }

  return { segments, bounds: { minX, maxX, minY, maxY } };
}

/**
 * Render L-system to canvas
 */
export function renderLSystem(
  width: number,
  height: number,
  params: LSystemParams
): ImageData {
  const imageData = new ImageData(width, height);
  const data = imageData.data;

  // Fill background
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 15;
    data[i + 1] = 15;
    data[i + 2] = 25;
    data[i + 3] = 255;
  }

  const lstring = generateLSystem(params.axiom, params.rules, params.iterations);
  const { segments, bounds } = parseLSystem(lstring, 0, 0, 90, params.lineLength);

  if (segments.length === 0) return imageData;

  // Calculate scale and offset to fit canvas
  const padding = 20;
  const rangeX = bounds.maxX - bounds.minX || 1;
  const rangeY = bounds.maxY - bounds.minY || 1;
  const scaleX = (width - padding * 2) / rangeX;
  const scaleY = (height - padding * 2) / rangeY;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = padding + (width - padding * 2 - rangeX * scale) / 2 - bounds.minX * scale;
  const offsetY = padding + (height - padding * 2 - rangeY * scale) / 2 - bounds.minY * scale;

  const maxDepth = Math.max(...segments.map(s => s.depth), 1);

  // Draw segments using Bresenham's line algorithm
  for (const seg of segments) {
    const x1 = Math.floor(seg.x1 * scale + offsetX);
    const y1 = Math.floor(seg.y1 * scale + offsetY);
    const x2 = Math.floor(seg.x2 * scale + offsetX);
    const y2 = Math.floor(seg.y2 * scale + offsetY);

    let r: number, g: number, b: number;
    if (params.colorMode === 'solid') {
      r = 59; g = 130; b = 246; // Blue
    } else if (params.colorMode === 'gradient') {
      const t = seg.depth / Math.max(maxDepth, 1);
      r = Math.floor(59 + t * 141);
      g = Math.floor(130 - t * 50);
      b = Math.floor(246 - t * 46);
    } else {
      // depth coloring
      const intensity = Math.floor((1 - seg.depth / Math.max(maxDepth, 1)) * 255);
      r = intensity;
      g = Math.floor(intensity * 0.7);
      b = Math.floor(255 - intensity * 0.5);
    }

    drawLine(data, width, height, x1, y1, x2, y2, r, g, b, params.lineWidth);
  }

  return imageData;
}

function drawLine(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number,
  g: number,
  b: number,
  lineWidth: number
) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  const halfWidth = Math.floor(lineWidth / 2);

  while (true) {
    for (let wdx = -halfWidth; wdx <= halfWidth; wdx++) {
      for (let wdy = -halfWidth; wdy <= halfWidth; wdy++) {
        const px = x0 + wdx;
        const py = y0 + wdy;
        if (px >= 0 && px < width && py >= 0 && py < height) {
          const idx = (py * width + px) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }
    }

    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
}

/**
 * Create L-system visualizer
 */
export function createLSystemVisualizer(
  canvas: HTMLCanvasElement,
  params: LSystemParams
): { render: () => void; updateParams: (p: Partial<LSystemParams>) => void } {
  const ctx = canvas.getContext('2d')!;
  let currentParams = { ...params };

  function render() {
    const imageData = renderLSystem(canvas.width, canvas.height, currentParams);
    ctx.putImageData(imageData, 0, 0);
  }

  function updateParams(p: Partial<LSystemParams>) {
    currentParams = { ...currentParams, ...p };
    render();
  }

  return { render, updateParams };
}