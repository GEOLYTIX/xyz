import { createMocks } from 'node-mocks-http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

/**
 * ## View Tests
 * @module mod/view
 */

// Mock the logger to suppress output during tests.
vi.mock('@geolytix/xyz-app/mod/utils/logger.js', () => ({
  default: () => {},
}));

const { default: view } = await import('@geolytix/xyz-app/mod/view.js');
const { default: checkWorkspaceCache } = await import(
  '@geolytix/xyz-app/mod/workspace/cache.js'
);

// Suppress console.error from getTemplate for missing template tests.
const originalConsoleError = console.error;

describe('View: Testing View API', () => {
  beforeAll(async () => {
    console.error = () => {};

    globalThis.xyzEnv = {
      TITLE: 'VIEW TEST',
      WORKSPACE: 'file:./tests/assets/view.json',
    };

    await checkWorkspaceCache(true);
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  describe('Default view', () => {
    it('should return 200 without params', async () => {
      const { req, res } = createMocks();

      await view(req, res);

      expect(res.statusCode).toBe(200);
    });

    it('custom_view should be english', async () => {
      const { req, res } = createMocks({
        params: {
          template: 'custom_view',
        },
      });

      await view(req, res);

      const custom_view = res._getData();

      expect(custom_view.includes('lang="en"')).toBe(true);
    });

    it('ignore varcheck with special character', async () => {
      const { req, res } = createMocks({
        params: {
          template: 'custom_view',
          varcheck: 'foo₿ar',
        },
      });

      await view(req, res);

      const custom_view = res._getData();

      expect(custom_view).toEqual('<html lang="en"></html>');
    });
  });
});
