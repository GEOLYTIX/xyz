/**
Basic authorization.

An asynchronous authorization provider can be registered for workspace
composition. The provider decides scope access in composeObj instead of the
user.roles array.

The provider is only consulted when the AUTHORIZATION_PROVIDER flag is
enabled in the xyzEnv, matching the LEGACY_ROLES flag pattern. Without the
flag the user.roles semantics apply unchanged.

This is the first increment: the root composeObj decision only.
*/

import { afterEach, describe, expect, it, vi } from 'vitest';
import { setAuthorizationProvider } from '../../../mod/workspace/authorization.js';
import composeObj from '../../../mod/workspace/composeObj.js';

globalThis.xyzEnv = {
  WORKSPACE: 'file:./tests/assets/workspace_locale.json',
};

describe('basic authorization', () => {
  afterEach(() => {
    setAuthorizationProvider();
    delete globalThis.xyzEnv.AUTHORIZATION_PROVIDER;
  });

  it('without the AUTHORIZATION_PROVIDER flag the user.roles semantics apply', async () => {
    const denied = await composeObj({ role: 'analyst' });

    expect(denied instanceof Error).toBeTruthy();

    const allowed = await composeObj({ role: 'analyst' }, ['analyst']);

    expect(allowed instanceof Error).toBeFalsy();
  });

  it('a registered provider is ignored without the flag', async () => {
    const checkScope = vi.fn(async () => true);

    setAuthorizationProvider({ checkScope });

    const denied = await composeObj({ role: 'analyst' });

    expect(denied instanceof Error).toBeTruthy();
    expect(checkScope).not.toHaveBeenCalled();
  });

  it('a provider allow admits a scoped object without user roles', async () => {
    globalThis.xyzEnv.AUTHORIZATION_PROVIDER = true;

    const checkScope = vi.fn(async () => true);

    setAuthorizationProvider({ checkScope });

    const obj = await composeObj({ role: 'analyst' });

    expect(obj instanceof Error).toBeFalsy();
    expect(checkScope).toHaveBeenCalled();
    expect(checkScope.mock.calls[0][0].scope).toEqual(['analyst']);
    expect(checkScope.mock.calls[0][0].scopeKey).toBe('analyst');
  });

  it('a provider deny returns an Error despite matching user roles', async () => {
    globalThis.xyzEnv.AUTHORIZATION_PROVIDER = true;

    setAuthorizationProvider({ checkScope: async () => false });

    const response = await composeObj({ role: 'analyst' }, ['analyst']);

    expect(response instanceof Error).toBeTruthy();
  });

  it('the enabled flag without a registered provider fails closed', async () => {
    globalThis.xyzEnv.AUTHORIZATION_PROVIDER = true;

    const response = await composeObj({ role: 'analyst' }, ['analyst']);

    expect(response instanceof Error).toBeTruthy();
  });

  it('a provider error fails closed', async () => {
    globalThis.xyzEnv.AUTHORIZATION_PROVIDER = true;

    setAuthorizationProvider({
      checkScope: async () => {
        throw new Error('Authorization store unavailable.');
      },
    });

    const response = await composeObj({ role: 'analyst' }, ['analyst']);

    expect(response instanceof Error).toBeTruthy();
  });

  it('a provider allow merges a role-gated template without user roles', async () => {
    globalThis.xyzEnv.AUTHORIZATION_PROVIDER = true;

    setAuthorizationProvider({ checkScope: async () => true });

    const obj = await composeObj({
      templates: [{ analystProp: true, role: 'analyst' }],
    });

    expect(obj instanceof Error).toBeFalsy();
    expect(obj.analystProp).toBe(true);
  });

  it('a provider deny silently skips the template merge despite matching user roles', async () => {
    globalThis.xyzEnv.AUTHORIZATION_PROVIDER = true;

    setAuthorizationProvider({
      checkScope: async ({ scopeKey }) => scopeKey !== 'analyst',
    });

    const obj = await composeObj(
      {
        templates: [{ analystProp: true, role: 'analyst' }],
      },
      ['analyst'],
    );

    expect(obj instanceof Error).toBeFalsy();
    expect(obj.analystProp).toBeUndefined();
  });

  it('a merged template is consulted with the chained scopeKey', async () => {
    globalThis.xyzEnv.AUTHORIZATION_PROVIDER = true;

    const checkScope = vi.fn(async () => true);

    setAuthorizationProvider({ checkScope });

    await composeObj({
      role: 'retail',
      templates: [{ analystProp: true, role: 'analyst' }],
    });

    const scopeKeys = checkScope.mock.calls.map(
      ([context]) => context.scopeKey,
    );

    expect(scopeKeys).toContain('retail');
    expect(scopeKeys).toContain('retail.analyst');
  });

  it('removing the flag restores the user.roles semantics', async () => {
    globalThis.xyzEnv.AUTHORIZATION_PROVIDER = true;

    setAuthorizationProvider({ checkScope: async () => true });

    delete globalThis.xyzEnv.AUTHORIZATION_PROVIDER;

    const denied = await composeObj({ role: 'analyst' });

    expect(denied instanceof Error).toBeTruthy();

    const allowed = await composeObj({ role: 'analyst' }, ['analyst']);

    expect(allowed instanceof Error).toBeFalsy();
  });
});
