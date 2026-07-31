import { describe, expect, it } from 'vitest';
import checkWorkspaceCache from '../../../mod/workspace/cache.js';

describe('checkWorkspaceCache', async () => {
  it('timestamp should be the same if fetched twice.', async () => {
    globalThis.xyzEnv = {
      WORKSPACE: 'file:./tests/assets/_workspace.json',
    };

    const a_workspace = await checkWorkspaceCache();
    const b_workspace = await checkWorkspaceCache();

    expect(a_workspace instanceof Error).toBeFalsy();
    expect(b_workspace instanceof Error).toBeFalsy();
    expect(a_workspace.timestamp === b_workspace.timestamp).toBeTruthy();
  });
});

describe('WORKSPACE_AGE', async () => {
  it('timestamp should be different if WORKSPACE_AGE is 0.', async () => {
    globalThis.xyzEnv = {
      WORKSPACE: 'file:./tests/assets/_workspace.json',
      WORKSPACE_AGE: 0,
    };

    const a_workspace = await checkWorkspaceCache();
    const b_workspace = await checkWorkspaceCache();

    expect(a_workspace instanceof Error).toBeFalsy();
    expect(b_workspace instanceof Error).toBeFalsy();
    expect(a_workspace.timestamp < b_workspace.timestamp).toBeTruthy();
  });
});
