import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createPolygon,
  drawPolygon,
  getRecord,
  renameLocation,
  render,
  resetTable,
  scratchPolygonLayer,
  tableRows,
  themeColours,
  themeStyles,
  themeValues,
  trashLocation,
} from '../../helpers.mjs';

// The scratch_polygon polygon which is created, renamed and deleted by the tests.
const ADDED = 'Added';
const RENAMED = 'Renamed';
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

The tests run in order and depend on each other. The add test creates a polygon with the mapp.location.create method, the rename test updates its name with the location.update() method, and the delete test deletes the same polygon with the location.trash() method. The table is reset to the rows before the tests once in the afterAll hook, also if a test fails.
*/
describe.sequential('ui/layers/legends/distributed', () => {
  let colours;
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

  /**
  Asserts that every rendered polygon has the colour of its category in the lookup, and that the seeded polygons have the colours of the first render.
  */
  function expectColours() {
    for (const s of themeStyles(layer)) {
      expect(s.fillColor, s.name).toBe(s.lookup);
    }

    expect(themeColours(layer)).toMatchObject(colours);
  }

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

    colours = themeColours(layer);
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

    expectColours();

    expect(legendValues(layer).sort()).toEqual([
      ADDED,
      'East',
      'North',
      'South',
      'West',
    ]);
  }, 20000);

  // The value of the renamed polygon is removed and the new value is assigned before the next render. The number of values in the legend is unchanged.
  it('redraws the legend for a polygon renamed with the location update method', async () => {
    expect(location).toBeDefined();

    const id = Number(location.id);

    await renameLocation(location, RENAMED);

    // The update method reloads the layer.
    await expect
      .poll(() => layer.featuresObject?.[id]?.name, { timeout: 5000 })
      .toBe(RENAMED);

    // The legend is redrawn after the render if the category values have changed.
    await render(layer);
    await render(layer);

    expect(legendValues(layer).sort()).toEqual([
      'East',
      'North',
      RENAMED,
      'South',
      'West',
    ]);

    expectColours();
  }, 20000);

  it('removes the value of the polygon deleted with the location trash method from the legend', async () => {
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

    expectColours();

    expect(legendValues(layer).sort()).toEqual([
      'East',
      'North',
      'South',
      'West',
    ]);
    expect(Object.keys(layer.style.theme.lookup)).not.toContain(RENAMED);
    expect(themeValues(layer)).not.toContain(RENAMED);
  }, 20000);
});

// The extent of the polygon which is drawn and deleted by the compare_areas tests. The polygon overlaps the seeded East polygon.
const DRAWN_EXTENT = [5000, 6700000, 25000, 6712000];

/**
Review of #3079: Simon's layer config, the compare_areas layer of the scratch locale. A distributed theme on the id field, which is also the qID.

The tests run in order and depend on each other. The add test draws a polygon with the mapview draw interaction, and the delete test deletes the same polygon with the location.trash() method. The table is reset to the rows before the tests once in the afterAll hook, also if a test fails.
*/
describe.sequential('ui/layers/legends/distributed on the qID field', () => {
  let dispose;
  let layer;
  let location;
  let seeded;

  beforeAll(async () => {
    ({ dispose, layer } = await scratchPolygonLayer('compare_areas'));

    seeded = await tableRows(layer);

    mapp.ui.layers.legends.distributed(layer);
  });

  afterAll(async () => {
    try {
      expect(await resetTable(layer, seeded)).toEqual(seeded);
    } finally {
      location?.remove?.();

      dispose();
    }
  });

  it('draws the ids of the seeded polygons in the legend', async () => {
    await expect
      .poll(() => legendValues(layer).sort(), { timeout: 5000 })
      .toEqual(seeded.map(([id]) => String(id)).sort());

    // The properties of the seeded polygons are loaded.
    await expect
      .poll(() => Object.keys(layer.featuresObject ?? {}).length, {
        timeout: 5000,
      })
      .toBe(seeded.length);

    await render(layer);
    await render(layer);

    expect(legendValues(layer).sort()).toEqual(
      seeded.map(([id]) => String(id)).sort(),
    );
  });

  it('draws the id of a polygon drawn with the draw interaction in the legend', async () => {
    location = await drawPolygon(layer, DRAWN_EXTENT);

    await expect
      .poll(() => legendValues(layer), { timeout: 10000 })
      .toContain(String(location.id));
  }, 20000);

  it('removes the id of the polygon deleted with the location trash method from the legend', async () => {
    expect(location).toBeDefined();

    const id = String(location.id);

    await trashLocation(location);

    // The trash method removes the location, which reloads the layer.
    await expect
      .poll(() => layer.featuresObject?.[id], { timeout: 5000 })
      .toBeUndefined();

    // The legend is redrawn after the render if the category values have changed.
    await render(layer);
    await render(layer);

    expect(legendValues(layer).sort()).toEqual(
      seeded.map(([id]) => String(id)).sort(),
    );
  }, 20000);
});
