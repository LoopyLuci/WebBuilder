// ============================================================================
// WebBuilder Core — Type Definitions
// Complete type system for the agentic web building platform
// ============================================================================

// ─── Primitive Types ────────────────────────────────────────────────────────

export type ID = string;
export type Timestamp = string; // ISO 8601
export type SemanticVersion = string;
export type URL = string;
export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

// ─── Constraint System ──────────────────────────────────────────────────────

export type ConstraintType =
  | 'budget'
  | 'timeline'
  | 'tech-stack'
  | 'accessibility'
  | 'performance'
  | 'security'
  | 'seo'
  | 'browser-support'
  | 'custom';

export interface Constraint {
  id: ID;
  type: ConstraintType;
  name: string;
  description: string;
  value: JSONValue;
  priority: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

// ─── Reference System ───────────────────────────────────────────────────────

export type ReferenceType = 'url' | 'image' | 'document' | 'component' | 'design';

export interface Reference {
  id: ID;
  type: ReferenceType;
  url?: URL;
  description: string;
  tags: string[];
  extractedPatterns?: DesignPattern[];
}

export interface DesignPattern {
  id: ID;
  name: string;
  category: 'layout' | 'typography' | 'color' | 'interaction' | 'animation';
  description: string;
  cssProperties: Record<string, string>;
}

// ─── Intent System ──────────────────────────────────────────────────────────

export interface Intent {
  id: ID;
  description: string;
  goals: string[];
  constraints: Constraint[];
  references: Reference[];
  audience: string;
  purpose: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ParsedIntent {
  intent: Intent;
  spec: Partial<ProjectSpec>;
  clarificationsNeeded: ClarificationQuestion[];
  confidence: number;
}

export interface ClarificationQuestion {
  id: ID;
  question: string;
  options?: string[];
  category: string;
  required: boolean;
}

// ─── Project Specification ──────────────────────────────────────────────────

export interface ProjectSpec {
  id: ID;
  version: SemanticVersion;
  name: string;
  description: string;
  intent: Intent;
  structure: PageMap;
  design: DesignSystem;
  functionality: FeatureSet;
  deployment: DeploymentConfig;
  metadata: ProjectMetadata;
}

export interface ProjectMetadata {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: ID;
  agents: AgentContribution[];
  version: SemanticVersion;
  tags: string[];
}

export interface AgentContribution {
  agentId: ID;
  agentType: string;
  action: string;
  timestamp: Timestamp;
  details: string;
}

// ─── Page Map ───────────────────────────────────────────────────────────────

export interface PageMap {
  pages: Page[];
  navigation: NavigationItem[];
  globals: GlobalSection[];
}

export interface Page {
  id: ID;
  name: string;
  path: string;
  title: string;
  description: string;
  sections: Section[];
  meta: PageMeta;
  layout?: string;
}

export interface Section {
  id: ID;
  name: string;
  component: ID;
  props: Record<string, JSONValue>;
  children: Section[];
  responsive: Record<string, string>;
}

export interface PageMeta {
  title: string;
  description: string;
  ogImage?: URL;
  keywords: string[];
  canonical?: URL;
  noIndex: boolean;
}

export interface NavigationItem {
  id: ID;
  label: string;
  path: string;
  children: NavigationItem[];
  external: boolean;
}

export interface GlobalSection {
  id: ID;
  name: string;
  component: ID;
  position: 'header' | 'footer' | 'sidebar';
  pages: string[] | 'all';
}

// ─── Design System ──────────────────────────────────────────────────────────

export interface DesignSystem {
  id: ID;
  name: string;
  tokens: DesignTokens;
  themes: Theme[];
  responsive: ResponsiveConfig;
  animations: AnimationLibrary;
  typography: TypographySystem;
  color: ColorSystem;
  spacing: SpacingSystem;
  elevation: ElevationSystem;
  motion: MotionSystem;
}

export interface DesignTokens {
  colors: TokenSet;
  fonts: TokenSet;
  spacing: TokenSet;
  sizing: TokenSet;
  borders: TokenSet;
  shadows: TokenSet;
  radii: TokenSet;
  opacity: TokenSet;
  semantic: SemanticTokens;
  components: Record<ID, TokenSet>;
}

export interface TokenSet {
  [key: string]: TokenValue;
}

export interface TokenValue {
  value: string;
  type: 'color' | 'dimension' | 'font' | 'number' | 'string' | 'boolean';
  description: string;
  ref?: string; // Reference to another token
}

export interface SemanticTokens {
  primary: TokenReference;
  secondary: TokenReference;
  success: TokenReference;
  warning: TokenReference;
  error: TokenReference;
  info: TokenReference;
  surface: TokenReference;
  text: TokenReference;
  background: TokenReference;
}

export interface TokenReference {
  value: string;
  description: string;
}

export interface Theme {
  id: ID;
  name: string;
  mode: 'light' | 'dark' | 'high-contrast';
  tokens: Partial<DesignTokens>;
  default: boolean;
}

export interface ResponsiveConfig {
  breakpoints: Breakpoint[];
  defaultBreakpoint: string;
  strategy: 'mobile-first' | 'desktop-first';
}

export interface Breakpoint {
  name: string;
  minWidth?: number;
  maxWidth?: number;
  baseFontSize?: number;
}

export interface AnimationLibrary {
  presets: AnimationPreset[];
  transitions: TransitionPreset[];
  keyframes: KeyframeSet[];
}

export interface AnimationPreset {
  id: ID;
  name: string;
  duration: string;
  easing: string;
  properties: Record<string, string>;
}

export interface TransitionPreset {
  id: ID;
  name: string;
  property: string;
  duration: string;
  easing: string;
}

export interface KeyframeSet {
  id: ID;
  name: string;
  keyframes: { offset: number; properties: Record<string, string> }[];
}

export interface TypographySystem {
  fontFamilies: FontFamily[];
  fontSizes: TypeScale;
  fontWeights: Record<string, number>;
  lineHeights: Record<string, number>;
  letterSpacings: Record<string, string>;
  textStyles: TextStyle[];
}

export interface FontFamily {
  name: string;
  family: string;
  fallback: string[];
  category: 'serif' | 'sans-serif' | 'monospace' | 'display';
}

export interface TypeScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

export interface TextStyle {
  id: ID;
  name: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
  textTransform?: string;
}

export interface ColorSystem {
  palette: ColorPalette;
  gradients: GradientSet[];
}

export interface ColorPalette {
  [name: string]: ColorShades;
}

export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface GradientSet {
  id: ID;
  name: string;
  type: 'linear' | 'radial' | 'conic';
  stops: { color: string; position: number }[];
  angle?: number;
}

export interface SpacingSystem {
  scale: Record<string, string>;
  grid: GridConfig;
}

export interface GridConfig {
  columns: number;
  gutter: string;
  margin: string;
  maxWidth: string;
}

export interface ElevationSystem {
  levels: ElevationLevel[];
}

export interface ElevationLevel {
  name: string;
  shadow: string;
  zIndex: number;
}

export interface MotionSystem {
  duration: Record<string, string>;
  easing: Record<string, string>;
  spring: Record<string, SpringConfig>;
}

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

// ─── Feature Set ────────────────────────────────────────────────────────────

export interface FeatureSet {
  features: Feature[];
  integrations: Integration[];
  workflows: WorkflowDefinition[];
  dataModels: DataModel[];
}

export interface Feature {
  id: ID;
  name: string;
  description: string;
  type: 'ui' | 'logic' | 'data' | 'auth' | 'payment' | 'analytics' | 'custom';
  component?: ID;
  props: Record<string, JSONValue>;
  enabled: boolean;
  dependencies: ID[];
}

export interface Integration {
  id: ID;
  name: string;
  type: 'api' | 'database' | 'auth' | 'payment' | 'analytics' | 'storage' | 'email' | 'search';
  provider: string;
  config: Record<string, JSONValue>;
  enabled: boolean;
}

export interface WorkflowDefinition {
  id: ID;
  name: string;
  description: string;
  trigger: Trigger;
  steps: WorkflowStep[];
  errorHandling: ErrorStrategy;
  retryPolicy?: RetryPolicy;
}

export interface Trigger {
  type: 'event' | 'schedule' | 'manual' | 'webhook' | 'condition';
  config: Record<string, JSONValue>;
}

export interface WorkflowStep {
  id: ID;
  name: string;
  action: string;
  config: Record<string, JSONValue>;
  onError?: string; // Step ID to go to on error
}

export interface ErrorStrategy {
  type: 'stop' | 'continue' | 'retry' | 'fallback';
  fallbackStep?: string;
  notifyOnError: boolean;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoff: 'linear' | 'exponential';
  initialDelay: number;
  maxDelay: number;
}

export interface DataModel {
  id: ID;
  name: string;
  fields: DataField[];
  relationships: Relationship[];
}

export interface DataField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'reference';
  required: boolean;
  unique: boolean;
  defaultValue?: JSONValue;
  validation?: FieldValidation;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface Relationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  model: ID;
  field: string;
}

// ─── Deployment Config ──────────────────────────────────────────────────────

export type DeploymentTarget = 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure' | 'cloudflare' | 'custom' | 'docker';
export type DeploymentEnvironment = 'development' | 'staging' | 'production';

export interface DeploymentConfig {
  target: DeploymentTarget;
  domain?: string;
  environment: DeploymentEnvironment;
  scaling: ScalingConfig;
  cdn: CDNConfig;
  ssl: SSLConfig;
  monitoring: MonitoringConfig;
  rollback: RollbackConfig;
  preview: PreviewConfig;
  envVars: EnvVar[];
  buildCommand?: string;
  outputDir?: string;
  // Additional fields for deployment adapters
  name?: string;
  files?: { path: string; content: string }[];
  gitSource?: { type: string; repo: string; branch?: string };
  framework?: string;
  installCommand?: string;
  branch?: string;
}

export interface ScalingConfig {
  minInstances: number;
  maxInstances: number;
  autoScale: boolean;
  targetCPU?: number;
  targetMemory?: number;
}

export interface CDNConfig {
  enabled: boolean;
  provider?: string;
  caching: CacheConfig;
}

export interface CacheConfig {
  staticAssets: string;
  html: string;
  api: string;
}

export interface SSLConfig {
  enabled: boolean;
  provider?: 'lets-encrypt' | 'custom';
  certPath?: string;
  keyPath?: string;
}

export interface MonitoringConfig {
  enabled: boolean;
  provider?: string;
  uptimeChecks: boolean;
  alerting: AlertConfig[];
}

export interface AlertConfig {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  target: string;
  conditions: string[];
}

export interface RollbackConfig {
  enabled: boolean;
  automaticOnFailure: boolean;
  maxVersions: number;
}

export interface PreviewConfig {
  enabled: boolean;
  autoDeleteDays: number;
  requireAuth: boolean;
}

export interface EnvVar {
  key: string;
  value: string;
  isSecret: boolean;
  environments: DeploymentEnvironment[];
  target?: string[];
}

// ─── Component System ───────────────────────────────────────────────────────

export type Framework = 'react' | 'vue' | 'svelte' | 'angular' | 'vanilla' | 'solid' | 'qwik';

export interface Component {
  id: ID;
  name: string;
  description: string;
  version: SemanticVersion;
  spec: ComponentSpec;
  implementations: Partial<Record<Framework, FrameworkImplementation>>;
  props: PropSchema[];
  slots: SlotSchema[];
  events: EventSchema[];
  styles: StyleSchema;
  accessibility: A11ySchema;
  performance: PerformanceMetrics;
  dependencies: Dependency[];
  extensions: ExtensionPoint[];
}

export interface ComponentSpec {
  atomic: boolean;
  composite: boolean;
  pattern: boolean;
  template: boolean;
  category: ComponentCategory;
  tags: string[];
}

export type ComponentCategory =
  | 'layout'
  | 'navigation'
  | 'form'
  | 'display'
  | 'feedback'
  | 'data'
  | 'interactive'
  | 'media'
  | 'composite'
  | 'template'
  | 'page';

export interface FrameworkImplementation {
  code: string;
  styles: string;
  tests: string;
  stories: string;
  dependencies: Dependency[];
}

export interface PropSchema {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: JSONValue;
  options?: string[];
  validation?: PropValidation;
}

export interface PropValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface SlotSchema {
  name: string;
  description: string;
  required: boolean;
  allowedComponents?: ID[];
}

export interface EventSchema {
  name: string;
  description: string;
  payload: string;
  bubbles: boolean;
  cancelable: boolean;
}

export interface StyleSchema {
  base: string;
  variants: StyleVariant[];
  responsive: Record<string, string>;
}

export interface StyleVariant {
  name: string;
  props: Record<string, string>;
  styles: string;
}

export interface A11ySchema {
  role?: string;
  label?: string;
  describedBy?: string;
  keyboardNavigation: boolean;
  ariaProps: Record<string, string>;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

export interface PerformanceMetrics {
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  reRenderCost: 'low' | 'medium' | 'high';
}

export interface Dependency {
  name: string;
  version: string;
  type: 'dependency' | 'peerDependency' | 'devDependency';
}

export interface ExtensionPoint {
  id: ID;
  name: string;
  type: 'hook' | 'slot' | 'prop' | 'style' | 'action';
  description: string;
}

// ─── Context System ─────────────────────────────────────────────────────────

export interface ProjectContext {
  id: ID;
  currentState: ProjectSpec;
  history: ContextSnapshot[];
  agentMemory: Map<ID, AgentContext>;
  externalContext: ExternalResource[];
  userPreferences: UserPreferenceModel;
  sessions: Session[];
}

export interface ContextSnapshot {
  id: ID;
  timestamp: Timestamp;
  spec: ProjectSpec;
  change: ChangeSet;
  agent?: ID;
}

export interface AgentContext {
  agentId: ID;
  agentType: string;
  knowledge: Map<string, JSONValue>;
  tasks: Task[];
  preferences: Record<string, unknown>;
}

export interface ExternalResource {
  id: ID;
  type: 'api' | 'library' | 'documentation' | 'asset';
  url: URL;
  description: string;
  metadata: Record<string, JSONValue>;
}

export interface UserPreferenceModel {
  stylePreferences: StylePreferences;
  componentPreferences: string[];
  frameworkPreference?: Framework;
  deploymentPreference?: DeploymentTarget;
  colorScheme: 'light' | 'dark' | 'system';
  animationsEnabled: boolean;
  reducedMotion: boolean;
}

export interface StylePreferences {
  colorPalette?: string;
  fontPreference?: string;
  borderRadius?: string;
  density: 'compact' | 'comfortable' | 'spacious';
}

export interface Session {
  id: ID;
  startedAt: Timestamp;
  endedAt?: Timestamp;
  agent: ID;
  actions: string[];
}

// ─── Change System ──────────────────────────────────────────────────────────

export interface ChangeSet {
  id: ID;
  timestamp: Timestamp;
  author: ID;
  description: string;
  files: FileChange[];
  type: 'create' | 'update' | 'delete' | 'refactor' | 'optimize' | 'fix';
}

export interface FileChange {
  path: string;
  content: string;
  action: 'create' | 'update' | 'delete';
  previousContent?: string;
}

// ─── Task System ────────────────────────────────────────────────────────────

export interface Task {
  id: ID;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  dueAt?: Timestamp;
  dependencies: ID[];
  result?: TaskResult;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskResult {
  success: boolean;
  output: string;
  artifacts: string[];
  metrics: Record<string, number>;
}

// ─── Testing System ─────────────────────────────────────────────────────────

export interface TestSuite {
  id: ID;
  name: string;
  tests: Test[];
  coverage: Coverage;
}

export interface Test {
  id: ID;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'visual' | 'a11y' | 'performance';
  component?: ID;
  code: string;
  status: TestStatus;
}

export type TestStatus = 'passing' | 'failing' | 'skipped' | 'pending';

export interface Coverage {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

// ─── Performance Budgets ────────────────────────────────────────────────────

export interface PerformanceBudgets {
  LCP: string;
  FID: string;
  CLS: string;
  TTFB: string;
  FCP: string;
  TTI: string;
  TBT: string;
  initialJS: string;
  totalJS: string;
  css: string;
  images: string;
  fonts: string;
}

// ─── Security Config ────────────────────────────────────────────────────────

export interface SecurityConfig {
  csp: CSPConfig;
  auth: AuthConfig;
  encryption: EncryptionConfig;
  api: APISecurityConfig;
  dependencies: DependencySecurityConfig;
}

export interface CSPConfig {
  defaultSrc: string[];
  scriptSrc: string[];
  styleSrc: string[];
  imgSrc: string[];
  connectSrc: string[];
  fontSrc: string[];
}

export interface AuthConfig {
  provider: string;
  mfa: boolean;
  sessionTimeout: number;
  refreshToken: boolean;
}

export interface EncryptionConfig {
  atRest: boolean;
  inTransit: boolean;
  algorithm?: string;
}

export interface APISecurityConfig {
  rateLimit: number;
  cors: string[];
  inputValidation: boolean;
  outputEncoding: boolean;
}

export interface DependencySecurityConfig {
  autoUpdate: boolean;
  vulnerabilityScanning: boolean;
  licenseCompliance: boolean;
}

// ─── Plugin System ──────────────────────────────────────────────────────────

export interface Plugin {
  id: ID;
  name: string;
  version: SemanticVersion;
  description: string;
  author: string;
  hooks: PluginHooks;
  tools: PluginTool[];
  components: ID[];
  templates: ID[];
  themes: ID[];
  workflows: ID[];
}

export interface PluginHooks {
  onProjectCreate?: string;
  onComponentAdd?: string;
  onBuildStart?: string;
  onBuildEnd?: string;
  onDeploy?: string;
  onTestRun?: string;
}

export interface PluginTool {
  name: string;
  description: string;
  inputSchema: Record<string, JSONValue>;
  handler: string;
}

// ─── Agent System ───────────────────────────────────────────────────────────

export type AgentType = 'designer' | 'developer' | 'tester' | 'optimizer' | 'deployer' | 'orchestrator' | 'custom';

export interface Agent {
  id: ID;
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  tools: string[];
  model?: string;
  status: AgentStatus;
}

export type AgentStatus = 'idle' | 'working' | 'waiting' | 'error' | 'offline';

export interface AgentMessage {
  id: ID;
  from: ID;
  to: ID;
  type: 'task' | 'result' | 'question' | 'feedback' | 'delegation';
  content: JSONValue;
  timestamp: Timestamp;
}

// ─── Marketplace ────────────────────────────────────────────────────────────

export interface MarketplaceItem {
  id: ID;
  type: 'component' | 'template' | 'theme' | 'plugin' | 'integration';
  name: string;
  description: string;
  author: string;
  version: SemanticVersion;
  downloads: number;
  rating: number;
  reviews: Review[];
  price: number;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Review {
  id: ID;
  author: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}

// ─── Observability ──────────────────────────────────────────────────────────

export interface ObservabilityConfig {
  performance: PerformanceObservability;
  analytics: AnalyticsConfig;
  logging: LoggingConfig;
  alerts: AlertConfig[];
  feedback: FeedbackConfig;
}

export interface PerformanceObservability {
  coreWebVitals: boolean;
  realUserMetrics: boolean;
  syntheticMonitoring: boolean;
}

export interface AnalyticsConfig {
  privacy: 'none' | 'minimal' | 'full';
  trackEvents: boolean;
  trackErrors: boolean;
  trackUsage: boolean;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  destination: string[];
  retention: string;
}

export interface FeedbackConfig {
  enabled: boolean;
  prompt: string;
  categories: string[];
}
