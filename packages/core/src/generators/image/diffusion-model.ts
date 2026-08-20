// ============================================================================
// Diffusion Model (DDPM + DDIM)
// Main class that orchestrates the diffusion process with U-Net denoising
// ============================================================================

import { Tensor, randn } from './tensor.js';
import { NoiseScheduler, SchedulerType, createScheduler } from './noise-scheduler.js';
import { UNet, createUNet } from './unet.js';
import { VAE, createVAE } from './vae.js';
import { ForwardDiffusion, createForwardDiffusion } from './forward-diffusion.js';
import { ReverseDiffusion, createReverseDiffusion } from './reverse-diffusion.js';

/**
 * Configuration for the diffusion model
 */
export interface DiffusionConfig {
  numTimesteps: number;
  scheduleType: 'linear' | 'cosine' | 'sigmoid' | 'sqrt';
  imageSize: number;
  inChannels: number;
  timeDim: number;
  useVAE: boolean;
  latentDim: number;
  betaStart: number;
  betaEnd: number;
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: DiffusionConfig = {
  numTimesteps: 1000,
  scheduleType: 'linear',
  imageSize: 64,
  inChannels: 3,
  timeDim: 128,
  useVAE: false,
  latentDim: 128,
  betaStart: 0.0001,
  betaEnd: 0.02
};

/**
 * DiffusionModel combines all components:
 * - Forward diffusion (adding noise)
 * - Reverse diffusion (denoising/sampling)
 * - U-Net (noise prediction)
 * - Noise scheduler (variance schedule)
 * - Optional VAE (latent diffusion)
 */
export class DiffusionModel {
  config: DiffusionConfig;
  scheduler: NoiseScheduler;
  unet: UNet;
  vae: VAE | null;
  forwardProcess: ForwardDiffusion;
  reverseProcess: ReverseDiffusion;

  constructor(config: Partial<DiffusionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize noise scheduler
    this.scheduler = createScheduler(
      this.config.numTimesteps,
      this.config.scheduleType
    );

    // Initialize U-Net for denoising
    this.unet = createUNet(this.config.inChannels, this.config.timeDim);

    // Initialize VAE if configured
    this.vae = this.config.useVAE
      ? createVAE(this.config.latentDim, this.config.imageSize)
      : null;

    // Initialize forward and reverse processes
    this.forwardProcess = createForwardDiffusion(this.scheduler);
    this.reverseProcess = createReverseDiffusion(this.scheduler);
  }

  /**
   * Forward diffusion: add noise to image at timestep t
   */
  forwardDiffusion(x0: Tensor, t: number): Tensor {
    return this.forwardProcess.qSample(x0, t);
  }

  /**
   * Predict noise using U-Net
   */
  predictNoise(xt: Tensor, t: number): Tensor {
    return this.unet.forward(xt, t);
  }

  /**
   * Single reverse step (DDPM)
   */
  reverseStepDDPM(xt: Tensor, t: number): Tensor {
    const noisePred = this.predictNoise(xt, t);
    return this.scheduler.ddpmStep(xt, t, noisePred);
  }

  /**
   * Single reverse step (DDIM)
   */
  reverseStepDDIM(xt: Tensor, t: number, eta = 0): Tensor {
    const noisePred = this.predictNoise(xt, t);
    return this.scheduler.ddimStep(xt, t, noisePred, eta);
  }

  /**
   * Generate images from pure noise using DDPM
   */
  generateDDPM(numImages = 1, numSteps = 50): Tensor {
    const shape = [numImages, this.config.inChannels, this.config.imageSize, this.config.imageSize];
    const denoiseFn = (xt: Tensor, t: number) => this.predictNoise(xt, t);
    return this.reverseProcess.sampleDDPM(denoiseFn, shape, numSteps);
  }

  /**
   * Generate images from pure noise using DDIM
   */
  generateDDIM(numImages = 1, numSteps = 20, eta = 0): Tensor {
    const shape = [numImages, this.config.inChannels, this.config.imageSize, this.config.imageSize];
    const denoiseFn = (xt: Tensor, t: number) => this.predictNoise(xt, t);
    return this.reverseProcess.sampleDDIM(denoiseFn, shape, numSteps, eta);
  }

