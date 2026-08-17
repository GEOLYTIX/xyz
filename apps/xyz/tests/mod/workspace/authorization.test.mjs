/**
Basic authorization.

Asynchronous authorization providers can be registered for workspace
composition. A provider decides scope access in composeObj instead of the
user.roles array.

A provider is only consulted for a user with an authorization_provider property
matching the key the provider was registered with. Without the property the
user.roles semantics apply unchanged.

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
    setAuthorizationProvider('openfga');
  });

  it('without the authorization_provider property the user.roles semantics apply', async () => {
    const denied = await composeObj({ role: 'analyst' });

    expect(denied instanceof Error).toBeTruthy();

    const allowed = await composeObj(
      { role: 'analyst' },
      { roles: ['analyst'] },
    );

    expect(allowed instanceof Error).toBeFalsy();
  });

  it('a registered provider is ignored without the user property', async () => {
    const checkScope = vi.fn(async () => true);

    setAuthorizationProvider('openfga', { checkScope });

    const denied = await composeObj({ role: 'analyst' });

    expect(denied instanceof Error).toBeTruthy();
    expect(checkScope).not.toHaveBeenCalled();
  });

  it('a provider allow admits a scoped object without user roles', async () => {
    const checkScope = vi.fn(async () => true);

    setAuthorizationProvider('openfga', { checkScope });

    const obj = await composeObj(
      { role: 'analyst' },
      { authorization_provider: 'openfga' },
    );

    expect(obj instanceof Error).toBeFalsy();
    expect(checkScope).toHaveBeenCalled();
    expect(checkScope.mock.calls[0][0].scope).toEqual(['analyst']);
    expect(checkScope.mock.calls[0][0].scopeKey).toBe('analyst');
  });

  it('the provider context receives the user object', async () => {
    const checkScope = vi.fn(async () => true);

    setAuthorizationProvider('openfga', { checkScope });

    const user = {
      authorization_provider: 'openfga',
      email: 'analyst@geolytix.co.uk',
      roles: ['analyst'],
    };

    await composeObj({ role: 'analyst' }, user);

    expect(checkScope.mock.calls[0][0].user).toEqual(user);
  });

  it('a user is only routed through their own provider', async () => {
    const openfga = vi.fn(async () => true);
    const other = vi.fn(async () => true);

    setAuthorizationProvider('openfga', { checkScope: openfga });
    setAuthorizationProvider('other', { checkScope: other });

    await composeObj({ role: 'analyst' }, { authorization_provider: 'other' });

    expect(other).toHaveBeenCalled();
    expect(openfga).not.toHaveBeenCalled();

    setAuthorizationProvider('other');
  });

  it('a provider deny returns an Error despite matching user roles', async () => {
    setAuthorizationProvider('openfga', { checkScope: async () => false });

    const response = await composeObj(
      { role: 'analyst' },
      { authorization_provider: 'openfga', roles: ['analyst'] },
    );

    expect(response instanceof Error).toBeTruthy();
  });

  it('a user property without a registered provider fails closed', async () => {
    const response = await composeObj(
      { role: 'analyst' },
      { authorization_provider: 'openfga', roles: ['analyst'] },
    );

    expect(response instanceof Error).toBeTruthy();
  });

  it('a provider error fails closed', async () => {
    setAuthorizationProvider('openfga', {
      checkScope: async () => {
        throw new Error('Authorization store unavailable.');
      },
    });

    const response = await composeObj(
      { role: 'analyst' },
      { authorization_provider: 'openfga', roles: ['analyst'] },
    );

    expect(response instanceof Error).toBeTruthy();
  });

  it('a provider allow merges a role-gated template without user roles', async () => {
    setAuthorizationProvider('openfga', { checkScope: async () => true });

    const obj = await composeObj(
      {
        templates: [{ analystProp: true, role: 'analyst' }],
      },
      { authorization_provider: 'openfga' },
    );

    expect(obj instanceof Error).toBeFalsy();
    expect(obj.analystProp).toBe(true);
  });

  it('a provider deny silently skips the template merge despite matching user roles', async () => {
    setAuthorizationProvider('openfga', {
      checkScope: async ({ scopeKey }) => scopeKey !== 'analyst',
    });

    const obj = await composeObj(
      {
        templates: [{ analystProp: true, role: 'analyst' }],
      },
      { authorization_provider: 'openfga', roles: ['analyst'] },
    );

    expect(obj instanceof Error).toBeFalsy();
    expect(obj.analystProp).toBeUndefined();
  });

  it('a merged template is consulted with the chained scopeKey', async () => {
    const checkScope = vi.fn(async () => true);

    setAuthorizationProvider('openfga', { checkScope });

    await composeObj(
      {
        role: 'retail',
        templates: [{ analystProp: true, role: 'analyst' }],
      },
      { authorization_provider: 'openfga' },
    );

    const scopeKeys = checkScope.mock.calls.map(
      ([context]) => context.scopeKey,
    );

    expect(scopeKeys).toContain('retail');
    expect(scopeKeys).toContain('retail.analyst');
  });

  it('clearing the provider registration fails closed', async () => {
    setAuthorizationProvider('openfga', { checkScope: async () => true });

    setAuthorizationProvider('openfga');

    const denied = await composeObj(
      { role: 'analyst' },
      { authorization_provider: 'openfga', roles: ['analyst'] },
    );

    expect(denied instanceof Error).toBeTruthy();

    // The user.roles semantics apply for a user without the property.
    const allowed = await composeObj(
      { role: 'analyst' },
      { roles: ['analyst'] },
    );

    expect(allowed instanceof Error).toBeFalsy();
  });
});
