// ============================================================================
// Variational Autoencoder (VAE)
// For image compression and generation in diffusion models
// ============================================================================

import { Tensor, zeros, ones, randn } from './tensor.js';

/**
 * VAE Encoder: maps image to latent distribution parameters (mu, logvar)
 */
class Encoder {
  inChannels: number;
  latentDim: number;
  imageSize: number;

  // Convolutional layers
  conv1: { W: Tensor; b: Tensor };
  conv2: { W: Tensor; b: Tensor };
  conv3: { W: Tensor; b: Tensor };
  conv4: { W: Tensor; b: Tensor };

  // Mean and log-variance heads
  fcMu: { W: Tensor; b: Tensor };
  fcLogvar: { W: Tensor; b: Tensor };

  flatSize: number;

  constructor(inChannels = 3, latentDim = 128, imageSize = 64) {
    this.inChannels = inChannels;
    this.latentDim = latentDim;
    this.imageSize = imageSize;

    // Convolutional layers (stride 2 for downsampling)
    this.conv1 = this.makeConv(inChannels, 32, 4, 2, 1);
    this.conv2 = this.makeConv(32, 64, 4, 2, 1);
    this.conv3 = this.makeConv(64, 128, 4, 2, 1);
    this.conv4 = this.makeConv(128, 256, 4, 2, 1);

    // Calculate flattened size after 4 stride-2 convolutions
    this.flatSize = 256 * (imageSize / 16) * (imageSize / 16);

    // Mean and log-variance heads
    this.fcMu = this.makeLinear(this.flatSize, latentDim);
    this.fcLogvar = this.makeLinear(this.flatSize, latentDim);
  }

  makeConv(inC: number, outC: number, k: number, s: number, p: number): { W: Tensor; b: Tensor } {
    const scale = Math.sqrt(2.0 / (inC * k * k));
    const data = new Float32Array(outC * inC * k * k);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * scale;
    }
    return {
      W: new Tensor(data, [outC, inC, k, k]),
      b: zeros(outC)
    };
  }

  makeLinear(inF: number, outF: number): { W: Tensor; b: Tensor } {
    const scale = Math.sqrt(2.0 / inF);
    const data = new Float32Array(inF * outF);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * scale;
    }
    return {
      W: new Tensor(data, [inF, outF]),
      b: zeros(outF)
    };
  }

  forward(x: Tensor): { mu: Tensor; logvar: Tensor } {
    // Conv blocks with LeakyReLU
    let h = this.convBlock(x, this.conv1);
    h = this.convBlock(h, this.conv2);
    h = this.convBlock(h, this.conv3);
    h = this.convBlock(h, this.conv4);

    // Flatten
    const n = h.shape[0];
    const flat = new Tensor(new Float32Array(h.size), [n, this.flatSize]);
    for (let i = 0; i < h.size; i++) {
      flat.data[i] = h.data[i];
    }

    // Mean and log-variance
    const mu = this.linearForward(flat, this.fcMu);
    const logvar = this.linearForward(flat, this.fcLogvar);

    return { mu, logvar };
  }

  convBlock(x: Tensor, conv: { W: Tensor; b: Tensor }): Tensor {
    const out = this.conv2d(x, conv.W, conv.b);
    return leakyRelu(out, 0.01);
  }

  conv2d(x: Tensor, W: Tensor, b: Tensor): Tensor {
    const n = x.shape[0];
    const c = x.shape[1];
    const h = x.shape[2];
    const w = x.shape[3] || 1;
    const outC = W.shape[0];
    const k = W.shape[2];
    const outH = h - k + 1;
    const outW = w - k + 1;

    const result = new Float32Array(n * outC * outH * outW);

    for (let i = 0; i < n; i++) {
      for (let oc = 0; oc < outC; oc++) {
        for (let y = 0; y < outH; y++) {
          for (let z = 0; z < outW; z++) {
            let sum = b.data[oc];
            for (let ic = 0; ic < c; ic++) {
              for (let ky = 0; ky < k; ky++) {
                for (let kx = 0; kx < k; kx++) {
                  sum += x.data[((i * c + ic) * h + y + ky) * w + z + kx] *
                         W.data[((oc * c + ic) * k + ky) * k + kx];
                }
              }
            }
            result[((i * outC + oc) * outH + y) * outW + z] = sum;
          }
        }
      }
    }

    return new Tensor(result, [n, outC, outH, outW]);
  }

  linearForward(x: Tensor, layer: { W: Tensor; b: Tensor }): Tensor {
    const n = x.shape[0];
    const inDim = x.shape[1];
    const outDim = layer.W.shape[1];
    const result = new Float32Array(n * outDim);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < outDim; j++) {
        let sum = layer.b.data[j];
        for (let k = 0; k < inDim; k++) {
          sum += x.data[i * inDim + k] * layer.W.data[k * outDim + j];
        }
        result[i * outDim + j] = sum;
      }
    }

    return new Tensor(result, [n, outDim]);
  }

  reparameterize(mu: Tensor, logvar: Tensor): Tensor {
    const std = expTensor(mulScalar(logvar, 0.5));
    const eps = randn(mu.shape[0], mu.shape[1]);
    return addTensors(mu, mulTensors(std, eps));
  }
}

