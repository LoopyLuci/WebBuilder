// ============================================================================
// Reverse Diffusion Process
// Gradually denoises data to generate samples from noise
// ============================================================================

import { Tensor, randn } from './tensor.js';
import { NoiseScheduler, SchedulerType } from './noise-scheduler.js';

/**
 * ReverseDiffusion implements the reverse Markov chain that gradually
 * removes noise to generate samples.
 * 
 * The reverse process is learned by a neural network that predicts
 * either the noise or the mean of the reverse distribution.
 * 
 * p(x_{t-1} | x_t) = N(x_{t-1}; μ_θ(x_t, t), σ²_t * I)
 */
export class ReverseDiffusion {
  scheduler: NoiseScheduler;

  constructor(scheduler: NoiseScheduler) {
    this.scheduler = scheduler;
  }

  /**
   * Single reverse step using DDPM
   * Samples from p(x_{t-1} | x_t) given the predicted noise
   */
  ddpmStep(xt: Tensor, t: number, noisePred: Tensor): Tensor {
    return this.scheduler.ddpmStep(xt, t, noisePred);
  }

  /**
   * Single reverse step using DDIM (deterministic option)
   * Allows for faster sampling with fewer steps
   */
  ddimStep(xt: Tensor, t: number, noisePred: Tensor, eta = 0): Tensor {
    return this.scheduler.ddimStep(xt, t, noisePred, eta);
  }

  /**
   * Full sampling loop
   * Starts from pure noise and iteratively denoises
   */
  sample(
    denoiseFn: (xt: Tensor, t: number) => Tensor,
    shape: number[],
    schedulerType: SchedulerType = 'ddpm',
    numSteps = 50,
    eta = 0
  ): Tensor {
    return this.scheduler.sample(denoiseFn, shape, schedulerType, numSteps, eta);
  }

  /**
   * DDIM sampling with custom timestep spacing
   */
  sampleDDIM(
    denoiseFn: (xt: Tensor, t: number) => Tensor,
    shape: number[],
    numSteps = 20,
    eta = 0,
    timestepSpacing: 'uniform' | 'quadratic' = 'uniform'
  ): Tensor {
    // Create timestep schedule
    const timesteps = this.getTimesteps(numSteps, timestepSpacing);
    
    // Start from pure noise
    let xt = randn(...shape);
    
    // Iterative denoising
    for (let i = timesteps.length - 1; i >= 0; i--) {
      const t = timesteps[i];
      const noisePred = denoiseFn(xt, t);
      
      // DDIM update
      xt = this.ddimStep(xt, t, noisePred, eta);
    }
    
    return xt;
  }

  /**
   * DDPM sampling
   */
  sampleDDPM(
    denoiseFn: (xt: Tensor, t: number) => Tensor,
    shape: number[],
    numSteps = 50
  ): Tensor {
    return this.sample(denoiseFn, shape, 'ddpm', numSteps);
  }

  /**
   * Ancestral sampling with custom guidance
   * Supports classifier-free guidance
   */
  sampleWithGuidance(
    denoiseFn: (xt: Tensor, t: number, guidanceScale: number) => Tensor,
    shape: number[],
    guidanceScale = 7.5,
    numSteps = 50,
    schedulerType: SchedulerType = 'ddim'
  ): Tensor {
    let xt = randn(...shape);
    const timesteps = this.scheduler.getTimestepSchedule(numSteps);
    
    for (let i = timesteps.length - 1; i >= 0; i--) {
      const t = timesteps[i];
      const noisePred = denoiseFn(xt, t, guidanceScale);
      
      if (schedulerType === 'ddpm') {
        xt = this.ddpmStep(xt, t, noisePred);
      } else {
        xt = this.ddimStep(xt, t, noisePred, 0);
      }
    }
    
    return xt;
  }

  /**
   * Generate intermediate sampling states (for visualization)
   */
  sampleWithHistory(
    denoiseFn: (xt: Tensor, t: number) => Tensor,
    shape: number[],
    numSteps = 20,
    saveEvery = 1
  ): { final: Tensor; history: Tensor[] } {
    let xt = randn(...shape);
    const timesteps = this.scheduler.getTimestepSchedule(numSteps);
    const history: Tensor[] = [xt.clone()];
    
    for (let i = timesteps.length - 1; i >= 0; i--) {
      const t = timesteps[i];
      const noisePred = denoiseFn(xt, t);
      xt = this.ddimStep(xt, t, noisePred, 0);
      
      if ((timesteps.length - 1 - i) % saveEvery === 0) {
        history.push(xt.clone());
      }
    }
    
    history.push(xt.clone()); // Final result
    return { final: xt, history };
  }

  /**
   * Compute timesteps with custom spacing
   */
  private getTimesteps(numSteps: number, spacing: 'uniform' | 'quadratic'): number[] {
    const totalSteps = this.scheduler.numTimesteps;
    
    if (spacing === 'uniform') {
      const stepSize = Math.floor(totalSteps / numSteps);
      const timesteps: number[] = [];
      for (let i = totalSteps - 1; i >= 0; i -= stepSize) {
        timesteps.push(i);
      }
      if (timesteps[timesteps.length - 1] !== 0) {
        timesteps.push(0);
      }
      return timesteps;
    } else {
      // Quadratic spacing (more steps near the end)
      const timesteps: number[] = [];
      for (let i = 0; i < numSteps; i++) {
        const t = Math.floor(Math.pow(i / (numSteps - 1), 2) * totalSteps);
        timesteps.unshift(totalSteps - 1 - t);
      }
      if (timesteps[timesteps.length - 1] !== 0) {
        timesteps.push(0);
      }
      return timesteps;
    }
  }
}

/**
 * Create a reverse diffusion process
 */
export function createReverseDiffusion(scheduler: NoiseScheduler): ReverseDiffusion {
  return new ReverseDiffusion(scheduler);
}

/**
 * Utility function for sampling with a simple noise predictor
 */
export function sampleWithRandomNoise(
  shape: number[],
  numSteps = 20,
  scheduler?: NoiseScheduler
): Tensor {
  const sched = scheduler || new NoiseScheduler(1000, 'linear');
  const reverse = new ReverseDiffusion(sched);
  
  // Simple denoising function (random walk)
  const denoiseFn = (xt: Tensor, _t: number): Tensor => {
    return randn(...xt.shape).mul(0.1);
  };
  
  return reverse.sampleDDIM(denoiseFn, shape, numSteps, 0);
}