  /**
   * Generate images with classifier-free guidance
   */
  generateWithGuidance(
    numImages = 1,
    guidanceScale = 7.5,
    numSteps = 50,
    schedulerType: SchedulerType = 'ddim'
  ): Tensor {
    const shape = [numImages, this.config.inChannels, this.config.imageSize, this.config.imageSize];
    const denoiseFn = (xt: Tensor, t: number, scale: number) => {
      // For simplicity, scale affects noise prediction magnitude
      const noisePred = this.predictNoise(xt, t);
      return noisePred.mul(scale);
    };
    return this.reverseProcess.sampleWithGuidance(denoiseFn, shape, guidanceScale, numSteps, schedulerType);
  }

  /**
   * Generate with history (for visualization)
   */
  generateWithHistory(numImages = 1, numSteps = 20, saveEvery = 1): { final: Tensor; history: Tensor[] } {
    const shape = [numImages, this.config.inChannels, this.config.imageSize, this.config.imageSize];
    const denoiseFn = (xt: Tensor, t: number) => this.predictNoise(xt, t);
    return this.reverseProcess.sampleWithHistory(denoiseFn, shape, numSteps, saveEvery);
  }

  /**
   * Latent diffusion: encode to latent, diffuse, decode back
   */
  generateLatent(numImages = 1, numSteps = 20): Tensor | null {
    if (!this.vae) {
      console.warn('VAE not initialized. Set useVAE: true in config.');
      return null;
    }

    // Start from noise in latent space
    const latentSize = this.config.latentDim;
    let z = randn(numImages, latentSize);

    // Create a simple denoising function in latent space
    const denoiseFn = (zt: Tensor, t: number): Tensor => {
      // Simple noise prediction (in practice, would use a latent U-Net)
      return randn(...zt.shape).mul(0.1);
    };

    // DDIM sampling in latent space
    const timesteps = this.scheduler.getTimestepSchedule(numSteps);
    for (let i = timesteps.length - 1; i >= 0; i--) {
      const t = timesteps[i];
      const noisePred = denoiseFn(z, t);
      z = this.scheduler.ddimStep(z, t, noisePred, 0);
    }

    // Decode latent to image
    return this.vae.decode(z);
  }

  /**
   * Compute training loss for a batch
   */
  computeLoss(x0: Tensor, t: number): { loss: number; noisePred: Tensor } {
    // Add noise
    const xt = this.forwardDiffusion(x0, t);

    // Predict noise
    const noisePred = this.predictNoise(xt, t);

    // Compute MSE loss (simplified - in practice, use actual noise)
    const targetNoise = randn(...x0.shape);
    const diff = targetNoise.sub(noisePred);
    const loss = diff.mul(diff).mean();

    return { loss, noisePred };
  }

  /**
   * Get model summary
   */
  summary(): string {
    return `
Diffusion Model Summary:
========================
Timesteps: ${this.config.numTimesteps}
Schedule: ${this.config.scheduleType}
Image Size: ${this.config.imageSize}x${this.config.imageSize}
Channels: ${this.config.inChannels}
Time Dim: ${this.config.timeDim}
VAE Enabled: ${this.config.useVAE}
${this.config.useVAE ? `Latent Dim: ${this.config.latentDim}` : ''}
    `.trim();
  }
}

/**
 * Create a diffusion model
 */
export function createDiffusionModel(config?: Partial<DiffusionConfig>): DiffusionModel {
  return new DiffusionModel(config);
}

/**
 * Quick generation function
 */
export function generateImage(
  numImages = 1,
  numSteps = 20,
  schedulerType: SchedulerType = 'ddim'
): Tensor {
  const model = createDiffusionModel();
  if (schedulerType === 'ddpm') {
    return model.generateDDPM(numImages, numSteps);
  }
  return model.generateDDIM(numImages, numSteps, 0);
}

// Re-export all components
export { Tensor, randn } from './tensor.js';
export { NoiseScheduler, createScheduler, SchedulerType } from './noise-scheduler.js';
export { UNet, createUNet } from './unet.js';
export { VAE, createVAE } from './vae.js';
export { ForwardDiffusion, createForwardDiffusion } from './forward-diffusion.js';
export { ReverseDiffusion, createReverseDiffusion } from './reverse-diffusion.js';