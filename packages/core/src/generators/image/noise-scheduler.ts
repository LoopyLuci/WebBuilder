// ============================================================================
// Noise Scheduler
// Manages the noise schedule for diffusion models (DDPM, DDIM)
// ============================================================================

import { Tensor, arange, zeros, ones } from './tensor.js';

/**
 * Noise schedule types
 */
export type NoiseScheduleType = 'linear' | 'cosine' | 'sigmoid' | 'sqrt';

/**
 * Scheduler type for sampling
 */
export type SchedulerType = 'ddpm' | 'ddim';

/**
 * NoiseScheduler manages the variance schedule for the diffusion process.
 * It defines how noise is added during forward diffusion and provides
 * parameters needed for the reverse (denoising) process.
 */
export class NoiseScheduler {
  numTimesteps: number;
  betas: Tensor;
  alphas: Tensor;
  alphasCumprod: Tensor;
  alphasCumprodPrev: Tensor;
  sqrtAlphasCumprod: Tensor;
  sqrtOneMinusAlphasCumprod: Tensor;
  sqrtRecipAlphasCumprod: Tensor;
  posteriorVariance: Tensor;
  scheduleType: NoiseScheduleType;

  constructor(
    numTimesteps = 1000,
    scheduleType: NoiseScheduleType = 'linear',
    betaStart = 0.0001,
    betaEnd = 0.02
  ) {
    this.numTimesteps = numTimesteps;
    this.scheduleType = scheduleType;
    this.betas = this.computeBetas(betaStart, betaEnd);
    this.alphas = this.computeAlphas();
    this.alphasCumprod = this.computeAlphasCumprod();
    this.alphasCumprodPrev = this.computeAlphasCumprodPrev();
    this.sqrtAlphasCumprod = this.alphasCumprod.sqrt();
    this.sqrtOneMinusAlphasCumprod = this.alphasCumprod.mul(-1).add(1).sqrt();
    this.sqrtRecipAlphasCumprod = this.computeSqrtRecipAlphasCumprod();
    this.posteriorVariance = this.computePosteriorVariance();
  }

  /**
   * Compute beta values based on schedule type
   */
  private computeBetas(betaStart: number, betaEnd: number): Tensor {
    switch (this.scheduleType) {
      case 'linear':
        return this.linearSchedule(betaStart, betaEnd);
      case 'cosine':
        return this.cosineSchedule();
      case 'sigmoid':
        return this.sigmoidSchedule(betaStart, betaEnd);
      case 'sqrt':
        return this.sqrtSchedule(betaStart, betaEnd);
      default:
        return this.linearSchedule(betaStart, betaEnd);
    }
  }

  /**
   * Linear beta schedule (original DDPM)
   */
  private linearSchedule(betaStart: number, betaEnd: number): Tensor {
    const data = new Float32Array(this.numTimesteps);
    for (let i = 0; i < this.numTimesteps; i++) {
      data[i] = betaStart + (betaEnd - betaStart) * (i / (this.numTimesteps - 1));
    }
    return new Tensor(data, [this.numTimesteps]);
  }

  /**
   * Cosine beta schedule (improved quality, from "Improved DDPM")
   */
  private cosineSchedule(): Tensor {
    const data = new Float32Array(this.numTimesteps);
    const s = 0.008;
    for (let i = 0; i < this.numTimesteps; i++) {
      const t = (i / this.numTimesteps) + s;
      const f = Math.pow(Math.cos((t / (1 + s)) * Math.PI * 0.5), 2);
      const f0 = Math.pow(Math.cos(s / (1 + s) * Math.PI * 0.5), 2);
      data[i] = Math.min(1 - f / f0, 0.999);
    }
    return new Tensor(data, [this.numTimesteps]);
  }

  /**
   * Sigmoid beta schedule
   */
  private sigmoidSchedule(betaStart: number, betaEnd: number): Tensor {
    const data = new Float32Array(this.numTimesteps);
    for (let i = 0; i < this.numTimesteps; i++) {
      const t = (i / (this.numTimesteps - 1)) * 12 - 6;
      data[i] = betaStart + (betaEnd - betaStart) * (1 / (1 + Math.exp(-t)));
    }
    return new Tensor(data, [this.numTimesteps]);
  }

