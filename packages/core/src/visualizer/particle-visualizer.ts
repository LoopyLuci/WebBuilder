// ============================================================================
// Particle System Visualizer
// Interactive particle system with physics simulation
// ============================================================================

import type { ParticleParams } from './types.js';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 59, g: 130, b: 246 };
}

/**
 * Create particles
 */
function createParticles(count: number, width: number, height: number, params: ParticleParams): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * params.maxSpeed * 2,
      vy: (Math.random() - 0.5) * params.maxSpeed * 2,
      size: params.size * (0.5 + Math.random() * 0.5),
      color: params.color,
      alpha: 0.6 + Math.random() * 0.4,
    });
  }
  return particles;
}

/**
 * Render particle system frame
 */
export function renderParticles(
  width: number,
  height: number,
  params: ParticleParams,
  particles: Particle[]
): ImageData {
  const imageData = new ImageData(width, height);
  const data = imageData.data;

  // Dark background
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 10;
    data[i + 1] = 10;
    data[i + 2] = 20;
    data[i + 3] = 255;
  }

  const rgb = hexToRgb(params.color);

  // Draw connections
  if (params.connectDistance > 0) {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < params.connectDistance) {
          const alpha = (1 - dist / params.connectDistance) * 0.5;
          drawLineAA(
            data, width, height,
            particles[i].x, particles[i].y,
            particles[j].x, particles[j].y,
            rgb.r, rgb.g, rgb.b, alpha
          );
        }
      }
    }
  }

  // Draw particles
  for (const p of particles) {
    const ix = Math.floor(p.x);
    const iy = Math.floor(p.y);
    const radius = Math.ceil(p.size);

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = ix + dx;
        const y = iy + dy;
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= p.size) {
            const idx = (y * width + x) * 4;
            const falloff = 1 - dist / p.size;
            const alpha = falloff * p.alpha;
            data[idx] = Math.min(255, data[idx] + rgb.r * alpha);
            data[idx + 1] = Math.min(255, data[idx + 1] + rgb.g * alpha);
            data[idx + 2] = Math.min(255, data[idx + 2] + rgb.b * alpha);
            data[idx + 3] = 255;
          }
        }
      }
    }
  }

  return imageData;
}

/**
 * Anti-aliased line drawing
 */
function drawLineAA(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x0: number, y0: number,
  x1: number, y1: number,
  r: number, g: number, b: number,
  alpha: number
) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    const ix = Math.floor(x0);
    const iy = Math.floor(y0);
    if (ix >= 0 && ix < width && iy >= 0 && iy < height) {
      const idx = (iy * width + ix) * 4;
      data[idx] = Math.min(255, data[idx] + r * alpha);
      data[idx + 1] = Math.min(255, data[idx + 1] + g * alpha);
      data[idx + 2] = Math.min(255, data[idx + 2] + b * alpha);
      data[idx + 3] = 255;
    }

    if (Math.abs(x0 - x1) < 0.5 && Math.abs(y0 - y1) < 0.5) break;
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
 * Update particle physics
 */
export function updateParticles(
  particles: Particle[],
  width: number,
  height: number,
  params: ParticleParams
): void {
  for (const p of particles) {
    // Apply gravity
    p.vy += params.gravity * 0.1;

    // Limit speed
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > params.maxSpeed) {
      p.vx = (p.vx / speed) * params.maxSpeed;
      p.vy = (p.vy / speed) * params.maxSpeed;
    }

    // Update position
    p.x += p.vx;
    p.y += p.vy;

    // Boundary handling
    if (params.bounce) {
      if (p.x < 0) {
        p.x = 0;
        p.vx *= -0.8;
      } else if (p.x >= width) {
        p.x = width - 1;
        p.vx *= -0.8;
      }
      if (p.y < 0) {
        p.y = 0;
        p.vy *= -0.8;
      } else if (p.y >= height) {
        p.y = height - 1;
        p.vy *= -0.8;
      }
    } else {
      // Wrap around
      if (p.x < 0) p.x = width;
      if (p.x >= width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y >= height) p.y = 0;
    }
  }
}

/**
 * Create particle system visualizer
 */
export function createParticleVisualizer(
  canvas: HTMLCanvasElement,
  params: ParticleParams
): {
  render: () => void;
  updateParams: (p: Partial<ParticleParams>) => void;
  startAnimation: () => void;
  stopAnimation: () => void;
} {
  const ctx = canvas.getContext('2d')!;
  let currentParams = { ...params };
  let particles = createParticles(currentParams.count, canvas.width, canvas.height, currentParams);
  let animationId: number | null = null;

  function render() {
    const imageData = renderParticles(canvas.width, canvas.height, currentParams, particles);
    ctx.putImageData(imageData, 0, 0);
  }

  function animate() {
    updateParticles(particles, canvas.width, canvas.height, currentParams);
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

  function updateParams(p: Partial<ParticleParams>) {
    const needsRecreate = p.count !== undefined && p.count !== currentParams.count;
    currentParams = { ...currentParams, ...p };
    if (needsRecreate) {
      particles = createParticles(currentParams.count, canvas.width, canvas.height, currentParams);
    }
    render();
  }

  return { render, updateParams, startAnimation, stopAnimation };
}