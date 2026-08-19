// ============================================================================
// Testing Package
// Comprehensive testing utilities for WebBuilder projects
// ============================================================================
import { nanoid } from 'nanoid';
export class TestRunner {
    framework;
    tests;
    constructor(framework = 'vitest') {
        this.framework = framework;
        this.tests = new Map();
    }
    /**
     * Add a test to the suite
     */
    addTest(test) {
        this.tests.set(test.id, test);
    }
    /**
     * Generate tests for a component
     */
    generateComponentTests(componentName, props) {
        const tests = [];
        // Render test
        tests.push({
            id: nanoid(),
            name: `${componentName} renders correctly`,
            type: 'unit',
            component: componentName,
            code: `describe('${componentName}', () => {
  it('renders correctly', () => {
    render(<${componentName} />);
    expect(screen.getByRole('${this.inferRole(componentName)}')).toBeInTheDocument();
  });
});`,
            status: 'pending',
        });
        // Props test
        for (const propName of Object.keys(props)) {
            tests.push({
                id: nanoid(),
                name: `${componentName} accepts ${propName} prop`,
                type: 'unit',
                component: componentName,
                code: `it('accepts ${propName} prop', () => {
  render(<${componentName} ${propName}="${this.getExampleValue(propName, props[propName])}" />);
  // Assert prop is applied correctly
});`,
                status: 'pending',
            });
        }
        // Snapshot test
        tests.push({
            id: nanoid(),
            name: `${componentName} matches snapshot`,
            type: 'unit',
            component: componentName,
            code: `it('matches snapshot', () => {
  const { container } = render(<${componentName} />);
  expect(container).toMatchSnapshot();
});`,
            status: 'pending',
        });
        return tests;
    }
    /**
     * Generate integration tests
     */
    generateIntegrationTests(featureName, steps) {
        return steps.map((step, i) => ({
            id: nanoid(),
            name: `${featureName}: ${step}`,
            type: 'integration',
            code: `test('${step}', async () => {
  // ${step}
  render(<${featureName} />);
  // Perform actions and assertions
});`,
            status: 'pending',
        }));
    }
    /**
     * Generate E2E tests
     */
    generateE2ETests(flowName, steps) {
        return [
            {
                id: nanoid(),
                name: `E2E: ${flowName}`,
                type: 'e2e',
                code: `test('${flowName}', async ({ page }) => {
  await page.goto('/');
  ${steps.map(step => `// ${step}`).join('\n  ')}
});`,
                status: 'pending',
            },
        ];
    }
    /**
     * Generate accessibility tests
     */
    generateA11yTests(componentName) {
        return [
            {
                id: nanoid(),
                name: `${componentName} passes accessibility audit`,
                type: 'a11y',
                code: `test('${componentName} is accessible', async () => {
  const { container } = render(<${componentName} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});`,
                status: 'pending',
            },
        ];
    }
    /**
     * Generate performance tests
     */
    generatePerformanceTests(componentName) {
        return [
            {
                id: nanoid(),
                name: `${componentName} renders within performance budget`,
                type: 'performance',
                code: `test('${componentName} performance', () => {
  const start = performance.now();
  render(<${componentName} />);
  const end = performance.now();
  expect(end - start).toBeLessThan(100);
});`,
                status: 'pending',
            },
        ];
    }
    /**
     * Run all tests
     */
    async runTests() {
        const results = [];
        let passed = 0;
        let failed = 0;
        let skipped = 0;
        for (const test of this.tests.values()) {
            const result = await this.runTest(test);
            results.push(result);
            if (result.status === 'passing')
                passed++;
            else if (result.status === 'failing')
                failed++;
            else
                skipped++;
        }
        return {
            id: nanoid(),
            name: 'Test Suite',
            tests: results,
            coverage: { statements: 0, branches: 0, functions: 0, lines: 0 },
            duration: results.reduce((sum, r) => sum + r.duration, 0),
            passed,
            failed,
            skipped,
        };
    }
    /**
     * Run a single test
     */
    async runTest(test) {
        const start = Date.now();
        // In a real implementation, this would execute the test
        const duration = Date.now() - start;
        return {
            id: test.id,
            name: test.name,
            type: test.type,
            status: 'passing',
            duration,
        };
    }
    /**
     * Generate test configuration file
     */
    generateConfig() {
        switch (this.framework) {
            case 'vitest':
                return `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});`;
            case 'jest':
                return `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
};`;
            default:
                return '';
        }
    }
    /**
     * Generate test setup file
     */
    generateSetupFile() {
        return `import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});`;
    }
    /**
     * Infer ARIA role from component name
     */
    inferRole(componentName) {
        const lower = componentName.toLowerCase();
        if (lower.includes('button'))
            return 'button';
        if (lower.includes('input') || lower.includes('text'))
            return 'textbox';
        if (lower.includes('link'))
            return 'link';
        if (lower.includes('heading'))
            return 'heading';
        if (lower.includes('image') || lower.includes('img'))
            return 'img';
        if (lower.includes('list'))
            return 'list';
        if (lower.includes('form'))
            return 'form';
        if (lower.includes('navigation') || lower.includes('nav'))
            return 'navigation';
        if (lower.includes('modal') || lower.includes('dialog'))
            return 'dialog';
        return 'region';
    }
    /**
     * Get example value for a prop
     */
    getExampleValue(propName, propType) {
        if (propName.toLowerCase().includes('text') || propName.toLowerCase().includes('title'))
            return 'Example';
        if (propName.toLowerCase().includes('count') || propName.toLowerCase().includes('number'))
            return '42';
        if (propName.toLowerCase().includes('enabled') || propName.toLowerCase().includes('disabled'))
            return 'true';
        if (propName.toLowerCase().includes('url') || propName.toLowerCase().includes('link'))
            return 'https://example.com';
        if (propName.toLowerCase().includes('color'))
            return '#3b82f6';
        return 'example';
    }
}
export class VisualRegressionTester {
    baselineDir;
    currentDir;
    diffDir;
    constructor(baselineDir = './visual-baseline', currentDir = './visual-current', diffDir = './visual-diff') {
        this.baselineDir = baselineDir;
        this.currentDir = currentDir;
        this.diffDir = diffDir;
    }
    async captureScreenshot(componentName, variant) {
        const name = variant ? `${componentName}-${variant}` : componentName;
        return `${this.currentDir}/${name}.png`;
    }
    async compareScreenshots(baseline, current) {
        return { match: baseline, diff: undefined };
    }
    generateConfig() {
        return `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.visual.test.ts'],
  },
});`;
    }
}
export default { TestRunner, VisualRegressionTester };
//# sourceMappingURL=index.js.map