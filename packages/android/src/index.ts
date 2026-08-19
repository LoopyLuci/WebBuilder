// ============================================================================
// Android Development Package
// Build Android apps with Kotlin + Jetpack Compose
// ============================================================================

export * from './types/index.js';
export * from './codegen/project.js';
export * from './codegen/components.js';
export * from './gradle/index.js';
export * from './emulator/index.js';

import { AndroidProjectGenerator } from './codegen/project.js';
import { generateAndroidComponents } from './codegen/components.js';

export {
  AndroidProjectGenerator,
  generateAndroidComponents,
};
