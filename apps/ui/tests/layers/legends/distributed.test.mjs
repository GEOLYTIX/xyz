import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createPolygon,
  getRecord,
  render,
  resetTable,
  scratchPolygonLayer,
  tableRows,
  themeStyles,
  themeValues,
  trashLocation,
} from '../../helpers.mjs';

// The scratch_polygon polygon which is created and deleted by the tests.
const ADDED = 'Added';
const ADDED_EXTENT = [15000, 6690000, 25000, 6700000];

/**
Returns the feature values in the labels of the legend. The label of a distributed theme category is the list of its values.
*/
function legendValues(layer) {
  return [...layer.style.legend.querySelectorAll('.label')].flatMap((el) =>
    el.textContent.trim().split(', '),
  );
}

/**
Review of #3079: an mvt layer with wkt_properties and a distributed theme. The legend and the colours are not updated after a polygon has been created or deleted.

The tests run in order and depend on each other. The add test creates a polygon with the mapp.location.create method, and the delete test deletes the same polygon with the location.trash() method. The table is reset to the rows before the tests once in the afterAll hook, also if a test fails.
*/
describe.sequential('ui/layers/legends/distributed', () => {
  let dispose;
  let layer;
  let location;
  let seeded;

  beforeAll(async () => {
    ({ dispose, layer } = await scratchPolygonLayer());

    seeded = await tableRows(layer);

    // The legend is redrawn after a render if values have been assigned to the theme categories.
    mapp.ui.layers.legends.distributed(layer);
  });

  afterAll(async () => {
    try {
      // The created polygon is deleted with the location_delete query if a test has failed before the delete.
      expect(await resetTable(layer, seeded)).toEqual(seeded);
    } finally {
      // The trash method has already removed the location and its remove method.
      location?.remove?.();

      dispose();
    }
  });

  it('draws the seeded polygons in the legend', async () => {
    expect(seeded.map(([, name]) => name)).toEqual([
      'North',
      'East',
      'South',
      'West',
    ]);

    await expect
      .poll(() => legendValues(layer).sort(), { timeout: 5000 })
      .toEqual(['East', 'North', 'South', 'West']);

    for (const s of themeStyles(layer)) {
      expect(s.fillColor, s.name).toBe(s.lookup);
    }
  });

  it('adds the value of a polygon created with the location create method to the legend', async () => {
    location = await createPolygon(layer, ADDED, ADDED_EXTENT);

    const id = Number(location.id);

    // The create method reloads the layer. The tiles must be refreshed for the geometry of the new polygon.
    await expect
      .poll(() => legendValues(layer), { timeout: 10000 })
      .toContain(ADDED);

    expect(Object.keys(layer.style.theme.lookup)).toContain(ADDED);
    expect(themeValues(layer)).toContain(ADDED);

    // The create method checks the loaded tiles for the new feature after a second and reloads the layer again if the feature has not been found.
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await render(layer);

    // The new polygon has a category colour.
    const added = themeStyles(layer).find((s) => s.id === id);

    expect(
      layer.style.theme.categories.map((cat) => cat.style.fillColor),
    ).toContain(added?.fillColor);

    // Every rendered polygon has the colour of its category in the lookup.
    for (const s of themeStyles(layer)) {
      expect(s.fillColor, s.name).toBe(s.lookup);
    }

    expect(legendValues(layer).sort()).toEqual([
      ADDED,
      'East',
      'North',
      'South',
      'West',
    ]);
  }, 20000);

  // The distributed theme assigns the values of the rendered features to its lookup and categories, and the legend is drawn from the category values. A value is never removed, so the value of a deleted feature remains in the legend.
  it.fails(
    'removes the value of the polygon deleted with the location trash method from the legend',
    async () => {
      expect(location).toBeDefined();

      const id = Number(location.id);

      await trashLocation(location);

      expect(await getRecord(layer, id)).toBeNull();

      // The trash method removes the location, which reloads the layer.
      await expect
        .poll(() => layer.featuresObject?.[id], { timeout: 5000 })
        .toBeUndefined();

      // The legend is redrawn after the render if the category values have changed.
      await render(layer);
      await render(layer);

      // The deleted polygon is not rendered, every remaining polygon has the colour of its category in the lookup.
      expect(themeStyles(layer).map((s) => s.id)).not.toContain(id);

      for (const s of themeStyles(layer)) {
        expect(s.fillColor, s.name).toBe(s.lookup);
      }

      expect(legendValues(layer).sort()).toEqual([
        'East',
        'North',
        'South',
        'West',
      ]);
      expect(Object.keys(layer.style.theme.lookup)).not.toContain(ADDED);
      expect(themeValues(layer)).not.toContain(ADDED);
    },
    20000,
  );
});
