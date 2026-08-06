import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { afterAll, describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

describe('utils/cache-workspace', () => {
  let dir;

  afterAll(async () => {
    if (dir) {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('generates a workspace with the template sources assembled', async () => {
    process.xyzEnv = {};

    dir = await mkdtemp(join(tmpdir(), 'xyz-cache-workspace-'));

    const output = join(dir, 'workspace.generated.json');

    // The script is spawned to assert the pnpm workspace:cache script runs.
    await execFileAsync(
      process.execPath,
      [
        './utils/cache-workspace.js',
        '--workspace=file:./tests/assets/_workspace.json',
        `--output=${output}`,
      ],
      // The spawned process loads processEnv which defaults XYZ_CWD to the
      // monorepo root. XYZ_CWD is set to the app directory so the file: src
      // references resolve against tests/assets as they do in the rest of the
      // suite, where xyzEnv is assigned without XYZ_CWD.
      { cwd: process.cwd(), env: { ...process.env, XYZ_CWD: process.cwd() } },
    );

    const generated = JSON.parse(await readFile(output, 'utf8'));

    expect(generated.templates).toBeTypeOf('object');

    // A template definition with a src is assembled with the srcLoaded flag.
    const assembled = Object.values(generated.templates).filter(
      (template) => template.srcLoaded,
    );

    expect(assembled.length).toBeGreaterThan(0);
  });
});
