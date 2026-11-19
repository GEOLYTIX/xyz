/**
The run module runs a command synchronously for the package scripts and throws if the command fails.

npm and pnpm are cmd scripts on Windows, which only run in a shell. The command is passed to the shell as one string with quoted arguments, because Node deprecates passing an args array with the shell option.

@module scripts/run
*/

import { spawnSync } from 'node:child_process';

/**
@function run

@description
Runs a command and returns its stdout. The stdout and stderr are logged and an error is thrown if the command exits with a status other than 0.

@param {string} command The command, eg. `npm`.
@param {Array<string>} args The command arguments.
@param {Object} [options] The spawnSync options, eg. `{ cwd }`.
@returns {string} The stdout of the command.
*/
export function run(command, args, options = {}) {
  const windows = process.platform === 'win32';

  const quote = (arg) =>
    /[\s"]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg;

  const result = windows
    ? spawnSync([command, ...args].map(quote).join(' '), {
        ...options,
        encoding: 'utf-8',
        shell: true,
      })
    : spawnSync(command, args, { ...options, encoding: 'utf-8' });

  if (result.status !== 0) {
    console.error(result.stdout, result.stderr);
    throw new Error(`${command} ${args.join(' ')} failed.`);
  }

  return result.stdout;
}
