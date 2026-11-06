/**
Playwright fixtures for the MAPP.UI tests.

The tests open the XYZ default view from the testhost. The testhost serves the MAPP and MAPP.UI source modules for the built bundles of the view, so the tests don't require a build.

The tests don't use the network. The default view loads Openlayers from a CDN, which is served from the ol package. The script integrity of the view matches the ol package version in the catalog. Other external requests, eg. tiles and logos, are aborted.
*/

import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { test as base, expect } from '@playwright/test';

const require = createRequire(import.meta.url);

const olScript = await readFile(require.resolve('ol/dist/ol.js'));

export const test = base.extend({
  /**
  The page routes external requests and collects the uncaught errors of the page in page.errors.
  */
  page: async ({ page, baseURL }, use) => {
    const host = new URL(baseURL).host;

    // Only external requests are routed. Routing the testhost requests, eg. the source modules, stalls parallel page loads.
    await page.route(
      (url) => url.host !== host,
      (route) => {
        const url = new URL(route.request().url());

        if (
          url.hostname === 'cdn.jsdelivr.net' &&
          url.pathname.endsWith('/ol.js')
        ) {
          return route.fulfill({
            body: olScript,
            contentType: 'application/javascript',
            // The script is loaded with crossorigin="anonymous" and an integrity hash.
            headers: { 'Access-Control-Allow-Origin': '*' },
          });
        }

        return route.abort();
      },
    );

    page.errors = [];

    page.on('pageerror', (error) => page.errors.push(error));

    await use(page);
  },
});

export { expect };

/**
@function openView
@async

@description
Opens the XYZ default view for a locale of the UI test workspace and resolves once the view has added the layers and the locations panel.

@param {Page} page The Playwright page.
@param {string} locale The locale key.
@param {Object} [params] Additional URL params for the view, eg. `{ z: 12 }`.
*/
export async function openView(page, locale, params = {}) {
  const search = new URLSearchParams({ locale, ...params });

  await page.goto(`/view?${search}`);

  // The locations panel is added after the layers have been added to the mapview.
  await expect(page.locator('#locations')).toBeAttached();
}