  /**
   * Square root beta schedule
   */
  private sqrtSchedule(betaStart: number, betaEnd: number): Tensor {
    const data = new Float32Array(this.numTimesteps);
    for (let i = 0; i < this.numTimesteps; i++) {
      const t = i / (this.numTimesteps - 1);
      data[i] = betaStart + (betaEnd - betaStart) * Math.sqrt(t);
    }
    return new Tensor(data, [this.numTimesteps]);
  }

  /**
   * Compute alpha values: alpha = 1 - beta
   */
  private computeAlphas(): Tensor {
    return ones(this.numTimesteps).sub(this.betas);
  }

  /**
   * Compute cumulative product of alphas: ᾱ_t = prod(s=1..t, alpha_s)
   */
  private computeAlphasCumprod(): Tensor {
    const data = new Float32Array(this.numTimesteps);
    let cumprod = 1.0;
    for (let i = 0; i < this.numTimesteps; i++) {
      cumprod *= this.alphas.data[i];
      data[i] = cumprod;
    }
    return new Tensor(data, [this.numTimesteps]);
  }

  /**
   * Compute previous cumulative product (for t-1)
   */
  private computeAlphasCumprodPrev(): Tensor {
    const data = new Float32Array(this.numTimesteps);
    data[0] = 1.0;
    for (let i = 1; i < this.numTimesteps; i++) {
      data[i] = this.alphasCumprod.data[i - 1];
    }
    return new Tensor(data, [this.numTimesteps]);
  }

  /**
   * Compute 1/sqrt(ᾱ_t)
   */
  private computeSqrtRecipAlphasCumprod(): Tensor {
    const data = new Float32Array(this.numTimesteps);
    for (let i = 0; i < this.numTimesteps; i++) {
      data[i] = 1.0 / Math.sqrt(this.alphasCumprod.data[i]);
    }
    return new Tensor(data, [this.numTimesteps]);
  }

  /**
   * Compute posterior variance for the reverse process
   */
  private computePosteriorVariance(): Tensor {
    const data = new Float32Array(this.numTimesteps);
    for (let i = 0; i < this.numTimesteps; i++) {
      const beta = this.betas.data[i];
      const alphaCumprodPrev = this.alphasCumprodPrev.data[i];
      const alphaCumprod = this.alphasCumprod.data[i];
      data[i] = beta * (1 - alphaCumprodPrev) / (1 - alphaCumprod);
    }
    return new Tensor(data, [this.numTimesteps]);
  }

  /**
   * Get value at specific timestep
   */
  getBeta(t: number): number {
    return this.betas.data[t];
  }

  getAlpha(t: number): number {
    return this.alphas.data[t];
  }

  getAlphaCumprod(t: number): number {
    return this.alphasCumprod.data[t];
  }

  getAlphaCumprodPrev(t: number): number {
    return this.alphasCumprodPrev.data[t];
  }

  getSqrtAlphaCumprod(t: number): number {
    return this.sqrtAlphasCumprod.data[t];
  }

  getSqrtOneMinusAlphaCumprod(t: number): number {
    return this.sqrtOneMinusAlphasCumprod.data[t];
  }

  getPosteriorVariance(t: number): number {
    return this.posteriorVariance.data[t];
  }

  /**
   * Add noise to input at timestep t (forward diffusion)
   * x_t = sqrt(ᾱ_t) * x_0 + sqrt(1 - ᾱ_t) * ε
   */
  addNoise(x0: Tensor, t: number, noise: Tensor): Tensor {
    const sqrtAlphaCumprod = this.getSqrtAlphaCumprod(t);
    const sqrtOneMinusAlphaCumprod = this.getSqrtOneMinusAlphaCumprod(t);
    return x0.mul(sqrtAlphaCumprod).add(noise.mul(sqrtOneMinusAlphaCumprod));
  }

  /**
   * Compute the predicted x_0 from predicted noise
   * x_0 = (x_t - sqrt(1 - ᾱ_t) * ε_θ) / sqrt(ᾱ_t)
   */
  predictX0(xt: Tensor, t: number, noisePred: Tensor): Tensor {
    const sqrtAlphaCumprod = this.getSqrtAlphaCumprod(t);
    const sqrtOneMinusAlphaCumprod = this.getSqrtOneMinusAlphaCumprod(t);
    return xt.sub(noisePred.mul(sqrtOneMinusAlphaCumprod)).div(sqrtAlphaCumprod);
  }

