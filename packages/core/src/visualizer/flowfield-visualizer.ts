// ============================================================================
// Flow Field Visualizer
// Renders animated flow fields with particles following noise-based vectors
// ============================================================================

import { PerlinNoise } from '../generators/noise.js';
import type { FlowFieldParams } from './types.js';

interface FlowParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
}

/**
 * Create flow field particles
 */
function createParticles(count: number, width: number, height: number, seed: string): FlowParticle[] {
  const particles: FlowParticle[] = [];
  let seedNum = 0;
  for (let i = 0; i < seed.length; i++) {
    seedNum = ((seedNum << 5) - seedNum + seed.charCodeAt(i)) | 0;
  }
  let state = seedNum;

  for (let i = 0; i < count; i++) {
    // Simple seeded random
    state = (state * 1664525 + 1013904223) | 0;
    const x = (state >>> 0) / 4294967296 * width;
    state = (state * 1664525 + 1013904223) | 0;
    const y = (state >>> 0) / 4294967296 * height;
    state = (state * 1664525 + 1013904223) | 0;
    const maxLife = 50 + ((state >>> 0) / 4294967296) * 150;
    state = (state * 1664525 + 1013904223) | 0;
    const hue = ((state >>> 0) / 4294967296) * 360;

    particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife,
      hue,
    });
  }

  return particles;
}

/**
 * Render flow field frame
 */
export function renderFlowField(
  width: number,
  height: number,
  params: FlowFieldParams,
  particles: FlowParticle[],
  noise: PerlinNoise
): ImageData {
  const imageData = new ImageData(width, height);
  const data = imageData.data;

  // Copy existing or create new
  // For fresh render, start with dark background
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 10;
    data[i + 1] = 10;
    data[i + 2] = 20;
    data[i + 3] = 255;
  }

  // Draw particle trails
  for (const p of particles) {
    const steps = 20;
    let x = p.x;
    let y = p.y;

    for (let s = 0; s < steps; s++) {
      const angle = noise.noise2d(x * params.scale, y * params.scale) * Math.PI * 2;
      const prevX = x;
      const prevY = y;
      x += Math.cos(angle) * params.speed;
      y += Math.sin(angle) * params.speed;

      if (x < 0 || x >= width || y < 0 || y >= height) break;

      // Draw line segment
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      if (ix >= 0 && ix < width && iy >= 0 && iy < height) {
        const idx = (iy * width + ix) * 4;
        const alpha = 1 - s / steps;
        let r: number, g: number, b: number;
        if (params.colorMode === 'velocity') {
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          const t = Math.min(1, speed / params.speed);
          r = Math.floor(t * 255);
          g = Math.floor((1 - t) * 200);
          b = Math.floor(128 + t * 127);
        } else if (params.colorMode === 'position') {
          const t = x / width;
          r = Math.floor(t * 255);
          g = Math.floor((1 - Math.abs(t - 0.5) * 2) * 255);
          b = Math.floor((1 - t) * 255);
        } else {
          r = 100;
          g = 180;
          b = 255;
        }
        data[idx] = Math.min(255, data[idx] + r * alpha * 0.5);
        data[idx + 1] = Math.min(255, data[idx + 1] + g * alpha * 0.5);
        data[idx + 2] = Math.min(255, data[idx + 2] + b * alpha * 0.5);
        data[idx + 3] = 255;
      }
    }
  }

  return imageData;
}

/**
 * Update flow field particles
 */
export function updateFlowFieldParticles(
  particles: FlowParticle[],
  width: number,
  height: number,
  params: FlowFieldParams,
  noise: PerlinNoise
): void {
  for (const p of particles) {
    const angle = noise.noise2d(p.x * params.scale, p.y * params.scale) * Math.PI * 2;
    p.vx = Math.cos(angle) * params.speed;
    p.vy = Math.sin(angle) * params.speed;
    p.x += p.vx;
    p.y += p.vy;
    p.life++;

    // Reset particle if out of bounds or exceeded life
    if (p.x < 0 || p.x >= width || p.y < 0 || p.y >= height || p.life > p.maxLife) {
      p.x = Math.random() * width;
      p.y = Math.random() * height;
      p.life = 0;
      p.maxLife = 50 + Math.random() * 150;
    }
  }
}

/**
 * Create flow field visualizer with animation support
 */
export function createFlowFieldVisualizer(
  canvas: HTMLCanvasElement,
  params: FlowFieldParams
): {
  render: () => void;
  updateParams: (p: Partial<FlowFieldParams>) => void;
  startAnimation: () => void;
  stopAnimation: () => void;
} {
  const ctx = canvas.getContext('2d')!;
  let currentParams = { ...params };
  let noise = new PerlinNoise(currentParams.seed);
  let particles = createParticles(currentParams.particleCount, canvas.width, canvas.height, currentParams.seed);
  let animationId: number | null = null;

  function render() {
    const imageData = renderFlowField(canvas.width, canvas.height, currentParams, particles, noise);
    ctx.putImageData(imageData, 0, 0);
  }

  function animate() {
    updateFlowFieldParticles(particles, canvas.width, canvas.height, currentParams, noise);
    render();
    animationId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (animationId === null) {
      animate();
    }
  }

  function stopAnimation() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function updateParams(p: Partial<FlowFieldParams>) {
    const needsRecreate = p.seed !== undefined && p.seed !== currentParams.seed ||
      p.particleCount !== undefined && p.particleCount !== currentParams.particleCount;
    
    currentParams = { ...currentParams, ...p };
    
    if (needsRecreate) {
      noise = new PerlinNoise(currentParams.seed);
      particles = createParticles(currentParams.particleCount, canvas.width, canvas.height, currentParams.seed);
    }
    
    render();
  }

  return { render, updateParams, startAnimation, stopAnimation };
}