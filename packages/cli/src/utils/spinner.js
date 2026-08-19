import ora from 'ora';
import chalk from 'chalk';
export const spinner = {
    create(text = 'Loading...') {
        const s = ora({
            text,
            color: 'cyan',
            spinner: 'dots',
        });
        return s;
    },
    withSpinner(text, fn) {
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
    simulation(text, durationMs = 2000) {
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
//# sourceMappingURL=spinner.js.map