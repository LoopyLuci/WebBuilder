// ============================================================================
// U-Net Architecture for Denoising
// Implements the U-Net used in diffusion models for noise prediction
// ============================================================================

import { Tensor, zeros, ones, randn } from './tensor.js';

/**
 * Group normalization layer
 */
class GroupNorm {
  numGroups: number;
  gamma: Tensor;
  beta: Tensor;

  constructor(numChannels: number, numGroups = 8) {
    this.numGroups = numGroups;
    this.gamma = ones(numChannels);
    this.beta = zeros(numChannels);
  }

  forward(x: Tensor): Tensor {
    const shape = x.shape;
    const n = shape[0];
    const c = shape[1];
    const h = shape[2];
    const w = shape[3] || 1;

    // Reshape to (N, numGroups, C//G, H, W)
    const grouped = new Tensor(new Float32Array(x.size), [n, this.numGroups, c / this.numGroups, h, w]);

    // Copy data
    for (let i = 0; i < x.size; i++) {
      grouped.data[i] = x.data[i];
    }

    const result = new Float32Array(x.size);
    const groupSize = c / this.numGroups;

    for (let g = 0; g < this.numGroups; g++) {
      // Compute mean and var for this group
      let sum = 0;
      let count = 0;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < groupSize; j++) {
          for (let y = 0; y < h; y++) {
            for (let z = 0; z < w; z++) {
              const idx = ((i * c + g * groupSize + j) * h + y) * w + z;
              sum += x.data[idx];
              count++;
            }
          }
        }
      }
      const mean = sum / count;

      let varSum = 0;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < groupSize; j++) {
          for (let y = 0; y < h; y++) {
            for (let z = 0; z < w; z++) {
              const idx = ((i * c + g * groupSize + j) * h + y) * w + z;
              const diff = x.data[idx] - mean;
              varSum += diff * diff;
            }
          }
        }
      }
      const variance = varSum / count;

      // Normalize
      const std = Math.sqrt(variance + 1e-5);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < groupSize; j++) {
          for (let y = 0; y < h; y++) {
            for (let z = 0; z < w; z++) {
              const idx = ((i * c + g * groupSize + j) * h + y) * w + z;
              const normalized = (x.data[idx] - mean) / std;
              result[idx] = normalized * this.gamma.data[g * groupSize + j] + this.beta.data[g * groupSize + j];
            }
          }
        }
      }
    }

    return new Tensor(result, shape);
  }
}

/**
 * Convolutional layer
 */
class Conv2d {
  weight: Tensor;
  bias: Tensor;
  kernelSize: number;
  inChannels: number;
  outChannels: number;

  constructor(inChannels: number, outChannels: number, kernelSize = 3) {
    this.inChannels = inChannels;
    this.outChannels = outChannels;
    this.kernelSize = kernelSize;
    const scale = Math.sqrt(2.0 / (inChannels * kernelSize * kernelSize));
    const data = new Float32Array(outChannels * inChannels * kernelSize * kernelSize);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * scale;
    }
    this.weight = new Tensor(data, [outChannels, inChannels, kernelSize, kernelSize]);
    this.bias = zeros(outChannels);
  }

  forward(x: Tensor): Tensor {
    const n = x.shape[0];
    const h = x.shape[2];
    const w = x.shape[3] || 1;
    const k = this.kernelSize;
    const outH = h - k + 1;
    const outW = w - k + 1;

    const result = new Float32Array(n * this.outChannels * outH * outW);

    for (let i = 0; i < n; i++) {
      for (let oc = 0; oc < this.outChannels; oc++) {
        for (let y = 0; y < outH; y++) {
          for (let z = 0; z < outW; z++) {
            let sum = this.bias.data[oc];
            for (let ic = 0; ic < this.inChannels; ic++) {
              for (let ky = 0; ky < k; ky++) {
                for (let kx = 0; kx < k; kx++) {
                  const xIdx = ((i * this.inChannels + ic) * h + y + ky) * w + z + kx;
                  const wIdx = ((oc * this.inChannels + ic) * k + ky) * k + kx;
                  sum += x.data[xIdx] * this.weight.data[wIdx];
                }
              }
            }
            result[((i * this.outChannels + oc) * outH + y) * outW + z] = sum;
          }
        }
      }
    }

    return new Tensor(result, [n, this.outChannels, outH, outW]);
  }
}

