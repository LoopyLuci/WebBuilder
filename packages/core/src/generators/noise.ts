// ============================================================================
// Noise Functions
// Perlin noise, Simplex noise, and fractal Brownian motion
// Deterministic noise for procedural generation
// ============================================================================

import { PRNG } from './prng.js';

/**
 * Gradient vectors for 2D Perlin noise
 */
function grad2d(hash: number, x: number, y: number): number {
  const h = hash & 7;
  const u = h < 4 ? x : y;
  const v = h < 4 ? y : x;
  return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
}

/**
 * Quintic interpolation curve (smoother than cubic)
 */
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Linear interpolation
 */
function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

/**
 * Perlin Noise Generator (2D and 3D)
 * Classic Ken Perlin noise implementation
 */
export class PerlinNoise {
  private permutation: number[];
  private p: number[];

  constructor(seed: number | string) {
    const prng = new PRNG(seed);
    this.permutation = [];
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i;
    }
    // Shuffle using Fisher-Yates
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(prng.next() * (i + 1));
      [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
    }
    // Duplicate for overflow
    this.p = [...this.permutation, ...this.permutation];
  }

  /**
   * Generate 2D Perlin noise at (x, y)
   * Returns value in [-1, 1]
   */
  noise2d(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);

    const aa = this.p[this.p[X] + Y];
    const ab = this.p[this.p[X] + Y + 1];
    const ba = this.p[this.p[X + 1] + Y];
    const bb = this.p[this.p[X + 1] + Y + 1];

    const x1 = lerp(grad2d(aa, xf, yf), grad2d(ba, xf - 1, yf), u);
    const x2 = lerp(grad2d(ab, xf, yf - 1), grad2d(bb, xf - 1, yf - 1), u);

    return lerp(x1, x2, v);
  }

  /**
   * Generate 3D Perlin noise at (x, y, z)
   * Returns value in [-1, 1]
   */
  noise3d(x: number, y: number, z: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const zf = z - Math.floor(z);
    const u = fade(xf);
    const v = fade(yf);
    const w = fade(zf);

    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;

    const grad = (hash: number, x: number, y: number, z: number): number => {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };

    return lerp(
      lerp(
        lerp(grad(this.p[AA], xf, yf, zf), grad(this.p[BA], xf - 1, yf, zf), u),
        lerp(grad(this.p[AB], xf, yf - 1, zf), grad(this.p[BB], xf - 1, yf - 1, zf), u),
        w
      ),
      lerp(
        lerp(grad(this.p[AA + 1], xf, yf, zf - 1), grad(this.p[BA + 1], xf - 1, yf, zf - 1), u),
        lerp(grad(this.p[AB + 1], xf, yf - 1, zf - 1), grad(this.p[BB + 1], xf - 1, yf - 1, zf - 1), u),
        w
      ),
      v
    );
  }
}

/**
 * Simplex Noise Generator (2D and 3D)
 * Faster alternative to Perlin with fewer directional artifacts
 */
export class SimplexNoise {
  private perm: number[];
  private permMod12: number[];
  private static readonly F2 = 0.5 * (Math.sqrt(3) - 1);
  private static readonly G2 = (3 - Math.sqrt(3)) / 6;
  private static readonly F3 = 1 / 3;
  private static readonly G3 = 1 / 6;

  constructor(seed: number | string) {
    const prng = new PRNG(seed);
    const p: number[] = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(prng.next() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    this.perm = new Array(512);
    this.permMod12 = new Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  /**
   * Generate 2D Simplex noise at (x, y)
   * Returns value in [-1, 1]
   */
  noise2d(xin: number, yin: number): number {
    const { F2, G2 } = SimplexNoise;
    let n0: number, n1: number, n2: number;

    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1: number, j1: number;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;

    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.permMod12[ii + this.perm[jj]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
    const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) n0 = 0;
    else { t0 *= t0; n0 = t0 * t0 * this.dot2d(gi0, x0, y0); }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) n1 = 0;
    else { t1 *= t1; n1 = t1 * t1 * this.dot2d(gi1, x1, y1); }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) n2 = 0;
    else { t2 *= t2; n2 = t2 * t2 * this.dot2d(gi2, x2, y2); }

    return 70.0 * (n0 + n1 + n2);
  }

  /**
   * Generate 3D Simplex noise at (x, y, z)
   * Returns value in [-1, 1]
   */
  noise3d(xin: number, yin: number, zin: number): number {
    const { F3, G3 } = SimplexNoise;
    let n0: number, n1: number, n2: number, n3: number;

    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);
    const t = (i + j + k) * G3;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    const z0 = zin - Z0;

    let i1: number, j1: number, k1: number;
    let i2: number, j2: number, k2: number;

