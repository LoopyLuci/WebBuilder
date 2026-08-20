// WebBuilder Core Types
// Comprehensive type system for the entire platform

export enum Platform {
  WEB = 'web', IOS = 'ios', ANDROID = 'android', DESKTOP = 'desktop', CLI = 'cli', PWA = 'pwa',
  EXTENSION = 'extension', H5 = 'h5', MINI_PROGRAM = 'mini_program', ELECTRON = 'electron', TAURI = 'tauri',
  CAPACITOR = 'capacitor', REACT_NATIVE = 'react_native', FLUTTER = 'flutter', QT = 'qt', GTK = 'gtk',
  SWING = 'swing', JAVAFX = 'javafx', DOTNET = 'dotnet', TAURI_PY = 'tauri_py', WINFORMS = 'winforms',
  WPF = 'wpf', MAUI = 'maui', AVALONIA = 'avalonia', UNO = 'uno', WEBASSEMBLY = 'webassembly',
}

export enum ComponentCategory {
  LAYOUT = 'layout', CONTENT = 'content', NAVIGATION = 'navigation', FORM = 'form', COMMERCE = 'commerce',
  SOCIAL = 'social', MEDIA = 'media', DATA = 'data', UTILITY = 'utility', GAMING = 'gaming',
}

export enum AssetType {
  ICON = 'icon', IMAGE = 'image', VIDEO = 'video', AUDIO = 'audio', FONT = 'font', COLOR = 'color',
  GRADIENT = 'gradient', PATTERN = 'pattern', ILLUSTRATION = 'illustration', ANIMATION = 'animation',
}

export enum ExportFormat {
  HTML = 'html', REACT = 'react', VUE = 'vue', SVELTE = 'svelte', NEXT = 'next', NUXT = 'nuxt',
  ANGULAR = 'angular', SOLID = 'solid', ASTRO = 'astro', STATIC = 'static', PWA = 'pwa',
}

export enum TemplateType {
  SAAS = 'saas', PORTFOLIO = 'portfolio', ECOMMERCE = 'ecommerce', BLOG = 'blog', AGENCY = 'agency',
  RESTAURANT = 'restaurant', STARTUP = 'startup', PERSONAL = 'personal', NONPROFIT = 'nonprofit',
}

export enum FieldType {
  TEXT = 'text', NUMBER = 'number', BOOLEAN = 'boolean', SELECT = 'select', MULTI_SELECT = 'multi_select',
  DATE = 'date', TIME = 'time', COLOR = 'color', FILE = 'file', IMAGE = 'image', VIDEO = 'video',
}

export enum LogicType {
  NAVIGATION = 'navigation', DATA = 'data', FORM = 'form', AUTH = 'auth', API = 'api', CUSTOM = 'custom',
}

export enum LogicAction {
  REDIRECT = 'redirect', SUBMIT = 'submit', VALIDATE = 'validate', FETCH = 'fetch', STORE = 'store',
}

export enum AnimationType {
  ENTRANCE = 'entrance', EXIT = 'exit', ATTENTION = 'attention', TRANSITION = 'transition',
}

export enum LayoutType {
  GRID = 'grid', FLEX = 'flex', STACK = 'stack', SPLIT = 'split', SIDEBAR = 'sidebar',
}

export enum ResponsiveStrategy {
  MOBILE_FIRST = 'mobile-first', DESKTOP_FIRST = 'desktop-first', ADAPTIVE = 'adaptive',
}

export enum BrowserSupport {
  MODERN = 'modern', LEGACY = 'legacy', ALL = 'all',
}

export enum Language {
  ENGLISH = 'en', SPANISH = 'es', FRENCH = 'fr', GERMAN = 'de', CHINESE = 'zh', JAPANESE = 'ja',
}

export enum Currency {
  USD = 'usd', EUR = 'eur', GBP = 'gbp', JPY = 'jpy', CNY = 'cny',
}

export enum MeasurementUnit {
  PIXEL = 'px', REM = 'rem', EM = 'em', PERCENT = '%', VIEWPORT = 'vh',
}

export enum TimeZone {
  UTC = 'utc', EST = 'est', PST = 'pst', CET = 'cet',
}

