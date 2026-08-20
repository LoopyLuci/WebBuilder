// ============================================================================
// Tensor Operations
// Lightweight tensor implementation for diffusion model computations
// ============================================================================

/**
 * Multi-dimensional array with shape tracking
 */
export class Tensor {
  data: Float32Array;
  shape: number[];

  constructor(data: Float32Array, shape: number[]) {
    this.data = data;
    this.shape = shape;
  }

  get size(): number {
    return this.data.length;
  }

  get ndim(): number {
    return this.shape.length;
  }

  /**
   * Get value at indices
   */
  get(...indices: number[]): number {
    let idx = 0;
    let stride = 1;
    for (let i = this.shape.length - 1; i >= 0; i--) {
      idx += indices[i] * stride;
      stride *= this.shape[i];
    }
    return this.data[idx];
  }

  /**
   * Set value at indices
   */
  set(value: number, ...indices: number[]): void {
    let idx = 0;
    let stride = 1;
    for (let i = this.shape.length - 1; i >= 0; i--) {
      idx += indices[i] * stride;
      stride *= this.shape[i];
    }
    this.data[idx] = value;
  }

  /**
   * Reshape tensor (returns view if possible)
   */
  reshape(...shape: number[]): Tensor {
    const newSize = shape.reduce((a, b) => a * b, 1);
    if (newSize !== this.size) {
      throw new Error(`Cannot reshape tensor of size ${this.size} to shape [${shape}]`);
    }
    return new Tensor(this.data, shape);
  }

  /**
   * Clone tensor
   */
  clone(): Tensor {
    return new Tensor(new Float32Array(this.data), [...this.shape]);
  }

  /**
   * Element-wise addition
   */
  add(other: Tensor | number): Tensor {
    if (typeof other === 'number') {
      const result = new Float32Array(this.size);
      for (let i = 0; i < this.size; i++) {
        result[i] = this.data[i] + other;
      }
      return new Tensor(result, [...this.shape]);
    }
    const result = new Float32Array(this.size);
    for (let i = 0; i < this.size; i++) {
      result[i] = this.data[i] + other.data[i];
    }
    return new Tensor(result, [...this.shape]);
  }

  /**
   * Element-wise subtraction
   */
  sub(other: Tensor | number): Tensor {
    if (typeof other === 'number') {
      const result = new Float32Array(this.size);
      for (let i = 0; i < this.size; i++) {
        result[i] = this.data[i] - other;
      }
      return new Tensor(result, [...this.shape]);
    }
    const result = new Float32Array(this.size);
    for (let i = 0; i < this.size; i++) {
      result[i] = this.data[i] - other.data[i];
    }
    return new Tensor(result, [...this.shape]);
  }

  /**
   * Element-wise multiplication
   */
  mul(other: Tensor | number): Tensor {
    if (typeof other === 'number') {
      const result = new Float32Array(this.size);
      for (let i = 0; i < this.size; i++) {
        result[i] = this.data[i] * other;
      }
      return new Tensor(result, [...this.shape]);
    }
    const result = new Float32Array(this.size);
    for (let i = 0; i < this.size; i++) {
      result[i] = this.data[i] * other.data[i];
    }
    return new Tensor(result, [...this.shape]);
  }

  /**
   * Element-wise division
   */
  div(other: Tensor | number): Tensor {
    if (typeof other === 'number') {
      const result = new Float32Array(this.size);
      for (let i = 0; i < this.size; i++) {
        result[i] = this.data[i] / other;
      }
      return new Tensor(result, [...this.shape]);
    }
    const result = new Float32Array(this.size);
    for (let i = 0; i < this.size; i++) {
      result[i] = this.data[i] / other.data[i];
    }
    return new Tensor(result, [...this.shape]);
  }

  /**
   * Element-wise square root
   */
  sqrt(): Tensor {
    const result = new Float32Array(this.size);
    for (let i = 0; i < this.size; i++) {
      result[i] = Math.sqrt(this.data[i]);
    }
    return new Tensor(result, [...this.shape]);
  }

  /**
   * Element-wise exponential
   */
  exp(): Tensor {
    const result = new Float32Array(this.size);
    for (let i = 0; i < this.size; i++) {
      result[i] = Math.exp(this.data[i]);
    }
    return new Tensor(result, [...this.shape]);
  }

  /**
   * Sum all elements
   */
  sum(): number {
    let s = 0;
    for (let i = 0; i < this.size; i++) {
      s += this.data[i];
    }
    return s;
  }

