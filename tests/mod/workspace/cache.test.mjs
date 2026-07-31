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
  it('workspace should be cached again on each check if WORKSPACE_AGE is 0.', async () => {
    globalThis.xyzEnv = {
      WORKSPACE: 'file:./tests/assets/_workspace.json',
      WORKSPACE_AGE: 0,
    };

    const a_workspace = await checkWorkspaceCache();
    const b_workspace = await checkWorkspaceCache();

    expect(a_workspace instanceof Error).toBeFalsy();
    expect(b_workspace instanceof Error).toBeFalsy();

    // Both checks must resolve a workspace which has been cached anew.
    expect(a_workspace).not.toBe(b_workspace);
    expect(a_workspace.timestamp <= b_workspace.timestamp).toBeTruthy();
  });

  it('workspace should be cached again once the WORKSPACE_AGE is exceeded.', async () => {
    globalThis.xyzEnv = {
      WORKSPACE: 'file:./tests/assets/_workspace.json',
      WORKSPACE_AGE: 3600000,
    };

    const a_workspace = await checkWorkspaceCache(true);
    const b_workspace = await checkWorkspaceCache();

    // The cached workspace is not yet stale.
    expect(a_workspace).toBe(b_workspace);
  });
});
