// ============================================================================
// Image Generation - Native Diffusion Model with U-Net and VAE
// ============================================================================
// This package provides a complete native implementation of:
// - Forward diffusion process (adding noise)
// - Reverse diffusion process (denoising/sampling)
// - U-Net architecture for noise prediction
// - Noise scheduler (DDPM, DDIM)
// - Variational Autoencoder (VAE) for image compression
// ============================================================================

// Core tensor operations
export { Tensor, zeros, ones, full, randn, randnSeeded, rand, arange, concat, clamp } from './tensor.js';

// Noise scheduler
export { NoiseScheduler, createScheduler } from './noise-scheduler.js';
export type { NoiseScheduleType, SchedulerType } from './noise-scheduler.js';

// Forward diffusion
export { ForwardDiffusion, createForwardDiffusion, demonstrateForwardDiffusion } from './forward-diffusion.js';

// Reverse diffusion
export { ReverseDiffusion, createReverseDiffusion, sampleWithRandomNoise } from './reverse-diffusion.js';

// U-Net architecture
export { UNet, createUNet } from './unet.js';

// Variational Autoencoder
export { VAE, createVAE } from './vae.js';

// Main diffusion model
export { DiffusionModel, createDiffusionModel, generateImage, DEFAULT_CONFIG } from './diffusion-model.js';
export type { DiffusionConfig } from './diffusion-model.js';