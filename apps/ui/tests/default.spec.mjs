import { expect, openView, test } from './fixtures.mjs';

test.describe('default view', () => {
  test('loads the MAPP and MAPP.UI libraries from source', async ({ page }) => {
    await openView(page, 'grocery');

    const libraries = await page.evaluate(() => ({
      version: mapp.version,
      ui: typeof mapp.ui?.layers?.listview,
      ol: ol.util.VERSION,
    }));

    expect(libraries).toEqual({
      version: expect.any(String),
      ui: 'function',
      ol: '10.8.0',
    });

    expect(page.errors).toEqual([]);
  });

  test('lists the locale layers in the layers panel', async ({ page }) => {
    await openView(page, 'grocery');

    const layers = page.locator('#layers');

    await expect(layers.getByText('OSM Basemap')).toBeVisible();
    await expect(layers.getByText('Grocery', { exact: true })).toBeVisible();
  });

  test('sets the locale and view as URL params', async ({ page }) => {
    await openView(page, 'grocery');

    await expect(page).toHaveURL(/locale=grocery/);
    await expect(page).toHaveURL(/z=13/);
  });
});
