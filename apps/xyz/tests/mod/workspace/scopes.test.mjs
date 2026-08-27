import { describe, expect, it } from 'vitest';

import {
  checkScope,
  getScopes,
  scopesArray,
  scopesTree,
} from '../../../mod/workspace/scopes.js';

globalThis.xyzEnv = {
  WORKSPACE: 'file:./tests/assets/_workspace.json',
};

describe('scopesArray', () => {
  it('sorts scopes and removes the empty scope', () => {
    const scopes = new Set(['uk.leeds', '', 'core', 'uk']);

    expect(scopesArray(scopes)).toEqual(['core', 'uk', 'uk.leeds']);
  });
});

describe('scopesTree', () => {
  it('nests dot delimited scopes into a tree', () => {
    const scopes = new Set(['uk', 'uk.leeds', 'uk.leeds.pricing', 'core']);

    expect(scopesTree(scopes)).toEqual({
      core: {},
      uk: { leeds: { pricing: {} } },
    });
  });

  it('excludes the empty scope', () => {
    expect(scopesTree(new Set(['']))).toEqual({});
  });
});

describe('getScopes', () => {
  it('returns the templateScopes recorded during composition', async () => {
    const scopes = await getScopes();

    expect(scopes).toBeInstanceOf(Set);

    // A scope is only recorded when the object defining it has been composed.
    // Every recorded scope must be a dot delimited string of role keys.
    for (const scope of scopesArray(scopes)) {
      expect(typeof scope).toBe('string');
      expect(scope.startsWith('.')).toBe(false);
      expect(scope.endsWith('.')).toBe(false);
    }
  });

  it('returns scopes which checkScope grants to a holder of the scope', async () => {
    const scopes = scopesArray(await getScopes());

    for (const scope of scopes) {
      // A role granting the exact scope must satisfy checkScope for that scope.
      expect(checkScope(scope.split('.'), [scope])).toBe(true);
    }
  });

  it('resolves repeat requests from the cached workspace', async () => {
    const first = await getScopes();
    const second = await getScopes();

    // The same workspace.scopes{} set is returned without a cache rebuild.
    expect(second).toBe(first);
  });

  it('shares one composition between concurrent requests', async () => {
    const [first, second] = await Promise.all([getScopes(), getScopes()]);

    expect(second).toBe(first);
  });

  it('rebuilds the workspace cache with the force param', async () => {
    const cached = await getScopes();
    const forced = await getScopes(true);

    // A rebuilt workspace cache has a new workspace.scopes{} set.
    expect(forced).not.toBe(cached);
    expect(scopesArray(forced)).toEqual(scopesArray(cached));

    // The rebuilt workspace is cached for subsequent requests.
    expect(await getScopes()).toBe(forced);
  });
});