  /**
   * Mean of all elements
   */
  mean(): number {
    return this.sum() / this.size;
  }
}

/**
 * Create a tensor filled with zeros
 */
export function zeros(...shape: number[]): Tensor {
  const size = shape.reduce((a, b) => a * b, 1);
  return new Tensor(new Float32Array(size), shape);
}

/**
 * Create a tensor filled with ones
 */
export function ones(...shape: number[]): Tensor {
  const size = shape.reduce((a, b) => a * b, 1);
  const data = new Float32Array(size).fill(1);
  return new Tensor(data, shape);
}

/**
 * Create a tensor filled with a value
 */
export function full(value: number, ...shape: number[]): Tensor {
  const size = shape.reduce((a, b) => a * b, 1);
  const data = new Float32Array(size).fill(value);
  return new Tensor(data, shape);
}

/**
 * Create a tensor with random values from normal distribution
 */
export function randn(...shape: number[]): Tensor {
  const size = shape.reduce((a, b) => a * b, 1);
  const data = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    data[i] = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
  return new Tensor(data, shape);
}

/**
 * Create a tensor with random values from normal distribution (seeded)
 */
export function randnSeeded(seed: number, ...shape: number[]): Tensor {
  const size = shape.reduce((a, b) => a * b, 1);
  const data = new Float32Array(size);
  let state = seed;
  for (let i = 0; i < size; i++) {
    // Simple LCG for seeding
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    const u1 = (state >>> 0) / 4294967296;
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    const u2 = (state >>> 0) / 4294967296;
    data[i] = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
  }
  return new Tensor(data, shape);
}

/**
 * Create a tensor with random values from uniform distribution
 */
export function rand(...shape: number[]): Tensor {
  const size = shape.reduce((a, b) => a * b, 1);
  const data = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    data[i] = Math.random();
  }
  return new Tensor(data, shape);
}

/**
 * Create a range tensor
 */
export function arange(start: number, end: number, step = 1): Tensor {
  const size = Math.floor((end - start) / step);
  const data = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    data[i] = start + i * step;
  }
  return new Tensor(data, [size]);
}

/**
 * Concatenate tensors along an axis
 */
export function concat(tensors: Tensor[], axis = 0): Tensor {
  const shape = [...tensors[0].shape];
  const totalSize = tensors.reduce((sum, t) => sum + t.shape[axis], 0);
  shape[axis] = totalSize;
  
  const result = zeros(...shape);
  let offset = 0;
  
  for (const t of tensors) {
    const sliceSize = t.shape[axis];
    // Copy data along axis
    copyAlongAxis(result, t, axis, offset);
    offset += sliceSize;
  }
  
  return result;
}

function copyAlongAxis(dest: Tensor, src: Tensor, axis: number, offset: number): void {
  const destStrides = computeStrides(dest.shape);
  const srcStrides = computeStrides(src.shape);
  const destShape = dest.shape;
  const srcShape = src.shape;
  
  const indices = new Array(dest.ndim).fill(0);
  let srcIdx = 0;
  let destIdx = offset * destStrides[axis];
  
  function copy(dim: number): void {
    if (dim === dest.ndim) {
      dest.data[destIdx] = src.data[srcIdx];
      return;
    }
    for (let i = 0; i < srcShape[dim]; i++) {
      indices[dim] = i;
      const sIdx = srcIdx + i * srcStrides[dim];
      const dIdx = destIdx + (dim === axis ? offset : i) * destStrides[dim];
      const prevSrc = srcIdx;
      const prevDest = destIdx;
      srcIdx = sIdx;
      destIdx = dIdx;
      copy(dim + 1);
      srcIdx = prevSrc;
      destIdx = prevDest;
    }
  }
  
  copy(0);
}

function computeStrides(shape: number[]): number[] {
  const strides = new Array(shape.length);
  let stride = 1;
  for (let i = shape.length - 1; i >= 0; i--) {
    strides[i] = stride;
    stride *= shape[i];
  }
  return strides;
}

/**
 * Element-wise clamp
 */
export function clamp(tensor: Tensor, min: number, max: number): Tensor {
  const result = new Float32Array(tensor.size);
  for (let i = 0; i < tensor.size; i++) {
    result[i] = Math.max(min, Math.min(max, tensor.data[i]));
  }
  return new Tensor(result, [...tensor.shape]);
}