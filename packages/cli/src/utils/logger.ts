import chalk from 'chalk';

export const logger = {
  info: (message: string) => {
    console.log(chalk.blue('ℹ'), message);
  },

  success: (message: string) => {
    console.log(chalk.green('✔'), message);
  },

  warn: (message: string) => {
    console.log(chalk.yellow('⚠'), message);
  },

  error: (message: string) => {
    console.error(chalk.red('✖'), message);
  },

  debug: (message: string) => {
    if (process.env.DEBUG) {
      console.log(chalk.gray('[DEBUG]'), message);
    }
  },

  banner: () => {
    console.log(
      chalk.cyan(`
╦ ╦╔═╗╔╗ ╦ ╦╦╦  ╔╦╗╔═╗╦═╗
║║║║╣ ╠╩╗║║║║║  ║║║║╣ ╠╦╝
╚╩╝╚═╝╚═╝╚╩╝╩╩═╝╩ ╩╚═╝╩╚═
    `)
    );
    console.log(chalk.gray('  Next-gen agentic web building platform\n'));
  },

  table: (data: Record<string, string>) => {
    const maxKeyLength = Math.max(...Object.keys(data).map((k) => k.length));
    Object.entries(data).forEach(([key, value]) => {
      console.log(
        chalk.gray(`  ${key.padEnd(maxKeyLength + 2)}`),
        chalk.white(value)
      );
    });
  },
};