/**
 * Residual block with time embedding
 */
class ResBlock {
  conv1: Conv2d;
  conv2: Conv2d;
  norm1: GroupNorm;
  norm2: GroupNorm;
  timeProj: Tensor;
  timeBias: Tensor;
  skipConv: Conv2d | null;

  constructor(inChannels: number, outChannels: number, timeDim: number) {
    this.conv1 = new Conv2d(inChannels, outChannels);
    this.conv2 = new Conv2d(outChannels, outChannels);
    this.norm1 = new GroupNorm(outChannels);
    this.norm2 = new GroupNorm(outChannels);

    // Time embedding projection
    const tData = new Float32Array(timeDim * outChannels);
    const scale = Math.sqrt(2.0 / timeDim);
    for (let i = 0; i < tData.length; i++) {
      tData[i] = (Math.random() * 2 - 1) * scale;
    }
    this.timeProj = new Tensor(tData, [timeDim, outChannels]);
    this.timeBias = zeros(outChannels);

    // Skip connection (if channels differ)
    this.skipConv = inChannels !== outChannels ? new Conv2d(inChannels, outChannels, 1) : null;
  }

  forward(x: Tensor, tEmb: Tensor): Tensor {
    let h = this.norm1.forward(this.conv1.forward(x));
    h = leakyRelu(h, 0.01);

    // Add time embedding
    const n = h.shape[0];
    const c = h.shape[1];
    const hh = h.shape[2];
    const w = h.shape[3] || 1;

    // Project time embedding: (N, timeDim) -> (N, outChannels)
    const tProj = new Float32Array(n * c);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < c; j++) {
        let sum = this.timeBias.data[j];
        for (let k = 0; k < tEmb.shape[1]; k++) {
          sum += tEmb.data[i * tEmb.shape[1] + k] * this.timeProj.data[k * c + j];
        }
        tProj[i * c + j] = sum;
      }
    }

    // Add time embedding to each spatial location
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < c; j++) {
        for (let y = 0; y < hh; y++) {
          for (let z = 0; z < w; z++) {
            h.data[((i * c + j) * hh + y) * w + z] += tProj[i * c + j];
          }
        }
      }
    }

    h = this.norm2.forward(this.conv2.forward(h));
    h = leakyRelu(h, 0.01);

    // Skip connection
    const skip = this.skipConv ? this.skipConv.forward(x) : x;
    return addTensors(skip, h);
  }
}

/**
 * U-Net architecture for denoising in diffusion models
 */
export class UNet {
  timeDim: number;
  timeW1: Tensor;
  timeB1: Tensor;
  timeW2: Tensor;
  timeB2: Tensor;

  // Downsampling
  down1: ResBlock;
  down2: ResBlock;
  down3: ResBlock;

  // Middle
  mid: ResBlock;

  // Upsampling
  up3: ResBlock;
  up2: ResBlock;
  up1: ResBlock;

  // Output
  outConv: Conv2d;

  constructor(inChannels = 3, timeDim = 128) {
    this.timeDim = timeDim;

    // Time embedding MLP
    const t1 = new Float32Array(timeDim * timeDim * 4);
    const t2 = new Float32Array(timeDim * 4 * timeDim);
    for (let i = 0; i < t1.length; i++) t1[i] = (Math.random() * 2 - 1) * 0.02;
    for (let i = 0; i < t2.length; i++) t2[i] = (Math.random() * 2 - 1) * 0.02;
    this.timeW1 = new Tensor(t1, [timeDim, timeDim * 4]);
    this.timeB1 = zeros(timeDim * 4);
    this.timeW2 = new Tensor(t2, [timeDim * 4, timeDim]);
    this.timeB2 = zeros(timeDim);

    // Downsampling blocks
    this.down1 = new ResBlock(inChannels, 64, timeDim);
    this.down2 = new ResBlock(64, 128, timeDim);
    this.down3 = new ResBlock(128, 256, timeDim);

    // Middle block
    this.mid = new ResBlock(256, 256, timeDim);

    // Upsampling blocks (with skip connections)
    this.up3 = new ResBlock(512, 128, timeDim); // 256 + 256 skip
    this.up2 = new ResBlock(256, 64, timeDim);  // 128 + 128 skip
    this.up1 = new ResBlock(128, 64, timeDim);  // 64 + 64 skip

    // Output convolution
    this.outConv = new Conv2d(64, inChannels);
  }

