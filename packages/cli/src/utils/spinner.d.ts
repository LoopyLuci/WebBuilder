import chalk from 'chalk';
export interface SpinnerInstance {
    start: (text?: string) => SpinnerInstance;
    succeed: (text?: string) => SpinnerInstance;
    fail: (text?: string) => SpinnerInstance;
    warn: (text?: string) => SpinnerInstance;
    info: (text?: string) => SpinnerInstance;
    stop: () => SpinnerInstance;
    clear: () => SpinnerInstance;
    text: string;
    isSpinning: boolean;
}
export declare const spinner: {
    create(text?: string): SpinnerInstance;
    withSpinner<T>(text: string, fn: () => Promise<T>): Promise<T>;
    simulation(text: string, durationMs?: number): Promise<void>;
};
export { chalk };
//# sourceMappingURL=spinner.d.ts.map