#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`Usage: pnpm deploy:vercel --env=<production|preview> [vercel flags]

Generates a new _VARLOCK_ENV_KEY, freezes .varlock.blob with that key,
stores the key in the selected Vercel environment, then deploys.

Examples:
  pnpm deploy:vercel --env=production
  pnpm deploy:vercel --env=preview --scope=my-team
`);
  process.exit(0);
}

const environment = normalizeEnvironment(
  getArg('env') || getArg('environment') || 'production',
);
const varlockEnv = getArg('varlock-env') || environment;

if (!['production', 'preview'].includes(environment)) {
  console.error('Invalid --env. Use --env=production or --env=preview.');
  process.exit(1);
}

const key = generateVarlockKey();

run(process.execPath, ['utils/freeze-env.js', `--env=${varlockEnv}`], {
  env: { ...process.env, _VARLOCK_ENV_KEY: key },
});

setVercelEnvKey(environment, key);
deploy(environment);

function generateVarlockKey() {
  const result = spawnPnpm(['exec', 'varlock', 'generate-key', '--plain'], {
    encoding: 'utf8',
  });

  if (result.error) {
    console.error(`Failed to run pnpm: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.stderr.write(
      result.stderr || 'Failed to generate _VARLOCK_ENV_KEY.',
    );
    process.exit(result.status || 1);
  }

  const key = result.stdout.match(/[a-f0-9]{64}/i)?.[0];

  if (!key) {
    console.error('Varlock did not return a 64-character hex key.');
    process.exit(1);
  }

  return key;
}

function setVercelEnvKey(environment, key) {
  runPnpm(
    [
      'exec',
      'vercel',
      'env',
      'add',
      '_VARLOCK_ENV_KEY',
      environment,
      '--sensitive',
      '--force',
      '--yes',
      '--non-interactive',
      ...getVercelGlobalArgs(args),
    ],
    {
      input: `${key}\n`,
      stdio: ['pipe', 'inherit', 'inherit'],
    },
  );
}

function deploy(environment) {
  const deployArgs = ['exec', 'vercel'];

  if (environment === 'production') {
    deployArgs.push('--prod');
  } else {
    deployArgs.push('--target=preview');
  }

  deployArgs.push(...getVercelDeployArgs(args));

  runPnpm(deployArgs);
}

function getArg(name) {
  const flag = `--${name}`;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === flag) return args[index + 1];
    if (arg.startsWith(`${flag}=`)) return arg.slice(flag.length + 1);
  }
}

function normalizeEnvironment(environment) {
  if (environment === 'prod') return 'production';
  if (environment === 'dev') return 'preview';
  return environment;
}

function getVercelGlobalArgs(argv) {
  return collectArgs(argv, {
    flagsWithValues: new Set([
      '--cwd',
      '--global-config',
      '--local-config',
      '--scope',
      '--token',
    ]),
    valueOptionalFlags: new Set(['--debug', '--no-color']),
  });
}

function getVercelDeployArgs(argv) {
  return collectArgs(argv, {
    flagsWithValues: new Set([
      '--build-env',
      '--cwd',
      '--env',
      '--global-config',
      '--local-config',
      '--meta',
      '--project',
      '--regions',
      '--scope',
      '--token',
    ]),
    valueOptionalFlags: new Set([
      '--archive',
      '--debug',
      '--force',
      '--logs',
      '--no-color',
      '--no-wait',
      '--prebuilt',
      '--skip-domain',
      '--yes',
    ]),
  });
}

function collectArgs(argv, { flagsWithValues, valueOptionalFlags }) {
  const passthrough = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const [flag] = arg.split('=', 1);

    if (['--env', '--environment', '--varlock-env'].includes(flag)) {
      if (
        arg === flag &&
        argv[index + 1] &&
        !argv[index + 1].startsWith('--')
      ) {
        index += 1;
      }
      continue;
    }

    if (flagsWithValues.has(flag)) {
      passthrough.push(arg);

      if (
        arg === flag &&
        argv[index + 1] &&
        !argv[index + 1].startsWith('--')
      ) {
        passthrough.push(argv[index + 1]);
        index += 1;
      }
    } else if (valueOptionalFlags.has(flag)) {
      passthrough.push(arg);
    }
  }

  return passthrough;
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    stdio: 'inherit',
    ...options,
  });

  if (result.error) {
    console.error(`Failed to run ${command}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function runPnpm(commandArgs, options = {}) {
  const result = spawnPnpm(commandArgs, {
    stdio: 'inherit',
    ...options,
  });

  if (result.error) {
    console.error(`Failed to run pnpm: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function spawnPnpm(commandArgs, options = {}) {
  if (process.env.npm_execpath?.toLowerCase().includes('pnpm')) {
    return spawnSync(process.execPath, [process.env.npm_execpath, ...commandArgs], options);
  }

  return spawnSync('pnpm', commandArgs, {
    shell: process.platform === 'win32',
    ...options,
  });
}
