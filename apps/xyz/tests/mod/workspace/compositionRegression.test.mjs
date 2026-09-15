import workspaceEndpoint from '@geolytix/xyz-app/mod/workspace/_workspace.js';
import checkWorkspaceCache from '@geolytix/xyz-app/mod/workspace/cache.js';
import getLocale from '@geolytix/xyz-app/mod/workspace/getLocale.js';
import { createMocks } from 'node-mocks-http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const file = vi.hoisted(() => vi.fn());
vi.mock('@geolytix/xyz-app/mod/provider/file.js', () => ({ default: file }));

let source;

beforeEach(() => {
  vi.stubGlobal('xyzEnv', {
    WORKSPACE: 'file:workspace.json',
    WORKSPACE_AGE: 3600000,
    LEGACY_ROLES: true,
  });
  vi.spyOn(Date, 'now').mockReturnValue(1000000);
  source = {
    locale: { layers: { Base: { name: 'Base' } } },
    locales: {},
    templates: {},
  };
  file.mockReset().mockImplementation((path) => {
    if (path === 'workspace.json') return structuredClone(source);
    if (path === 'layer.json') return structuredClone(source.templates.layer);
    throw new Error(`Unexpected fixture path: ${path}`);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('locale composition through a warm workspace cache', () => {
  it.each(['test', 'compose'])(
    'keeps role definitions after the admin %s endpoint',
    async (key) => {
      source.locales.local = {
        options: { roles: { editor: { editable: true } } },
        layers: { Local: { name: 'Local' } },
        locales: ['child'],
      };
      source.templates.child = { layers: { Child: { name: 'Child' } } };
      await checkWorkspaceCache(true);
      const { req, res } = createMocks({
        params: { key, user: { admin: true } },
      });

      await workspaceEndpoint(req, res);
      expect(res.statusCode).toBe(200);
      const workspace = await checkWorkspaceCache();
      const locale = await getLocale({
        locale: 'local',
        layers: true,
        user: { roles: [] },
      });

      expect(locale.options).not.toHaveProperty('editable');
      expect(locale.layers.map((layer) => layer.key)).toEqual([
        'Base',
        'Local',
      ]);
      expect(workspace.locales).toEqual(source.locales);
      expect(workspace.templates).toBeDefined();
      expect(workspace.scopes).toBeInstanceOf(Set);
      expect(workspace).not.toHaveProperty('checksum');
      const nested = await getLocale({
        locale: ['local', 'child'],
        layers: true,
        user: { roles: [] },
      });
      expect(nested.options).not.toHaveProperty('editable');
      expect(nested.layers.map((layer) => layer.key)).toEqual([
        'Base',
        'Local',
        'Child',
      ]);
    },
  );

  it('inherits the default prototype when the locale has no prototype of its own', async () => {
    source.templates.base = { layers: { Base: { name: 'Template base' } } };
    source.locale.template = 'base';
    source.locales.local = { layers: { Local: { name: 'Local' } } };
    await checkWorkspaceCache(true);

    const locale = await getLocale({ locale: 'local', layers: true });

    expect(locale.layers.map((layer) => layer.key)).toEqual(['Base', 'Local']);
    expect(locale.layers[0].name).toBe('Base');
  });

  it.each(['inline', 'prototype', 'templates'])(
    'puts default layers first for a %s locale',
    async (kind) => {
      const definition = {
        layers: { Local: { name: 'Local' }, Base: { name: 'Local base' } },
      };
      source.templates.local = definition;
      source.locales.local =
        kind === 'inline'
          ? definition
          : kind === 'prototype'
            ? { template: 'local' }
            : { templates: ['local'] };
      const workspace = await checkWorkspaceCache(true);

      const locale = await getLocale({ locale: 'local', layers: true });

      expect(locale.layers.map((layer) => layer.key)).toEqual([
        'Base',
        'Local',
      ]);
      expect(locale.layers[0].name).toBe('Local base');
      expect(await checkWorkspaceCache()).toBe(workspace);
    },
  );

  it.each(['inline', 'named', 'src'])(
    'keeps %s layer roles fresh between users and role changes',
    async (kind) => {
      const layer = {
        infoj: [{ key: 'details', roles: { editor: { editable: true } } }],
      };
      source.templates.layer = layer;
      source.templates.remote = { src: 'file:layer.json' };
      source.locales.local = {
        layers: {
          Local:
            kind === 'inline'
              ? layer
              : { template: kind === 'src' ? 'remote' : 'layer' },
        },
      };
      const workspace = await checkWorkspaceCache(true);
      const raw = structuredClone(source);
      const request = async (roles) => {
        const locale = await getLocale({
          locale: 'local',
          layers: true,
          user: { roles },
        });
        return locale.layers.find((item) => item.key === 'Local').infoj[0];
      };

      expect(await request(['editor'])).toMatchObject({ editable: true });
      expect(await request([])).not.toHaveProperty('editable');
      expect(await request(['editor'])).toMatchObject({ editable: true });
      expect(await request([])).not.toHaveProperty('editable');
      expect(workspace.locales).toEqual(raw.locales);
      expect(await checkWorkspaceCache()).toBe(workspace);
      expect(
        file.mock.calls.filter(([path]) => path === 'workspace.json'),
      ).toHaveLength(1);
    },
  );
});
