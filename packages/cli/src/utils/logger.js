import chalk from 'chalk';
export const logger = {
    info: (message) => {
        console.log(chalk.blue('ℹ'), message);
    },
    success: (message) => {
        console.log(chalk.green('✔'), message);
    },
    warn: (message) => {
        console.log(chalk.yellow('⚠'), message);
    },
    error: (message) => {
        console.error(chalk.red('✖'), message);
    },
    debug: (message) => {
        if (process.env.DEBUG) {
            console.log(chalk.gray('[DEBUG]'), message);
        }
    },
    banner: () => {
        console.log(chalk.cyan(`
╦ ╦╔═╗╔╗ ╦ ╦╦╦  ╔╦╗╔═╗╦═╗
║║║║╣ ╠╩╗║║║║║  ║║║║╣ ╠╦╝
╚╩╝╚═╝╚═╝╚╩╝╩╩═╝╩ ╩╚═╝╩╚═
    `));
        console.log(chalk.gray('  Next-gen agentic web building platform\n'));
    },
    table: (data) => {
        const maxKeyLength = Math.max(...Object.keys(data).map((k) => k.length));
        Object.entries(data).forEach(([key, value]) => {
            console.log(chalk.gray(`  ${key.padEnd(maxKeyLength + 2)}`), chalk.white(value));
        });
    },
};
//# sourceMappingURL=logger.js.map