// ============================================================================
// Procedural Generation Visualizer - Main Component
// Interactive panel with real-time visual controls for procedural generation
// ============================================================================

import type {
  VisualizationType,
  VisualizerState,
  NoiseParams,
  FractalParams,
  LSystemParams,
  VoronoiParams,
  FlowFieldParams,
  ParticleParams,
} from './types.js';
import { DEFAULT_VISUALIZER_STATE } from './types.js';
import { createNoiseVisualizer } from './noise-visualizer.js';
import { createFractalVisualizer } from './fractal-visualizer.js';
import { createLSystemVisualizer } from './lsystem-visualizer.js';
import { createVoronoiVisualizer } from './voronoi-visualizer.js';
import { createFlowFieldVisualizer } from './flowfield-visualizer.js';
import { createParticleVisualizer } from './particle-visualizer.js';

type VisualizerController = {
  render: () => void;
  updateParams: (p: Record<string, unknown>) => void;
  startAnimation?: () => void;
  stopAnimation?: () => void;
};

/**
 * Procedural Generation Visualizer
 * Provides real-time visual controls for procedural generation techniques
 */
export class ProceduralVisualizer {
  private state: VisualizerState;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private controller: VisualizerController | null = null;
  private animationRunning = false;

  constructor(canvas: HTMLCanvasElement, initialState?: Partial<VisualizerState>) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;
    this.state = { ...DEFAULT_VISUALIZER_STATE, ...initialState };
    this.canvas.width = this.state.width;
    this.canvas.height = this.state.height;
    this.setVisualization(this.state.activeType);
  }

  /**
   * Set active visualization type
   */
  setVisualization(type: VisualizationType): void {
    // Stop any running animation
    if (this.controller?.stopAnimation) {
      this.controller.stopAnimation();
    }
    this.animationRunning = false;

    this.state.activeType = type;

    switch (type) {
      case 'noise':
        this.controller = createNoiseVisualizer(this.canvas, this.state.noise);
        break;
      case 'fractal':
        this.controller = createFractalVisualizer(this.canvas, this.state.fractal);
        break;
      case 'lsystem':
        this.controller = createLSystemVisualizer(this.canvas, this.state.lsystem);
        break;
      case 'voronoi':
        this.controller = createVoronoiVisualizer(this.canvas, this.state.voronoi);
        break;
      case 'flowfield':
        this.controller = createFlowFieldVisualizer(this.canvas, this.state.flowfield);
        break;
      case 'particles':
        this.controller = createParticleVisualizer(this.canvas, this.state.particles);
        break;
    }

    this.controller.render();

    if (this.state.animate && this.controller.startAnimation) {
      this.startAnimation();
    }
  }

  /**
   * Update noise parameters
   */
  updateNoiseParams(params: Partial<NoiseParams>): void {
    this.state.noise = { ...this.state.noise, ...params };
    if (this.state.activeType === 'noise') {
      this.controller?.updateParams(params);
    }
  }

  /**
   * Update fractal parameters
   */
  updateFractalParams(params: Partial<FractalParams>): void {
    this.state.fractal = { ...this.state.fractal, ...params };
    if (this.state.activeType === 'fractal') {
      this.controller?.updateParams(params);
    }
  }

  /**
   * Update L-system parameters
   */
  updateLSystemParams(params: Partial<LSystemParams>): void {
    this.state.lsystem = { ...this.state.lsystem, ...params };
    if (this.state.activeType === 'lsystem') {
      this.controller?.updateParams(params);
    }
  }

  /**
   * Update Voronoi parameters
   */
  updateVoronoiParams(params: Partial<VoronoiParams>): void {
    this.state.voronoi = { ...this.state.voronoi, ...params };
    if (this.state.activeType === 'voronoi') {
      this.controller?.updateParams(params);
    }
  }

  /**
   * Update flow field parameters
   */
  updateFlowFieldParams(params: Partial<FlowFieldParams>): void {
    this.state.flowfield = { ...this.state.flowfield, ...params };
    if (this.state.activeType === 'flowfield') {
      this.controller?.updateParams(params);
    }
  }

  /**
   * Update particle parameters
   */
  updateParticleParams(params: Partial<ParticleParams>): void {
    this.state.particles = { ...this.state.particles, ...params };
    if (this.state.activeType === 'particles') {
      this.controller?.updateParams(params);
    }
  }

  /**
   * Set canvas size
   */
  setSize(width: number, height: number): void {
    this.state.width = width;
    this.state.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.setVisualization(this.state.activeType);
  }

  /**
   * Start animation
   */
  startAnimation(): void {
    if (this.controller?.startAnimation) {
      this.controller.startAnimation();
      this.animationRunning = true;
    }
  }

  /**
   * Stop animation
   */
  stopAnimation(): void {
    if (this.controller?.stopAnimation) {
      this.controller.stopAnimation();
      this.animationRunning = false;
    }
  }

  /**
   * Toggle animation
   */
  toggleAnimation(): boolean {
    if (this.animationRunning) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
    return this.animationRunning;
  }

  /**
   * Get current state
   */
  getState(): VisualizerState {
    return { ...this.state };
  }

  /**
   * Get current visualization type
   */
  getActiveType(): VisualizationType {
    return this.state.activeType;
  }

  /**
   * Check if animation is running
   */
  isAnimating(): boolean {
    return this.animationRunning;
  }

  /**
   * Export current visualization as data URL
   */
  exportImage(): string {
    return this.canvas.toDataURL('image/png');
  }

  /**
   * Render a single frame (for static visualizations)
   */
  render(): void {
    this.controller?.render();
  }
}

/**
 * Create a procedural visualizer
 */
export function createProceduralVisualizer(
  canvas: HTMLCanvasElement,
  initialState?: Partial<VisualizerState>
): ProceduralVisualizer {
  return new ProceduralVisualizer(canvas, initialState);
}