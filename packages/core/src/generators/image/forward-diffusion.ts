// ============================================================================
// Forward Diffusion Process
// Gradually adds noise to data according to a variance schedule
// ============================================================================

import { Tensor, randn } from './tensor.js';
import { NoiseScheduler } from './noise-scheduler.js';

/**
 * ForwardDiffusion implements the forward Markov chain that gradually
 * adds Gaussian noise to the data over T timesteps.
 * 
 * At each step t:
 *   q(x_t | x_{t-1}) = N(x_t; sqrt(1 - β_t) * x_{t-1}, β_t * I)
 * 
 * Or directly from x_0:
 *   q(x_t | x_0) = N(x_t; sqrt(ᾱ_t) * x_0, (1 - ᾱ_t) * I)
 */
export class ForwardDiffusion {
  scheduler: NoiseScheduler;

  constructor(scheduler: NoiseScheduler) {
    this.scheduler = scheduler;
  }

  /**
   * Sample noisy version of x_0 at timestep t
   * x_t = sqrt(ᾱ_t) * x_0 + sqrt(1 - ᾱ_t) * ε
   * where ε ~ N(0, I)
   */
  qSample(x0: Tensor, t: number, noise?: Tensor): Tensor {
    const eps = noise || randn(...x0.shape);
    return this.scheduler.addNoise(x0, t, eps);
  }

  /**
   * Sample from q(x_t | x_{t-1}) - single step
   * x_t = sqrt(1 - β_t) * x_{t-1} + sqrt(β_t) * ε
   */
  qSampleStep(xPrev: Tensor, t: number): Tensor {
    const beta = this.scheduler.getBeta(t);
    const sqrtBeta = Math.sqrt(beta);
    const sqrtOneMinusBeta = Math.sqrt(1 - beta);
    
    const noise = randn(...xPrev.shape);
    return xPrev.mul(sqrtOneMinusBeta).add(noise.mul(sqrtBeta));
  }

  /**
   * Run the full forward process, returning all intermediate states
   */
  runForward(x0: Tensor, includeAllSteps = false): Tensor | Tensor[] {
    if (!includeAllSteps) {
      const t = this.scheduler.numTimesteps - 1;
      return this.qSample(x0, t);
    }
    
    const allSteps: Tensor[] = [x0.clone()];
    let xt = x0.clone();
    
    for (let t = 1; t < this.scheduler.numTimesteps; t++) {
      xt = this.qSampleStep(xt, t);
      allSteps.push(xt.clone());
    }
    
    return allSteps;
  }

  /**
   * Compute the simplified loss for training (noise prediction)
   * L_simple = ||ε - ε_θ(x_t, t)||²
   */
  computeSimpleLoss(
    noise: Tensor,
    noisePred: Tensor
  ): number {
    const diff = noise.sub(noisePred);
    return diff.mul(diff).mean();
  }

  /**
   * Compute the posterior mean: mean of q(x_{t-1} | x_t, x_0)
   */
  posteriorMean(x0: Tensor, xt: Tensor, t: number): Tensor {
    const alphaCumprod = this.scheduler.getAlphaCumprod(t);
    const alphaCumprodPrev = this.scheduler.getAlphaCumprodPrev(t);
    const beta = this.scheduler.getBeta(t);
    
    const coef1 = Math.sqrt(alphaCumprodPrev) * beta / (1 - alphaCumprod);
    const coef2 = Math.sqrt(this.scheduler.getAlpha(t)) * (1 - alphaCumprodPrev) / (1 - alphaCumprod);
    
    return x0.mul(coef2).add(xt.mul(coef1));
  }
}

/**
 * Create a forward diffusion process
 */
export function createForwardDiffusion(scheduler: NoiseScheduler): ForwardDiffusion {
  return new ForwardDiffusion(scheduler);
}

/**
 * Demonstrate the forward diffusion process
 */
export function demonstrateForwardDiffusion(
  image: Tensor,
  numSteps = 10,
  scheduler?: NoiseScheduler
): Tensor[] {
  const sched = scheduler || new NoiseScheduler(1000, 'linear');
  const forward = new ForwardDiffusion(sched);
  
  const results: Tensor[] = [image.clone()];
  const stepSize = Math.floor(sched.numTimesteps / numSteps);
  
  for (let i = 1; i <= numSteps; i++) {
    const t = i * stepSize;
    const noisy = forward.qSample(image, Math.min(t, sched.numTimesteps - 1));
    results.push(noisy);
  }
  
  return results;
}