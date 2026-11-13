import { describe, expect, it } from 'vitest';
import { layersListview } from '../helpers.mjs';

describe('ui/layers/listview', () => {
  it('returns without a target', () => {
    expect(mapp.ui.layers.listview({ layers: {} })).toBeUndefined();
  });

  it('adds the layer views to the target and dispatches addLayerView', async () => {
    const { events, listview, mapview } = await layersListview();

    expect([...listview.node.children]).toEqual([
      mapview.layers.osm.view,
      mapview.layers.retail_points.view,
    ]);

    expect(events).toEqual([mapview.layers.osm, mapview.layers.retail_points]);
  });

  it('adds a layer view with the add method', async () => {
    const { layer, listview } = await layersListview();

    const target = document.createElement('div');

    const added = mapp.ui.layers.listview({ target });

    expect(target.children.length).toBe(0);

    added.add(layer);

    // The add method creates a new layer.view.
    expect(target.firstElementChild).toBe(layer.view);
    expect(listview.node.contains(layer.view)).toBe(false);
  });

  it('does not create a view for a hidden layer', async () => {
    const { events, listview, mapview } = await layersListview((layers) => {
      layers.osm.hidden = true;
    });

    expect(mapview.layers.osm.view).toBeUndefined();
    expect(listview.node.children.length).toBe(1);
    expect(events).toEqual([mapview.layers.retail_points]);
  });

  it('adds grouped layers to a group drawer with the groupmeta', async () => {
    const { events, layer, listview, mapview } = await layersListview(
      (layers) => {
        // The group is created with the groupClassList of its first layer.
        layers.osm.group = 'Retail';
        layers.osm.groupClassList = 'retail-group';
        layers.retail_points.group = 'Retail';
        layers.retail_points.groupmeta = '<b>Stores</b>';
      },
    );

    const group = listview.groups.Retail;

    expect(group.list).toEqual([mapview.layers.osm, layer]);
    expect(listview.node.children.length).toBe(1);
    expect(group.drawer.parentElement).toBe(listview.node);
    expect(group.drawer.dataset.id).toBe('Retail');
    expect(group.drawer.classList).toContain('layer-group');
    expect(group.drawer.classList).toContain('retail-group');
    expect(group.drawer.querySelector('h2').textContent).toBe('Retail');
    expect(group.meta.innerHTML).toContain('<b>Stores</b>');
    expect(layer.view.parentElement).toBe(group.drawer);
    expect(events.length).toBe(2);
  });

  it('hides the displayed layers of a group', async () => {
    const { layer, listview, mapview } = await layersListview((layers) => {
      layers.osm.group = 'Retail';
      layers.retail_points.group = 'Retail';
    });

    const { hideLayers } = listview.groups.Retail;

    // The retail_points layer is displayed.
    expect(hideLayers.style.visibility).toBe('visible');

    hideLayers.click();

    expect(layer.display).toBe(false);
    expect(mapview.Map.getLayers().getArray()).not.toContain(layer.L);
    expect(hideLayers.style.visibility).toBe('hidden');

    layer.show();

    await layer.loading;

    expect(hideLayers.style.visibility).toBe('visible');
  });
});
