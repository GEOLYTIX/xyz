import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import hooks from '../lib/hooks.mjs';

// The hooks read and write the URL of the test page. The URL and the hooks.current are restored after each test.
const href = globalThis.location.href;

const search = () => new URL(globalThis.location.href).searchParams;

function setSearch(params) {
  const url = new URL(href);
  url.search = params;
  globalThis.history.replaceState({}, '', url);
}

describe('hooks', () => {
  beforeEach(() => {
    hooks.current = { layers: [], locations: [] };
    setSearch('');
  });

  afterEach(() => {
    globalThis.history.replaceState({}, '', href);
    vi.restoreAllMocks();
  });

  it('is assigned to mapp', () => {
    expect(mapp.hooks).toBe(hooks);
  });

  describe('parse', () => {
    it('parses the URL search params into hooks.current', () => {
      setSearch(
        '?locale=uk&z=10&layers=OSM,retail&locations=a!1&quiet=true&debug=false&list=a%2Cb',
      );

      hooks.parse();

      expect(hooks.current).toEqual({
        locale: 'uk',
        z: '10',
        layers: ['OSM', 'retail'],
        locations: ['a!1'],
        quiet: true,
        debug: false,
        list: ['a', 'b'],
      });
    });

    it('strips the token from the URL', () => {
      setSearch('?locale=uk&token=secret');

      hooks.parse();

      expect(hooks.current.token).toBeUndefined();
      expect(hooks.current.locale).toBe('uk');
      expect(search().has('token')).toBe(false);
      expect(search().get('locale')).toBe('uk');
    });
  });

  describe('set', () => {
    it('assigns the params to hooks.current and pushes them to the URL', () => {
      hooks.set({ locale: 'uk', z: 5 });

      expect(hooks.current.locale).toBe('uk');
      expect(search().get('locale')).toBe('uk');
      expect(search().get('z')).toBe('5');
    });

    it('logs an error if the URL cannot be updated', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});

      const err = new Error('pushState failed');

      vi.spyOn(globalThis.history, 'pushState').mockImplementation(() => {
        throw err;
      });

      hooks.set({ locale: 'uk' });

      expect(hooks.current.locale).toBe('uk');
      expect(error).toHaveBeenCalledWith(err);
    });
  });

  describe('push', () => {
    it('creates an array for a new key', () => {
      hooks.push('extra', 'a');

      expect(hooks.current.extra).toEqual(['a']);
    });

    it('adds a value once to an array', () => {
      hooks.push('layers', 'OSM');
      hooks.push('layers', 'retail');
      hooks.push('layers', 'OSM');

      expect(hooks.current.layers).toEqual(['OSM', 'retail']);
      expect(search().get('layers')).toBe('OSM,retail');
    });
  });

  describe('filter', () => {
    it('removes a value from an array', () => {
      hooks.set({ locations: ['a!1', 'a!2'] });

      hooks.filter('locations', 'a!1');

      expect(hooks.current.locations).toEqual(['a!2']);
      expect(search().get('locations')).toBe('a!2');
    });

    it('ignores keys which are not arrays', () => {
      const pushState = vi.spyOn(globalThis.history, 'pushState');

      hooks.current.locale = 'uk';

      hooks.filter('locale', 'uk');
      hooks.filter('missing', 'uk');

      expect(hooks.current.locale).toBe('uk');
      expect(pushState).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('empties an array and deletes other keys', () => {
      hooks.set({ locale: 'uk', layers: ['OSM'] });

      const layers = hooks.current.layers;

      hooks.remove('layers');
      hooks.remove('locale');

      // The array is emptied, not replaced.
      expect(hooks.current.layers).toBe(layers);
      expect(layers).toEqual([]);
      expect(hooks.current).not.toHaveProperty('locale');
      expect(search().toString()).toBe('');
    });

    it('removes all keys', () => {
      hooks.set({ locale: 'uk', z: 5, layers: ['OSM'] });

      hooks.removeAll();

      expect(hooks.current).toEqual({ layers: [], locations: [] });
      expect(search().toString()).toBe('');
    });
  });
});