/**
 * VAE Decoder: maps latent vector to image
 */
class Decoder {
  latentDim: number;
  outChannels: number;
  imageSize: number;
  flatSize: number;

  // Project and reshape
  fc: { W: Tensor; b: Tensor };

  // Transposed convolutional layers
  tconv1: { W: Tensor; b: Tensor };
  tconv2: { W: Tensor; b: Tensor };
  tconv3: { W: Tensor; b: Tensor };
  tconv4: { W: Tensor; b: Tensor };

  constructor(latentDim = 128, outChannels = 3, imageSize = 64) {
    this.latentDim = latentDim;
    this.outChannels = outChannels;
    this.imageSize = imageSize;

    this.flatSize = 256 * (imageSize / 16) * (imageSize / 16);

    // Project and reshape
    this.fc = this.makeLinear(latentDim, this.flatSize);

    // Transposed convolutional layers
    this.tconv1 = this.makeTConv(256, 128, 4, 2, 1);
    this.tconv2 = this.makeTConv(128, 64, 4, 2, 1);
    this.tconv3 = this.makeTConv(64, 32, 4, 2, 1);
    this.tconv4 = this.makeTConv(32, outChannels, 4, 2, 1);
  }

  makeLinear(inF: number, outF: number): { W: Tensor; b: Tensor } {
    const scale = Math.sqrt(2.0 / inF);
    const data = new Float32Array(inF * outF);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * scale;
    }
    return {
      W: new Tensor(data, [inF, outF]),
      b: zeros(outF)
    };
  }

  makeTConv(inC: number, outC: number, k: number, s: number, p: number): { W: Tensor; b: Tensor } {
    const scale = Math.sqrt(2.0 / (inC * k * k));
    const data = new Float32Array(inC * outC * k * k);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * scale;
    }
    return {
      W: new Tensor(data, [inC, outC, k, k]),
      b: zeros(outC)
    };
  }

  forward(z: Tensor): Tensor {
    // Project
    let h = this.linearForward(z, this.fc);
    h = leakyRelu(h, 0.01);

    // Reshape
    const n = h.shape[0];
    h = new Tensor(h.data, [n, 256, this.imageSize / 16, this.imageSize / 16]);

    // Transposed conv blocks
    h = this.tconvBlock(h, this.tconv1);
    h = this.tconvBlock(h, this.tconv2);
    h = this.tconvBlock(h, this.tconv3);
    h = this.tconvBlock(h, this.tconv4);

    // Sigmoid output
    return sigmoid(h);
  }

  tconvBlock(x: Tensor, tconv: { W: Tensor; b: Tensor }): Tensor {
    const out = this.tconv2d(x, tconv.W, tconv.b);
    return leakyRelu(out, 0.01);
  }

  tconv2d(x: Tensor, W: Tensor, b: Tensor): Tensor {
    const n = x.shape[0];
    const c = x.shape[1];
    const h = x.shape[2];
    const w = x.shape[3] || 1;
    const inC = W.shape[0];
    const outC = W.shape[1];
    const k = W.shape[2];
    const outH = (h - 1) * 2 + k;
    const outW = (w - 1) * 2 + k;

    const result = new Float32Array(n * outC * outH * outW);

    for (let i = 0; i < n; i++) {
      for (let ic = 0; ic < inC; ic++) {
        for (let y = 0; y < h; y++) {
          for (let z = 0; z < w; z++) {
            for (let oc = 0; oc < outC; oc++) {
              for (let ky = 0; ky < k; ky++) {
                for (let kx = 0; kx < k; kx++) {
                  const outY = y * 2 + ky;
                  const outZ = z * 2 + kx;
                  if (outY < outH && outZ < outW) {
                    result[((i * outC + oc) * outH + outY) * outW + outZ] +=
                      x.data[((i * c + ic) * h + y) * w + z] *
                      W.data[((ic * outC + oc) * k + ky) * k + kx];
                  }
                }
              }
            }
          }
        }
      }
    }

    // Add bias
    for (let i = 0; i < n; i++) {
      for (let oc = 0; oc < outC; oc++) {
        for (let y = 0; y < outH; y++) {
          for (let z = 0; z < outW; z++) {
            result[((i * outC + oc) * outH + y) * outW + z] += b.data[oc];
          }
        }
      }
    }

    return new Tensor(result, [n, outC, outH, outW]);
  }

  linearForward(x: Tensor, layer: { W: Tensor; b: Tensor }): Tensor {
    const n = x.shape[0];
    const inDim = x.shape[1];
    const outDim = layer.W.shape[1];
    const result = new Float32Array(n * outDim);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < outDim; j++) {
        let sum = layer.b.data[j];
        for (let k = 0; k < inDim; k++) {
          sum += x.data[i * inDim + k] * layer.W.data[k * outDim + j];
        }
        result[i * outDim + j] = sum;
      }
    }

    return new Tensor(result, [n, outDim]);
  }
}

