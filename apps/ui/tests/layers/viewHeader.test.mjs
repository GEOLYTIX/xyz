import { describe, expect, it } from 'vitest';
import { changeEnd, layersListview } from '../helpers.mjs';

describe('ui/layers/viewHeader', () => {
  describe('displayToggle', () => {
    it('is toggled on for a displayed layer only', async () => {
      const { layer, mapview } = await layersListview();

      const toggle = (l) => l.view.querySelector('[data-id=display-toggle]');

      expect(toggle(layer).classList).toContain('toggle-on');
      expect(toggle(mapview.layers.osm).classList).not.toContain('toggle-on');
    });

    it('hides and shows the layer', async () => {
      const { layer, mapview } = await layersListview();

      const toggle = layer.view.querySelector('[data-id=display-toggle]');

      toggle.click();

      expect(layer.display).toBe(false);
      expect(toggle.classList).not.toContain('toggle-on');
      expect(mapview.Map.getLayers().getArray()).not.toContain(layer.L);

      toggle.click();

      await layer.loading;

      expect(layer.display).toBe(true);
      expect(toggle.classList).toContain('toggle-on');
      expect(mapview.Map.getLayers().getArray()).toContain(layer.L);
    });

    it('follows the layer show and hide methods', async () => {
      const { layer } = await layersListview();

      const toggle = layer.view.querySelector('[data-id=display-toggle]');

      layer.hide();

      expect(toggle.classList).not.toContain('toggle-on');

      layer.show();

      await layer.loading;

      expect(toggle.classList).toContain('toggle-on');
    });
  });

  describe('zoomToFilteredExtentBtn', () => {
    it('is displayed after a changeEnd with a current filter', async () => {
      const { layer, mapview } = await layersListview();

      const btn = layer.view.querySelector('[data-id=zoomToFilteredExtentBtn]');

      expect(btn.style.display).toBe('none');

      layer.filter.current.retailer = { in: ['Waitrose'] };

      const zoom = changeEnd(mapview);

      mapview.Map.getView().setZoom(12);

      await zoom;

      await layer.loading;

      expect(btn.style.display).toBe('inline-block');

      delete layer.filter.current.retailer;

      const zoomBack = changeEnd(mapview);

      mapview.Map.getView().setZoom(13);

      await zoomBack;

      await layer.loading;

      expect(btn.style.display).toBe('none');
    });
  });

  describe('zoomBtn', () => {
    it('is not created for a layer without tables', async () => {
      const { layer } = await layersListview();

      expect(layer.view.querySelector('[data-id=zoom-to]')).toBeNull();
    });

    it('zooms the mapview into the tables range and shows the layer', async () => {
      const { layer, mapview } = await layersListview((layers) => {
        layers.retail_points.tables = {
          12: null,
          13: layers.retail_points.table,
        };

        delete layers.retail_points.table;
      });

      const btn = layer.view.querySelector('[data-id=zoom-to]');

      const zoomOut = changeEnd(mapview);

      mapview.Map.getView().setZoom(11);

      await zoomOut;

      expect(layer.display).toBe(false);
      expect(btn.style.display).toBe('block');

      const zoomIn = changeEnd(mapview);

      btn.click();

      await zoomIn;

      await layer.loading;

      expect(mapview.Map.getView().getZoom()).toBe(13);
      expect(layer.display).toBe(true);
      expect(btn.style.display).toBe('none');
    });
  });

  describe('popoutBtn', () => {
    it('is added to the header with the viewConfig.popoutBtn', async () => {
      const { layer } = await layersListview((layers) => {
        layers.retail_points.viewConfig = { popoutBtn: true };
      });

      expect(layer.viewConfig.headerOrder).toContain('popoutBtn');
      expect(
        layer.view.querySelectorAll(':scope > .header [data-id=popout-btn]')
          .length,
      ).toBe(1);
    });
  });
});