export enum DateFormat {
  ISO = 'iso', US = 'us', EU = 'eu',
}

export enum TimeFormat {
  TWELVE = '12h', TWENTY_FOUR = '24h',
}

export enum ThemeMode {
  LIGHT = 'light', DARK = 'dark', SYSTEM = 'system',
}

export enum Permission {
  READ = 'read', WRITE = 'write', DELETE = 'delete', ADMIN = 'admin',
}

export enum Role {
  OWNER = 'owner', ADMIN = 'admin', EDITOR = 'editor', VIEWER = 'viewer',
}

export enum Status {
  DRAFT = 'draft', PUBLISHED = 'published', ARCHIVED = 'archived',
}

export enum Priority {
  LOW = 'low', MEDIUM = 'medium', HIGH = 'high',
}

export enum SortOrder {
  ASC = 'asc', DESC = 'desc',
}

export enum FilterOperator {
  EQUALS = 'equals', NOT_EQUALS = 'not_equals', CONTAINS = 'contains', GT = 'gt', LT = 'lt',
}

export enum JoinOperator {
  AND = 'and', OR = 'or',
}

export enum ComparisonOperator {
  EQUALS = 'equals', NOT_EQUALS = 'not_equals', GT = 'gt', GTE = 'gte', LT = 'lt', LTE = 'lte',
}

export enum HttpMethod {
  GET = 'get', POST = 'post', PUT = 'put', PATCH = 'patch', DELETE = 'delete',
}

export enum DataType {
  STRING = 'string', NUMBER = 'number', BOOLEAN = 'boolean', OBJECT = 'object', ARRAY = 'array',
}

export enum ValidationType {
  REQUIRED = 'required', MIN_LENGTH = 'min_length', MAX_LENGTH = 'max_length', PATTERN = 'pattern',
  EMAIL = 'email', URL = 'url', PHONE = 'phone',
}