/**
 * Variational Autoencoder for image compression and generation
 */
export class VAE {
  encoder: Encoder;
  decoder: Decoder;
  latentDim: number;

  constructor(latentDim = 128, imageSize = 64) {
    this.latentDim = latentDim;
    this.encoder = new Encoder(3, latentDim, imageSize);
    this.decoder = new Decoder(latentDim, 3, imageSize);
  }

  /**
   * Encode image to latent representation
   */
  encode(x: Tensor): Tensor {
    const { mu, logvar } = this.encoder.forward(x);
    return this.encoder.reparameterize(mu, logvar);
  }

  /**
   * Decode latent vector to image
   */
  decode(z: Tensor): Tensor {
    return this.decoder.forward(z);
  }

  /**
   * Generate new images from random latent vectors
   */
  generate(numImages = 1): Tensor {
    const z = randn(numImages, this.latentDim);
    return this.decode(z);
  }

  /**
   * Compute KL divergence loss
   */
  klDivergence(mu: Tensor, logvar: Tensor): number {
    // KL = -0.5 * sum(1 + logvar - mu^2 - exp(logvar))
    let kl = 0;
    for (let i = 0; i < mu.size; i++) {
      kl += 1 + logvar.data[i] - mu.data[i] * mu.data[i] - Math.exp(logvar.data[i]);
    }
    return -0.5 * kl / mu.shape[0];
  }

  /**
   * Compute reconstruction loss (MSE)
   */
  reconstructionLoss(original: Tensor, reconstructed: Tensor): number {
    let loss = 0;
    for (let i = 0; i < original.size; i++) {
      const diff = original.data[i] - reconstructed.data[i];
      loss += diff * diff;
    }
    return loss / original.size;
  }

  /**
   * Full forward pass with loss computation
   */
  forward(x: Tensor): { reconstructed: Tensor; mu: Tensor; logvar: Tensor; loss: number } {
    const { mu, logvar } = this.encoder.forward(x);
    const z = this.encoder.reparameterize(mu, logvar);
    const reconstructed = this.decoder.forward(z);

    const kl = this.klDivergence(mu, logvar);
    const recon = this.reconstructionLoss(x, reconstructed);
    const loss = recon + kl;

    return { reconstructed, mu, logvar, loss };
  }
}

/**
 * Create a VAE model
 */
export function createVAE(latentDim = 128, imageSize = 64): VAE {
  return new VAE(latentDim, imageSize);
}

// Helper functions

function leakyRelu(x: Tensor, alpha: number): Tensor {
  const result = new Float32Array(x.size);
  for (let i = 0; i < x.size; i++) {
    result[i] = x.data[i] > 0 ? x.data[i] : alpha * x.data[i];
  }
  return new Tensor(result, x.shape);
}

function sigmoid(x: Tensor): Tensor {
  const result = new Float32Array(x.size);
  for (let i = 0; i < x.size; i++) {
    result[i] = 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x.data[i]))));
  }
  return new Tensor(result, x.shape);
}

function expTensor(x: Tensor): Tensor {
  const result = new Float32Array(x.size);
  for (let i = 0; i < x.size; i++) {
    result[i] = Math.exp(x.data[i]);
  }
  return new Tensor(result, x.shape);
}

function mulScalar(x: Tensor, scalar: number): Tensor {
  const result = new Float32Array(x.size);
  for (let i = 0; i < x.size; i++) {
    result[i] = x.data[i] * scalar;
  }
  return new Tensor(result, x.shape);
}

function mulTensors(a: Tensor, b: Tensor): Tensor {
  const result = new Float32Array(a.size);
  for (let i = 0; i < a.size; i++) {
    result[i] = a.data[i] * b.data[i];
  }
  return new Tensor(result, a.shape);
}

function addTensors(a: Tensor, b: Tensor): Tensor {
  const result = new Float32Array(a.size);
  for (let i = 0; i < a.size; i++) {
    result[i] = a.data[i] + b.data[i];
  }
  return new Tensor(result, a.shape);
}