    if (x0 >= y0) {
      if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
      else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
    } else {
      if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
      else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
      else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    }

    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2.0 * G3;
    const y2 = y0 - j2 + 2.0 * G3;
    const z2 = z0 - k2 + 2.0 * G3;
    const x3 = x0 - 1.0 + 3.0 * G3;
    const y3 = y0 - 1.0 + 3.0 * G3;
    const z3 = z0 - 1.0 + 3.0 * G3;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
    const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
    const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) n0 = 0;
    else { t0 *= t0; n0 = t0 * t0 * this.dot3d(gi0, x0, y0, z0); }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) n1 = 0;
    else { t1 *= t1; n1 = t1 * t1 * this.dot3d(gi1, x1, y1, z1); }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) n2 = 0;
    else { t2 *= t2; n2 = t2 * t2 * this.dot3d(gi2, x2, y2, z2); }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) n3 = 0;
    else { t3 *= t3; n3 = t3 * t3 * this.dot3d(gi3, x3, y3, z3); }

    return 32.0 * (n0 + n1 + n2 + n3);
  }

  private dot2d(gi: number, x: number, y: number): number {
    const grad3 = [
      [1, 1], [-1, 1], [1, -1], [-1, -1],
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [-1, 1], [1, -1], [-1, -1]
    ];
    return grad3[gi][0] * x + grad3[gi][1] * y;
  }

  private dot3d(gi: number, x: number, y: number, z: number): number {
    const grad3 = [
      [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
      [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
      [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];
    return grad3[gi][0] * x + grad3[gi][1] * y + grad3[gi][2] * z;
  }
}

/**
 * Fractal Brownian Motion (fBm)
 * Combines multiple octaves of noise for natural-looking results
 */
export class FractalNoise {
  private noise: PerlinNoise | SimplexNoise;
  private octaves: number;
  private lacunarity: number;
  private persistence: number;

  constructor(
    noise: PerlinNoise | SimplexNoise,
    octaves = 4,
    lacunarity = 2.0,
    persistence = 0.5
  ) {
    this.noise = noise;
    this.octaves = octaves;
    this.lacunarity = lacunarity;
    this.persistence = persistence;
  }

  /**
   * Generate 2D fBm noise
   * Returns value roughly in [-1, 1]
   */
  fbm2d(x: number, y: number): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < this.octaves; i++) {
      value += amplitude * this.sample2d(x * frequency, y * frequency);
      maxValue += amplitude;
      amplitude *= this.persistence;
      frequency *= this.lacunarity;
    }

    return value / maxValue;
  }

  /**
   * Generate 3D fBm noise
   * Returns value roughly in [-1, 1]
   */
  fbm3d(x: number, y: number, z: number): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < this.octaves; i++) {
      value += amplitude * this.sample3d(x * frequency, y * frequency, z * frequency);
      maxValue += amplitude;
      amplitude *= this.persistence;
      frequency *= this.lacunarity;
    }

    return value / maxValue;
  }

  /**
   * Generate turbulence (absolute value fBm) — looks like marble/clouds
   */
  turbulence2d(x: number, y: number): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < this.octaves; i++) {
      value += amplitude * Math.abs(this.sample2d(x * frequency, y * frequency));
      maxValue += amplitude;
      amplitude *= this.persistence;
      frequency *= this.lacunarity;
    }

    return value / maxValue;
  }

  /**
   * Generate ridged noise — looks like mountain ridges
   */
  ridged2d(x: number, y: number): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < this.octaves; i++) {
      const n = 1 - Math.abs(this.sample2d(x * frequency, y * frequency));
      value += amplitude * n * n;
      maxValue += amplitude;
      amplitude *= this.persistence;
      frequency *= this.lacunarity;
    }

    return value / maxValue;
  }

  private sample2d(x: number, y: number): number {
    if (this.noise instanceof PerlinNoise) {
      return this.noise.noise2d(x, y);
    } else {
      return this.noise.noise2d(x, y);
    }
  }

  private sample3d(x: number, y: number, z: number): number {
    if (this.noise instanceof PerlinNoise) {
      return this.noise.noise3d(x, y, z);
    } else {
      return this.noise.noise3d(x, y, z);
    }
  }
}

/**
 * Create a Perlin noise generator
 */
export function createPerlin(seed: number | string): PerlinNoise {
  return new PerlinNoise(seed);
}

/**
 * Create a Simplex noise generator
 */
export function createSimplex(seed: number | string): SimplexNoise {
  return new SimplexNoise(seed);
}

/**
 * Create a fractal noise generator
 */
export function createFractal(
  seed: number | string,
  type: 'perlin' | 'simplex' = 'perlin',
  octaves = 4
): FractalNoise {
  const base = type === 'perlin'
    ? new PerlinNoise(seed)
    : new SimplexNoise(seed);
  return new FractalNoise(base, octaves);
}