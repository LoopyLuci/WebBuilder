// ============================================================================
// Procedural Generation Visualizer Types
// ============================================================================

export type VisualizationType =
  | 'noise'
  | 'fractal'
  | 'lsystem'
  | 'voronoi'
  | 'flowfield'
  | 'particles';

export type NoiseType = 'perlin' | 'simplex' | 'worley';

export interface NoiseParams {
  type: NoiseType;
  scale: number;
  octaves: number;
  persistence: number;
  lacunarity: number;
  seed: string;
  dimension: '2d' | '3d';
  zOffset: number;
  colorMode: 'grayscale' | 'color' | 'heatmap';
}

export interface FractalParams {
  type: 'mandelbrot' | 'julia';
  maxIterations: number;
  zoom: number;
  centerX: number;
  centerY: number;
  juliaReal: number;
  juliaImag: number;
  colorScheme: 'classic' | 'fire' | 'ocean' | 'neon';
}

export interface LSystemParams {
  axiom: string;
  rules: Record<string, string>;
  iterations: number;
  angle: number;
  lineLength: number;
  lineWidth: number;
  colorMode: 'solid' | 'gradient' | 'depth';
}

export interface VoronoiParams {
  pointCount: number;
  seed: string;
  distanceMetric: 'euclidean' | 'manhattan' | 'chebyshev';
  showPoints: boolean;
  showEdges: boolean;
  colorMode: 'random' | 'distance' | 'cells';
}

export interface FlowFieldParams {
  scale: number;
  seed: string;
  particleCount: number;
  speed: number;
  lineWidth: number;
  fade: number;
  colorMode: 'velocity' | 'position' | 'uniform';
}

export interface ParticleParams {
  count: number;
  maxSpeed: number;
  size: number;
  color: string;
  trail: boolean;
  gravity: number;
  bounce: boolean;
  connectDistance: number;
}

export interface VisualizerState {
  activeType: VisualizationType;
  noise: NoiseParams;
  fractal: FractalParams;
  lsystem: LSystemParams;
  voronoi: VoronoiParams;
  flowfield: FlowFieldParams;
  particles: ParticleParams;
  width: number;
  height: number;
  animate: boolean;
}

export const DEFAULT_NOISE_PARAMS: NoiseParams = {
  type: 'perlin',
  scale: 0.02,
  octaves: 4,
  persistence: 0.5,
  lacunarity: 2.0,
  seed: 'noise-seed',
  dimension: '2d',
  zOffset: 0,
  colorMode: 'grayscale',
};

export const DEFAULT_FRACTAL_PARAMS: FractalParams = {
  type: 'mandelbrot',
  maxIterations: 100,
  zoom: 1,
  centerX: -0.5,
  centerY: 0,
  juliaReal: -0.7,
  juliaImag: 0.27015,
  colorScheme: 'classic',
};

export const DEFAULT_LSYSTEM_PARAMS: LSystemParams = {
  axiom: 'F',
  rules: { F: 'F+F-F-F+F' },
  iterations: 4,
  angle: 90,
  lineLength: 5,
  lineWidth: 1,
  colorMode: 'gradient',
};

export const DEFAULT_VORONOI_PARAMS: VoronoiParams = {
  pointCount: 25,
  seed: 'voronoi-seed',
  distanceMetric: 'euclidean',
  showPoints: true,
  showEdges: true,
  colorMode: 'cells',
};

export const DEFAULT_FLOW_FIELD_PARAMS: FlowFieldParams = {
  scale: 0.01,
  seed: 'flow-seed',
  particleCount: 500,
  speed: 2,
  lineWidth: 1,
  fade: 0.02,
  colorMode: 'velocity',
};

export const DEFAULT_PARTICLE_PARAMS: ParticleParams = {
  count: 100,
  maxSpeed: 3,
  size: 3,
  color: '#3b82f6',
  trail: true,
  gravity: 0,
  bounce: true,
  connectDistance: 0,
};

export const DEFAULT_VISUALIZER_STATE: VisualizerState = {
  activeType: 'noise',
  noise: DEFAULT_NOISE_PARAMS,
  fractal: DEFAULT_FRACTAL_PARAMS,
  lsystem: DEFAULT_LSYSTEM_PARAMS,
  voronoi: DEFAULT_VORONOI_PARAMS,
  flowfield: DEFAULT_FLOW_FIELD_PARAMS,
  particles: DEFAULT_PARTICLE_PARAMS,
  width: 400,
  height: 400,
  animate: true,
};