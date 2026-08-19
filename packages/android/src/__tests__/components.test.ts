import { describe, it, expect } from 'vitest';
import {
  generateAndroidComponents,
  androidComponents,
  getAllAndroidComponentIds,
} from '../../dist/index.js';

describe('androidComponents', () => {
  it('should be an array of component definitions', () => {
    expect(Array.isArray(androidComponents)).toBe(true);
    expect(androidComponents.length).toBeGreaterThan(0);
  });

  it('should have valid component structure', () => {
    for (const component of androidComponents) {
      expect(component).toHaveProperty('id');
      expect(component).toHaveProperty('name');
      expect(component).toHaveProperty('category');
      expect(component).toHaveProperty('description');
      expect(component).toHaveProperty('code');
      expect(typeof component.id).toBe('string');
      expect(typeof component.name).toBe('string');
      expect(typeof component.code).toBe('string');
    }
  });

  it('should have unique component IDs', () => {
    const ids = androidComponents.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid categories', () => {
    const validCategories = [
      'layout',
      'input',
      'display',
      'navigation',
      'feedback',
      'screen',
    ];
    for (const component of androidComponents) {
      expect(validCategories).toContain(component.category);
    }
  });

  it('should have at least one component per major category', () => {
    const categories = new Set(androidComponents.map((c) => c.category));
    expect(categories.has('layout')).toBe(true);
    expect(categories.has('input')).toBe(true);
    expect(categories.has('display')).toBe(true);
    expect(categories.has('navigation')).toBe(true);
    expect(categories.has('feedback')).toBe(true);
  });
});

describe('generateAndroidComponents', () => {
  it('should generate component files for valid IDs', () => {
    const ids = ['android-button', 'android-text-field'];
    const result = generateAndroidComponents(ids, 'com.example.app');

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].action).toBe('create');
  });

  it('should generate theme file alongside components', () => {
    const ids = ['android-button'];
    const result = generateAndroidComponents(ids, 'com.example.app');

    const themeFile = result.find((f) => f.path.includes('Theme.kt'));
    expect(themeFile).toBeDefined();
    expect(themeFile!.content).toContain('package com.example.app.ui.theme');
    expect(themeFile!.content).toContain('fun AppTheme(');
    expect(themeFile!.content).toContain('MaterialTheme(');
  });

  it('should create correct file paths for components', () => {
    const ids = ['android-scaffold', 'android-card'];
    const result = generateAndroidComponents(ids, 'com.example.myapp');

    const scaffoldFile = result.find((f) => f.path.includes('Scaffold.kt'));
    expect(scaffoldFile).toBeDefined();
    expect(scaffoldFile!.path).toBe(
      'app/src/main/java/com/example/myapp/ui/components/Scaffold.kt'
    );
    expect(scaffoldFile!.content).toContain('package com.example.myapp.ui.components');

    const cardFile = result.find((f) => f.path.includes('Card.kt'));
    expect(cardFile).toBeDefined();
    expect(cardFile!.path).toBe(
      'app/src/main/java/com/example/myapp/ui/components/Card.kt'
    );
  });

  it('should include component code in generated files', () => {
    const ids = ['android-button'];
    const result = generateAndroidComponents(ids, 'com.example.app');

    const buttonFile = result.find((f) => f.path.includes('Button.kt'));
    expect(buttonFile).toBeDefined();
    expect(buttonFile!.content).toContain('@Composable');
    expect(buttonFile!.content).toContain('fun AppButton(');
    expect(buttonFile!.content).toContain('ButtonVariant');
  });

  it('should handle invalid component IDs gracefully', () => {
    const ids = ['nonexistent-component', 'android-button'];
    const result = generateAndroidComponents(ids, 'com.example.app');

    const buttonFile = result.find((f) => f.path.includes('Button.kt'));
    expect(buttonFile).toBeDefined();
    const nonexistentFile = result.find((f) =>
      f.path.includes('nonexistent-component')
    );
    expect(nonexistentFile).toBeUndefined();
  });

  it('should return empty array for empty component IDs', () => {
    const result = generateAndroidComponents([], 'com.example.app');

    // Should only contain the theme file
    expect(result.length).toBe(1);
    expect(result[0].path).toContain('Theme.kt');
  });

  it('should generate correct theme file content', () => {
    const ids = ['android-text'];
    const result = generateAndroidComponents(ids, 'com.example.app');

    const themeFile = result.find((f) => f.path.includes('Theme.kt'));
    expect(themeFile!.content).toContain('import android.os.Build');
    expect(themeFile!.content).toContain('isSystemInDarkTheme()');
    expect(themeFile!.content).toContain('dynamicDarkColorScheme');
    expect(themeFile!.content).toContain('dynamicLightColorScheme');
    expect(themeFile!.content).toContain('lightColorScheme()');
    expect(themeFile!.content).toContain('darkColorScheme()');
  });

  it('should preserve package path dots in file paths', () => {
    const ids = ['android-fab'];
    const result = generateAndroidComponents(ids, 'com.company.product.app');

    const fabFile = result.find((f) => f.path.includes('FloatingActionButton.kt'));
    expect(fabFile).toBeDefined();
    expect(fabFile!.path).toBe(
      'app/src/main/java/com/company/product/app/ui/components/FloatingActionButton.kt'
    );
  });
});

describe('getAllAndroidComponentIds', () => {
  it('should return all component IDs', () => {
    const ids = getAllAndroidComponentIds();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBe(androidComponents.length);
  });

  it('should return valid ID strings', () => {
    const ids = getAllAndroidComponentIds();
    for (const id of ids) {
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    }
  });
});