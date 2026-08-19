export type TestFramework = 'vitest' | 'jest' | 'mocha';
export type TestType = 'unit' | 'integration' | 'e2e' | 'visual' | 'a11y' | 'performance';
export type TestStatus = 'passing' | 'failing' | 'skipped' | 'pending';
export interface TestResult {
    id: string;
    name: string;
    type: TestType;
    status: TestStatus;
    duration: number;
    error?: string;
    output?: string;
}
export interface TestSuiteResult {
    id: string;
    name: string;
    tests: TestResult[];
    coverage: {
        statements: number;
        branches: number;
        functions: number;
        lines: number;
    };
    duration: number;
    passed: number;
    failed: number;
    skipped: number;
}
export declare class TestRunner {
    private framework;
    private tests;
    constructor(framework?: TestFramework);
    /**
     * Add a test to the suite
     */
    addTest(test: Test): void;
    /**
     * Generate tests for a component
     */
    generateComponentTests(componentName: string, props: Record<string, unknown>): Test[];
    /**
     * Generate integration tests
     */
    generateIntegrationTests(featureName: string, steps: string[]): Test[];
    /**
     * Generate E2E tests
     */
    generateE2ETests(flowName: string, steps: string[]): Test[];
    /**
     * Generate accessibility tests
     */
    generateA11yTests(componentName: string): Test[];
    /**
     * Generate performance tests
     */
    generatePerformanceTests(componentName: string): Test[];
    /**
     * Run all tests
     */
    runTests(): Promise<TestSuiteResult>;
    /**
     * Run a single test
     */
    private runTest;
    /**
     * Generate test configuration file
     */
    generateConfig(): string;
    /**
     * Generate test setup file
     */
    generateSetupFile(): string;
    /**
     * Infer ARIA role from component name
     */
    private inferRole;
    /**
     * Get example value for a prop
     */
    private getExampleValue;
}
export interface Test {
    id: string;
    name: string;
    type: TestType;
    component?: string;
    code: string;
    status: TestStatus;
}
export declare class VisualRegressionTester {
    private baselineDir;
    private currentDir;
    private diffDir;
    constructor(baselineDir?: string, currentDir?: string, diffDir?: string);
    captureScreenshot(componentName: string, variant?: string): Promise<string>;
    compareScreenshots(baseline: string, current: string): Promise<{
        match: string;
        diff?: string;
    }>;
    generateConfig(): string;
}
declare const _default: {
    TestRunner: typeof TestRunner;
    VisualRegressionTester: typeof VisualRegressionTester;
};
export default _default;
//# sourceMappingURL=index.d.ts.map