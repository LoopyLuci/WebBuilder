// ============================================================================
// Pseudo-Random Number Generator (PRNG)
// Deterministic seed-based random number generation for reproducible outputs
// ============================================================================

/**
 * Seedable PRNG using Mulberry32 algorithm
 * Produces deterministic sequences from a given seed
 */
export class PRNG {
  private state: number;

  constructor(seed: number | string) {
    this.state = typeof seed === 'string' ? PRNG.hashString(seed) : seed;
  }

  /**
   * Hash a string to a 32-bit integer using FNV-1a variant
   */
  static hashString(str: string): number {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  /**
   * Generate next random number in [0, 1) using Mulberry32
   */
  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate random number in [min, max)
   */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generate random integer in [min, max]
   */
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /**
   * Pick a random element from an array
   */
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  /**
   * Pick N random elements from an array
   */
  pickN<T>(arr: T[], n: number): T[] {
    const shuffled = this.shuffle([...arr]);
    return shuffled.slice(0, n);
  }

  /**
   * Shuffle an array in-place using Fisher-Yates
   */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Generate random boolean with given probability
   */
  bool(probability = 0.5): boolean {
    return this.next() < probability;
  }

  /**
   * Generate random sign (-1 or 1)
   */
  sign(): number {
    return this.next() < 0.5 ? -1 : 1;
  }

  /**
   * Get current state (for serialization)
   */
  getState(): number {
    return this.state;
  }

  /**
   * Set current state (for deserialization)
   */
  setState(state: number): void {
    this.state = state;
  }

  /**
   * Fork this PRNG with a new seed derived from current state
   */
  fork(salt?: string): PRNG {
    const newSeed = this.state ^ (salt ? PRNG.hashString(salt) : 0);
    return new PRNG(newSeed);
  }
}

/**
 * Create a PRNG from a seed
 */
export function createPRNG(seed: number | string): PRNG {
  return new PRNG(seed);
}

/**
 * Generate a random seed string
 */
export function generateSeed(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}