  /**
   * Sinusoidal time embedding
   */
  timeEmbedding(t: number): Tensor {
    const halfDim = this.timeDim / 2;
    const data = new Float32Array(this.timeDim);
    const logBase = Math.log(10000);

    for (let i = 0; i < halfDim; i++) {
      const freq = Math.exp(-logBase * i / (halfDim - 1));
      data[i] = Math.sin(t * freq);
      data[i + halfDim] = Math.cos(t * freq);
    }

    return new Tensor(data, [1, this.timeDim]);
  }

  /**
   * Forward pass through U-Net
   */
  forward(x: Tensor, t: number): Tensor {
    // Time embedding
    let tEmb = this.timeEmbedding(t);
    tEmb = matmulAdd(tEmb, this.timeW1, this.timeB1);
    tEmb = leakyRelu(tEmb, 0.01);
    tEmb = matmulAdd(tEmb, this.timeW2, this.timeB2);

    // Downsampling
    const h1 = this.down1.forward(x, tEmb);
    const h2 = this.down2.forward(h1, tEmb);
    const h3 = this.down3.forward(h2, tEmb);

    // Middle
    let h = this.mid.forward(h3, tEmb);

    // Upsampling with skip connections
    h = this.up1.forward(concatChannels(h, h3), tEmb);
    h = this.up2.forward(concatChannels(h, h2), tEmb);
    h = this.up3.forward(concatChannels(h, h1), tEmb);

    // Output
    return this.outConv.forward(h);
  }
}

/**
 * Create a U-Net model
 */
export function createUNet(inChannels = 3, timeDim = 128): UNet {
  return new UNet(inChannels, timeDim);
}

// Helper functions

function leakyRelu(x: Tensor, alpha: number): Tensor {
  const result = new Float32Array(x.size);
  for (let i = 0; i < x.size; i++) {
    result[i] = x.data[i] > 0 ? x.data[i] : alpha * x.data[i];
  }
  return new Tensor(result, x.shape);
}

function addTensors(a: Tensor, b: Tensor): Tensor {
  const result = new Float32Array(a.size);
  for (let i = 0; i < a.size; i++) {
    result[i] = a.data[i] + b.data[i];
  }
  return new Tensor(result, a.shape);
}

function concatChannels(a: Tensor, b: Tensor): Tensor {
  const n = a.shape[0];
  const cA = a.shape[1];
  const cB = b.shape[1];
  const h = Math.min(a.shape[2], b.shape[2]);
  const w = Math.min(a.shape[3] || 1, b.shape[3] || 1);
  const cTotal = cA + cB;

  const result = new Float32Array(n * cTotal * h * w);

  for (let i = 0; i < n; i++) {
    for (let c = 0; c < cTotal; c++) {
      for (let y = 0; y < h; y++) {
        for (let z = 0; z < w; z++) {
          const srcIdx = c < cA
            ? ((i * cA + c) * a.shape[2] + y) * (a.shape[3] || 1) + z
            : ((i * cB + (c - cA)) * b.shape[2] + y) * (b.shape[3] || 1) + z;
          const dstIdx = ((i * cTotal + c) * h + y) * w + z;
          result[dstIdx] = c < cA ? a.data[srcIdx] : b.data[srcIdx];
        }
      }
    }
  }

  return new Tensor(result, [n, cTotal, h, w]);
}

function matmulAdd(x: Tensor, w: Tensor, b: Tensor): Tensor {
  const n = x.shape[0];
  const inDim = x.shape[1];
  const outDim = w.shape[1];
  const result = new Float32Array(n * outDim);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < outDim; j++) {
      let sum = b.data[j];
      for (let k = 0; k < inDim; k++) {
        sum += x.data[i * inDim + k] * w.data[k * outDim + j];
      }
      result[i * outDim + j] = sum;
    }
  }

  return new Tensor(result, [n, outDim]);
}