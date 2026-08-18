import ora, { Ora } from 'ora';
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

export const spinner = {
  create(text: string = 'Loading...'): SpinnerInstance {
    const s = ora({
      text,
      color: 'cyan',
      spinner: 'dots',
    });
    return s;
  },

  withSpinner<T>(
    text: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const s = this.create(text);
    s.start();
    return fn()
      .then((result) => {
        s.succeed();
        return result;
      })
      .catch((err) => {
        s.fail(err.message || 'An error occurred');
        throw err;
      });
  },

  simulation(text: string, durationMs: number = 2000): Promise<void> {
    return new Promise((resolve) => {
      const s = this.create(text);
      s.start();
      setTimeout(() => {
        s.succeed();
        resolve();
      }, durationMs);
    });
  },
};

export { chalk };