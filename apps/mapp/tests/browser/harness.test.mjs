/**
## /tests/browser/harness

Guards the `browser` project's harness.

These assertions are the reason the project exists: real OpenLayers, a real
rendering engine, and a mapview that actually constructs. If they fail, no
mapview test in this project can be trusted.

@module /tests/browser/harness
*/

import { afterEach, describe, expect, it } from 'vitest';
import { createMapview, renderComplete } from './fixtures/mapview.mjs';

describe('browser test harness', () => {
  let mapview;

  afterEach(() => {
    mapview?.remove();
    mapview = undefined;
  });

  it('loads the real OpenLayers namespace bundle', () => {
    expect(ol.util.VERSION).toMatch(/^10\.8/);

    // The namespace shape lib/** relies on, rather than the ES module entry
    // points of the ol package.
    expect(typeof ol.Map).toEqual('function');
    expect(typeof ol.layer.Tile).toEqual('function');
    expect(typeof ol.source.XYZ).toEqual('function');
    expect(typeof ol.proj.transform).toEqual('function');
  });

  it('assembles the mapp namespace against real OpenLayers', () => {
    expect(mapp.version).toBeDefined();
    expect(typeof mapp.Mapview).toEqual('function');
    expect(mapp.ui.elements).toBeDefined();
  });

  it('constructs a mapview with a real ol.Map', async () => {
    mapview = await createMapview();

    expect(mapview.Map).toBeInstanceOf(ol.Map);
    expect(mapview.target).toBeInstanceOf(HTMLElement);
    expect(mapview.srid).toEqual('3857');

    // Decoration attaches the mapview API.
    expect(typeof mapview.addLayer).toEqual('function');
    expect(typeof mapview.fitView).toEqual('function');
    expect(typeof mapview.geoJSON).toEqual('function');
  });

  it('renders a frame and reports a real viewport size', async () => {
    mapview = await createMapview();

    await renderComplete(mapview);

    const [width, height] = mapview.Map.getSize();

    expect(width).toEqual(800);
    expect(height).toEqual(600);
  });

  it('computes a real extent from the view', async () => {
    mapview = await createMapview();

    await renderComplete(mapview);

    const extent = mapview.Map.getView().calculateExtent(mapview.Map.getSize());

    expect(extent).toHaveLength(4);

    const [minX, minY, maxX, maxY] = extent;

    expect(maxX).toBeGreaterThan(minX);
    expect(maxY).toBeGreaterThan(minY);
  });
});