  /**
   * DDPM step: sample from p(x_{t-1} | x_t)
   */
  ddpmStep(xt: Tensor, t: number, noisePred: Tensor): Tensor {
    const alpha = this.getAlpha(t);
    const alphaCumprod = this.getAlphaCumprod(t);
    const beta = this.getBeta(t);
    
    // Compute predicted x_0
    const predX0 = this.predictX0(xt, t, noisePred);
    
    // Compute mean of p(x_{t-1} | x_t)
    const mean = xt.sub(noisePred.mul(beta).div(Math.sqrt(1 - alphaCumprod))).mul(Math.sqrt(alpha));
    
    // Add noise (except at t=0)
    if (t === 0) {
      return mean;
    }
    
    const variance = this.getPosteriorVariance(t);
    const noise = randnLike(xt);
    return mean.add(noise.mul(Math.sqrt(variance)));
  }

  /**
   * DDIM step: deterministic sampling
   * x_{t-1} = sqrt(ᾱ_{t-1}) * x_0_pred + sqrt(1 - ᾱ_{t-1} - σ²) * ε_θ + σ * ε
   */
  ddimStep(xt: Tensor, t: number, noisePred: Tensor, eta = 0): Tensor {
    const alphaCumprod = this.getAlphaCumprod(t);
    const alphaCumprodPrev = t > 0 ? this.getAlphaCumprod(t - 1) : 1.0;
    
    // Predicted x_0
    const predX0 = xt.sub(noisePred.mul(Math.sqrt(1 - alphaCumprod))).div(Math.sqrt(alphaCumprod));
    
    // Direction pointing to x_t
    const dirXt = noisePred.mul(Math.sqrt(1 - alphaCumprodPrev - eta * eta * (1 - alphaCumprodPrev)));
    
    // Random noise
    const noise = randnLike(xt);
    const sigma = eta * Math.sqrt((1 - alphaCumprodPrev) / (1 - alphaCumprod)) * Math.sqrt(1 - alphaCumprod / alphaCumprodPrev);
    
    return predX0.mul(Math.sqrt(alphaCumprodPrev)).add(dirXt).add(noise.mul(sigma));
  }

  /**
   * Sample using the scheduler
   */
  sample(
    model: (xt: Tensor, t: number) => Tensor,
    shape: number[],
    schedulerType: SchedulerType = 'ddpm',
    numSteps = 50,
    eta = 0
  ): Tensor {
    // Start from pure noise
    let xt = randn(...shape);
    
    // Create timestep schedule
    const timesteps = this.getTimestepSchedule(numSteps);
    
    for (let i = timesteps.length - 1; i >= 0; i--) {
      const t = timesteps[i];
      
      // Predict noise
      const noisePred = model(xt, t);
      
      // Denoise step
      if (schedulerType === 'ddpm') {
        xt = this.ddpmStep(xt, t, noisePred);
      } else {
        xt = this.ddimStep(xt, t, noisePred, eta);
      }
    }
    
    return xt;
  }

  /**
   * Get evenly spaced timestep schedule
   */
  getTimestepSchedule(numSteps: number): number[] {
    const stepSize = Math.floor(this.numTimesteps / numSteps);
    const timesteps: number[] = [];
    for (let i = this.numTimesteps - 1; i >= 0; i -= stepSize) {
      timesteps.push(i);
    }
    if (timesteps[timesteps.length - 1] !== 0) {
      timesteps.push(0);
    }
    return timesteps;
  }
}

/**
 * Create a noise scheduler
 */
export function createScheduler(
  numTimesteps = 1000,
  scheduleType: NoiseScheduleType = 'linear'
): NoiseScheduler {
  return new NoiseScheduler(numTimesteps, scheduleType);
}

/**
 * Generate random noise with same shape as input
 */
function randnLike(tensor: Tensor): Tensor {
  const data = new Float32Array(tensor.size);
  for (let i = 0; i < tensor.size; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    data[i] = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
  }
  return new Tensor(data, [...tensor.shape]);
}

/**
 * Generate random noise with given shape
 */
function randn(...shape: number[]): Tensor {
  const size = shape.reduce((a, b) => a * b, 1);
  const data = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    data[i] = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
  }
  return new Tensor(data, shape);
}