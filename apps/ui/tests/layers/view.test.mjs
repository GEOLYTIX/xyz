import { describe, expect, it, vi } from 'vitest';
import { changeEnd, layersListview } from '../helpers.mjs';

/**
Returns the data-id values of the panels in the layer.view content.
*/
function panels(layer) {
  return [...layer.view.querySelector(':scope > .content').children].map(
    (el) => el.dataset.id,
  );
}

/**
Configures the retail_points layer with a tables object. The layer is out of range below zoom level 13.
*/
function tables(layers) {
  layers.retail_points.tables = {
    12: null,
    13: layers.retail_points.table,
  };

  delete layers.retail_points.table;
}

describe('ui/layers/view', () => {
  it('creates a drawer with the layer name and panels', async () => {
    const { layer } = await layersListview();

    expect(layer.view.dataset.id).toBe('retail_points');
    expect(layer.view.classList).toContain('layer-view');
    expect(layer.view.classList).toContain('expandable');
    expect(layer.view.classList).not.toContain('empty');
    expect(layer.view.querySelector('.header h2').textContent).toBe('Grocery');
    expect(panels(layer)).toEqual(['style-drawer', 'filter-drawer']);
  });

  it('expands the drawer with a click on the header', async () => {
    const { layer } = await layersListview();

    const header = layer.view.querySelector(':scope > .header');

    header.click();

    expect(layer.view.classList).toContain('expanded');

    header.click();

    expect(layer.view.classList).not.toContain('expanded');
  });

  it('does not expand the empty view of a layer without panels', async () => {
    const { mapview } = await layersListview();

    const { view } = mapview.layers.osm;

    expect(view.classList).toContain('empty');
    expect(view.querySelector('.header h2').textContent).toBe('OSM Basemap');

    view.querySelector(':scope > .header').click();

    expect(view.classList).not.toContain('expanded');
  });

  it('does not create a view for a null layer.view', async () => {
    const { layer, listview } = await layersListview((layers) => {
      layers.retail_points.view = null;
    });

    expect(layer.view).toBeNull();
    expect(listview.node.querySelector('[data-id=retail_points]')).toBeNull();
  });

  it('creates a card which can not be collapsed for a false layer.drawer', async () => {
    const { layer } = await layersListview((layers) => {
      layers.retail_points.drawer = false;
    });

    expect(layer.view.classList).toContain('drawer');
    expect(layer.view.classList).not.toContain('expandable');
    expect(layer.view.querySelector(':scope > .header .caret')).toBeNull();
  });

  it('adds the meta panel before the style panel', async () => {
    const { layer } = await layersListview((layers) => {
      layers.retail_points.meta = 'UK grocery <b>stores</b>';
    });

    expect(panels(layer)).toEqual(['meta', 'style-drawer', 'filter-drawer']);
    expect(layer.view.querySelector('[data-id=meta]').innerHTML).toBe(
      'UK grocery <b>stores</b>',
    );
  });

  it('orders the panels by the viewConfig.keyOrder', async () => {
    const { layer } = await layersListview((layers) => {
      layers.retail_points.viewConfig = { keyOrder: ['filter', 'style'] };
    });

    expect(panels(layer)).toEqual(['filter-drawer', 'style-drawer']);
  });

  it('warns about the legacy panelOrder', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { layer } = await layersListview((layers) => {
      layers.retail_points.panelOrder = ['style-drawer', 'filter-drawer'];
    });

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'Layer [retail_points] has the legacy panelOrder',
      ),
    );

    warn.mockRestore();

    // The legacy panelOrder is inverted.
    expect(panels(layer)).toEqual(['filter-drawer', 'style-drawer']);
    expect(layer.panelOrder).toBeUndefined();
  });

  it('adds the legacy classList and the header buttons of the viewConfig', async () => {
    const { layer } = await layersListview((layers) => {
      layers.retail_points.classList = 'legacy-class';
      layers.retail_points.viewConfig = { displayToggle: false };
    });

    expect(layer.view.classList).toContain('legacy-class');
    expect(layer.viewConfig.headerOrder).toEqual(['zoomToFilteredExtentBtn']);
    expect(layer.view.querySelector('[data-id=display-toggle]')).toBeNull();
  });

  it('disables the view of a layer which is out of its tables zoom range', async () => {
    const { layer, mapview } = await layersListview(tables);

    const toggle = layer.view.querySelector('[data-id=display-toggle]');
    const style = layer.view.querySelector('[data-id=style-drawer]');

    layer.view.classList.add('expanded');

    const zoomOut = changeEnd(mapview);

    mapview.Map.getView().setZoom(12);

    await zoomOut;

    expect(layer.tableCurrent()).toBeNull();
    expect(layer.view.classList).not.toContain('expanded');
    expect(toggle.classList).toContain('disabled');
    expect(style.classList).toContain('disabled');

    const zoomIn = changeEnd(mapview);

    mapview.Map.getView().setZoom(13);

    await zoomIn;

    await layer.loading;

    expect(toggle.classList).not.toContain('disabled');
    expect(style.classList).not.toContain('disabled');
  });

  it('hides the view of a layer out of range with the viewConfig.hideDisabled', async () => {
    const { layer, mapview } = await layersListview((layers) => {
      tables(layers);

      layers.retail_points.viewConfig = { hideDisabled: true };
    });

    const zoomOut = changeEnd(mapview);

    mapview.Map.getView().setZoom(12);

    await zoomOut;

    expect(layer.view.classList).toContain('display-none');

    const zoomIn = changeEnd(mapview);

    mapview.Map.getView().setZoom(13);

    await zoomIn;

    await layer.loading;

    expect(layer.view.classList).not.toContain('display-none');
  });
});