// Core interfaces
export interface Intent {
  id: string;
  description: string;
  goals: string[];
  constraints: Constraint[];
  references: Reference[];
  audience: string;
  purpose: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedIntent {
  intent: Intent;
  spec: Partial<ProjectSpec>;
  clarificationsNeeded: ClarificationQuestion[];
  confidence: number;
}

export interface ProjectSpec {
  id: string;
  version: string;
  name: string;
  description: string;
  intent: Intent;
  structure: PageMap;
  design: DesignSystem;
  functionality: FeatureSet;
  deployment: DeploymentConfig;
  metadata: ProjectMetadata;
}

export interface Constraint {
  id: string;
  type: string;
  name: string;
  description: string;
  value: unknown;
  priority: 'low' | 'medium' | 'high';
  enabled: boolean;
}

export interface Reference {
  id: string;
  type: string;
  url?: string;
  description: string;
  tags: string[];
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  options: string[];
  required: boolean;
}

export interface PageMap {
  pages: Page[];
  navigation: NavigationItem[];
  globals: GlobalItem[];
}

export interface Page {
  id: string;
  name: string;
  path: string;
  title: string;
  description: string;
  sections: Section[];
  meta: PageMeta;
}

export interface PageMeta {
  title: string;
  description: string;
  keywords: string[];
  noIndex: boolean;
}

export interface Section {
  id: string;
  name: string;
  component: string;
  props: Record<string, unknown>;
  children: Section[];
  responsive: ResponsiveConfig;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  children: NavigationItem[];
  external: boolean;
}

export interface GlobalItem {
  id: string;
  name: string;
  component: string;
  position: string;
  pages: string;
}

export interface DesignSystem {
  tokens: DesignTokens;
  theme?: Theme;
  themes?: Theme[];
  typography: TypographySystem;
  colors?: ColorSystem;
  color?: ColorSystem;
  spacing: SpacingSystem;
  responsive?: Record<string, unknown>;
  animations?: Record<string, unknown>;
  elevation?: Record<string, unknown>;
  motion?: Record<string, unknown>;
}

export interface DesignTokens {
  colors: Record<string, { value: string; type: string; description: string }>;
  fonts: Record<string, { value: string; type: string; description: string }>;
  spacing: Record<string, { value: string; type: string; description: string }>;
  shadows: Record<string, { value: string; type: string; description: string }>;
  radii: Record<string, { value: string; type: string; description: string }>;
  sizing?: Record<string, { value: string; type: string; description: string }>;
  borders?: Record<string, { value: string; type: string; description: string }>;
  opacity?: Record<string, { value: string; type: string; description: string }>;
  semantic?: Record<string, { value: string; description: string }>;
  components?: Record<string, unknown>;
}

export interface Theme {
  id?: string;
  name?: string;
  mode: 'light' | 'dark' | 'system';
  tokens?: Record<string, unknown>;
  default?: boolean;
  colors?: Record<string, string>;
}

export interface TypographySystem {
  fontFamily?: Record<string, string>;
  fontFamilies?: Array<{ name: string; family: string; fallback: string[]; category: string }>;
  fontSize: Record<string, string>;
  fontWeights?: Record<string, number>;
  fontWeight?: Record<string, number>;
  lineHeights?: Record<string, number>;
  lineHeight?: Record<string, number>;
  letterSpacings?: Record<string, string>;
  letterSpacing?: Record<string, string>;
  textStyles?: Array<{ id: string; name: string; fontFamily: string; fontSize: string; fontWeight: number; lineHeight: number; letterSpacing: string }>;
}

export interface ColorSystem {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  success: string;
  warning: string;
  error: string;
  white?: string;
  gray?: string;
  palette?: Record<string, Record<string, string>>;
  gradients?: Array<unknown>;
}

export interface SpacingSystem {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  scale?: Record<string, string>;
  grid?: { columns: number; gutter: string; margin: string; maxWidth: string };
}

export interface ResponsiveConfig {
  mobile: string;
  tablet: string;
  desktop: string;
  breakpoints?: Array<{ name: string; minWidth?: number; maxWidth?: number; baseFontSize: number }>;
  defaultBreakpoint?: string;
  strategy?: string;
}

export interface FeatureSet {
  features: Feature[];
  integrations?: Array<{ id: string; name: string; type: string; provider: string; config: Record<string, unknown>; enabled: boolean }>;
  workflows?: Array<unknown>;
  dataModels?: Array<unknown>;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  config?: Record<string, unknown>;
  type?: string;
  props?: Record<string, unknown>;
  dependencies?: string[];
}

export interface DeploymentConfig {
  target: DeploymentTarget;
  environment: DeploymentEnvironment;
  domain?: string;
  ssl: boolean;
  cdn: boolean;
}

export type DeploymentTarget = 'vercel' | 'netlify' | 'cloudflare' | 'aws' | 'gcp' | 'azure' | 'custom';
export type DeploymentEnvironment = 'development' | 'staging' | 'production';

export interface ProjectMetadata {
  author: string;
  version: string;
  license: string;
  repository?: string;
  createdAt: string;
  updatedAt: string;
}

export type Framework = 'react' | 'vue' | 'svelte' | 'next' | 'nuxt' | 'angular' | 'solid' | 'astro';

// Additional types for context, codegen, etc.
export interface ProjectContext {
  id: string;
  spec: ProjectSpec;
  history: ContextSnapshot[];
  agents: AgentContext[];
  resources: ExternalResource[];
  preferences: UserPreferenceModel;
  session: Session;
  changes: ChangeSet[];
  currentState: string;
  agentMemory: Record<string, unknown>;
  externalContext: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentContext {
  id: string;
  name: string;
  role: string;
  agentId: string;
  contributions: AgentContribution[];
  memory: Record<string, unknown>;
}

export interface AgentContribution {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export interface ExternalResource {
  id: string;
  type: string;
  url: string;
  description: string;
}

export interface UserPreferenceModel {
  style: string;
  colors: string[];
  fonts: string[];
}

export interface Session {
  id: string;
  startTime: string;
  endTime?: string;
}

export interface ChangeSet {
  id: string;
  timestamp: string;
  files: FileChange[];
  author?: string;
}

export interface ContextSnapshot {
  id: string;
  timestamp: string;
  spec: ProjectSpec;
  changes: ChangeSet[];
}

export interface FileChange {
  path: string;
  content: string;
  type: 'create' | 'update' | 'delete';
}

export type ID = string;
export type Timestamp = string;
