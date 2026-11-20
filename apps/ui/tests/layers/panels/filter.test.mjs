import { describe, expect, it, vi } from 'vitest';
import { capturePromises } from '../../helpers.mjs';
import {
  addFilterCard,
  catchRejections,
  countriesPanel,
  fakeTimers,
  groceryPanel,
  mockApplyFilter,
  POP_MAX,
  popFilter,
  selectFilter,
  updatePanel,
} from '../_filterHelpers.mjs';

/**
@function fields
@description
Returns the fields of the filter in the layer.filter.list.

@param {layer} layer A layer with a filter panel.
@returns {Array<string>} The filter fields.
*/
function fields(layer) {
  return layer.filter.list.map((filter) => filter.field);
}

/**
@function deferred
@description
Returns a promise with its resolve method.

@returns {Object} The promise and resolve method.
*/
function deferred() {
  let resolve;

  const promise = new Promise((r) => (resolve = r));

  return { promise, resolve };
}

describe('ui/layers/panels/filter', () => {
  describe('filterPanel', () => {
    it('creates the filter drawer with a dropdown of the entry filters', async () => {
      const { layer } = await groceryPanel();

      const drawer = layer.view.querySelector('[data-id=filter-drawer]');

      expect(layer.filter.view).toBe(drawer);
      expect(drawer.querySelector('.header h3').textContent).toBe(
        mapp.dictionary.filter_header,
      );
      expect(drawer.classList).toContain('disable-on-hide');

      expect(fields(layer)).toEqual(['retailer', 'fascia', 'open_date']);
      expect(layer.filter.list[0]).toMatchObject({
        distinct: true,
        field: 'retailer',
        title: 'Retailer',
        type: 'in',
      });

      const select = drawer.querySelector(
        '[data-id=retail_points-filter-dropdown]',
      );

      expect(
        [...select.options].map((option) => option.textContent.trim()),
      ).toEqual([
        mapp.dictionary.filter_select,
        'Retailer',
        'Fascia',
        'Open Date',
      ]);

      expect(layer.filter.feature_count.style.display).toBe('none');
    });

    it('clones the entry filter for the filter list', async () => {
      const { layer } = await groceryPanel();

      const entry = layer.infoj.find((entry) => entry.field === 'retailer');

      expect(layer.filter.list[0]).not.toBe(entry.filter);
      expect(layer.filter.list[0]).toMatchObject(entry.filter);
    });

    it('derives the filter type from the entry type with the includeAll flag', async () => {
      const { layer } = await groceryPanel((layers) => {
        layers.retail_points.filter.includeAll = true;
      });

      expect(
        layer.filter.list.map((filter) => [filter.field, filter.type]),
      ).toEqual([
        ['retailer', 'in'],
        ['fascia', 'in'],
        ['store_name', 'like'],
        ['postcode', 'like'],
        ['town', 'like'],
        ['size_band', 'like'],
        ['open_date', 'date'],
        ['pqi', 'like'],
      ]);
    });

    it('includes the entries in the filter.include array', async () => {
      const { layer } = await groceryPanel((layers) => {
        layers.retail_points.filter.include = ['store_name'];
      });

      expect(fields(layer)).toEqual([
        'retailer',
        'fascia',
        'store_name',
        'open_date',
      ]);
    });

    it('creates filter objects from string, true and empty entry filters', async () => {
      const { layer } = await groceryPanel((layers) => {
        const infoj = layers.retail_points.infoj;

        infoj.find((entry) => entry.field === 'store_name').filter = 'match';
        infoj.find((entry) => entry.field === 'town').filter = true;
        infoj.find((entry) => entry.field === 'pqi').filter = {};
      });

      expect(
        layer.filter.list.map((filter) => [filter.field, filter.type]),
      ).toEqual([
        ['retailer', 'in'],
        ['fascia', 'in'],
        ['store_name', 'match'],
        ['town', 'like'],
        ['open_date', 'date'],
        ['pqi', 'like'],
      ]);
    });

    it('excludes entries with filter false, skipEntry or in the filter.exclude array', async () => {
      const { layer } = await groceryPanel((layers) => {
        const retail_points = layers.retail_points;

        retail_points.filter.includeAll = true;
        retail_points.filter.exclude.push('postcode');

        const entry = (field) =>
          retail_points.infoj.find((entry) => entry.field === field);

        entry('town').filter = false;
        entry('size_band').skipEntry = true;
      });

      expect(fields(layer)).toEqual([
        'retailer',
        'fascia',
        'store_name',
        'open_date',
        'pqi',
      ]);
    });

    it('warns for a configured filter type which does not exist', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { layer } = await groceryPanel((layers) => {
        layers.retail_points.infoj.find(
          (entry) => entry.field === 'store_name',
        ).filter = { type: 'unknown' };
      });

      expect(warn).toHaveBeenCalledWith(
        'store_name: unknown is not a valid filter type',
      );
      expect(fields(layer)).not.toContain('store_name');
    });

    it('does not create a filter drawer for a hidden filter', async () => {
      const { layer } = await groceryPanel((layers) => {
        layers.retail_points.filter.hidden = true;
      });

      expect(layer.view.querySelector('[data-id=filter-drawer]')).toBeNull();
      expect(layer.filter.list).toBeUndefined();
    });

    it('does not create a filter drawer without filters', async () => {
      const { layer } = await groceryPanel((layers) => {
        layers.retail_points.filter.exclude.push(
          'retailer',
          'fascia',
          'open_date',
        );
      });

      expect(layer.view.querySelector('[data-id=filter-drawer]')).toBeNull();
      expect(layer.filter.list).toEqual([]);
    });

    it('creates a filter dialog for the legacy multi_filter configuration', async () => {
      const { layer } = await groceryPanel((layers) => {
        layers.retail_points.multi_filter = true;
        layers.retail_points.filter.hidden = true;
      });

      expect(layer.filter).toMatchObject({
        drawer: expect.any(Object),
        includeAll: true,
      });
      expect(layer.filter.dialog).toMatchObject({
        btn_label: 'Filtering',
        icon: 'filter_alt',
        title: 'Filtering',
        view: layer.filter.filter_list,
      });

      // The drawer is a button which shows the filter dialog.
      expect(layer.filter.view).toBe(layer.filter.dialog.btn);
      expect(layer.filter.view.textContent).toContain('Filtering');

      expect(layer.filter.clearAll.style.display).toBe('inline-block');
      expect(layer.filter.resetAll.style.display).toBe('inline-block');

      expect(fields(layer)).toContain('store_name');
    });

    it('adds the filter card to the filter dialog', async () => {
      const { layer } = await groceryPanel((layers) => {
        layers.retail_points.multi_filter = true;
      });

      const filter = await addFilterCard(layer, 'store_name');

      expect(filter.card.parentElement).toBe(layer.filter.filter_list);
    });
  });

  describe('filter cards', () => {
    it('adds a filter card for the selected filter', async () => {
      const { layer } = await groceryPanel();

      const filter = await addFilterCard(layer, 'retailer');

      expect(filter.selected).toBe(true);
      expect(filter.card.parentElement).toBe(
        layer.filter.view.querySelector('.content'),
      );
      expect(filter.card.querySelector('header span').textContent).toBe(
        'Retailer',
      );
      expect(filter.card.querySelectorAll('input[type=checkbox]')).toHaveLength(
        filter.in.length,
      );

      expect(layer.filter.clearAll.style.display).toBe('inline-block');
      expect(layer.filter.resetAll.style.display).toBe('inline-block');
    });

    it('adds the filter meta to the card', async () => {
      const { layer } = await groceryPanel((layers) => {
        layers.retail_points.infoj.find(
          (entry) => entry.field === 'open_date',
        ).filter.meta = 'Store opening date';
      });

      const filter = await addFilterCard(layer, 'open_date');

      expect(filter.card.querySelector('p').textContent).toBe(
        'Store opening date',
      );
    });

    it('removes the filter card with a second selection', async () => {
      const { layer } = await groceryPanel();

      const applyFilter = mockApplyFilter();

      const filter = await addFilterCard(layer, 'retailer');

      layer.filter.current.retailer = { in: ['Aldi'] };

      const card = filter.card;

      selectFilter(layer, 'retailer');

      expect(card.isConnected).toBe(false);
      expect(filter.card).toBeUndefined();
      expect(layer.filter.current).not.toHaveProperty('retailer');
      expect(applyFilter).toHaveBeenCalledWith(layer);

      expect(layer.filter.clearAll.style.display).toBe('none');
      expect(layer.filter.resetAll.style.display).toBe('none');
    });

    it('removes the filter card with the card close button', async () => {
      const { layer } = await groceryPanel();

      const filter = await addFilterCard(layer, 'open_date');

      const card = filter.card;

      card.querySelector('header button').click();

      expect(card.isConnected).toBe(false);
      expect(filter.card).toBeUndefined();
      expect(filter.selected).toBeUndefined();
      expect(filter.li.classList).not.toContain('selected');
    });

    it('removes all filter cards with the clearAll button', async () => {
      const { layer } = await groceryPanel();

      mockApplyFilter();

      const retailer = await addFilterCard(layer, 'retailer');

      const open_date = await addFilterCard(layer, 'open_date');

      layer.filter.current.retailer = { in: ['Aldi'] };

      layer.filter.clearAll.click();

      expect(retailer.card).toBeUndefined();
      expect(open_date.card).toBeUndefined();
      expect(layer.filter.current).toEqual({});
      expect(layer.filter.view.querySelectorAll('[data-id=card]')).toHaveLength(
        0,
      );
    });

    it('replaces all filter cards with new cards with the resetAll button', async () => {
      const { layer } = await groceryPanel();

      mockApplyFilter();

      const filter = await addFilterCard(layer, 'retailer');

      const card = filter.card;

      const chkbox = card.querySelector('input[type=checkbox]');

      chkbox.click();

      expect(layer.filter.current.retailer.in).toHaveLength(1);

      layer.filter.resetAll.click();

      expect(layer.filter.current).not.toHaveProperty('retailer');

      await expect.poll(() => filter.card).not.toBe(card);

      expect(filter.card.isConnected).toBe(true);
      expect(card.isConnected).toBe(false);
      expect(filter.card.querySelectorAll('input:checked')).toHaveLength(0);
    });

    it('filters the layer with a checkbox and shows the location count', async () => {
      const { layer } = await groceryPanel();

      const filter = await addFilterCard(layer, 'retailer');

      const counts = capturePromises(mapp.ui.utils, 'locationCount');

      const chkbox = [...filter.card.querySelectorAll('label.checkbox')].find(
        (label) => label.textContent.trim() === 'Lidl',
      );

      chkbox.querySelector('input').click();

      expect(layer.filter.current.retailer).toEqual({ in: ['Lidl'] });

      // applyFilter reloads the layer and the changeEnd updates the panel. The updatePanel method counts the locations after its debounce. The layer.Features of a wkt layer are counted without a location_count query.
      // An updatePanel call from before the checkbox click can count the unfiltered locations. The counts are taken until the filtered count is shown in the panel.
      for (;;) {
        const count = await counts.next();

        if (count === 9 && layer.filter.count.textContent === '9') break;
      }

      expect(layer.Features).toHaveLength(9);

      expect(layer.filter.count.textContent).toBe('9');

      expect(layer.filter.feature_count.style.display).toBe('block');
    });
  });

  describe('updatePanel', () => {
    it('shows the location count after a second', async () => {
      const { layer } = await countriesPanel(popFilter('integer'));

      const count = String(await mapp.ui.utils.locationCount(layer));

      const locationCount = vi.spyOn(mapp.ui.utils, 'locationCount');

      fakeTimers();

      updatePanel(layer)(layer);

      expect(layer.filter.count.textContent).toBe('?');
      expect(layer.filter.feature_count.style.display).toBe('block');

      await vi.advanceTimersByTimeAsync(999);

      expect(locationCount).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);

      expect(locationCount).toHaveBeenCalledWith(layer);

      await expect.poll(() => layer.filter.count.textContent).toBe(count);

      expect(layer.filter.countedFilter).toBe('{}');
    });

    it('does not update the panel of a hidden layer', async () => {
      const { layer } = await countriesPanel(popFilter('integer'));

      layer.hide();

      const locationCount = vi.spyOn(mapp.ui.utils, 'locationCount');

      fakeTimers();

      updatePanel(layer)(layer);

      await vi.advanceTimersByTimeAsync(1000);

      expect(layer.filter.count.textContent).toBe('');
      expect(locationCount).not.toHaveBeenCalled();
    });

    it('shows the last location count for an unchanged filter', async () => {
      const { layer } = await countriesPanel(popFilter('integer'));

      layer.filter.current.continent = { in: ['Europe'] };

      Object.assign(layer.filter, {
        countValue: '39',
        countedFilter: JSON.stringify(layer.filter.current),
      });

      const locationCount = vi.spyOn(mapp.ui.utils, 'locationCount');

      fakeTimers();

      updatePanel(layer)(layer);

      // The count is not pending.
      expect(layer.filter.count.textContent).toBe('');

      await vi.advanceTimersByTimeAsync(1000);

      expect(layer.filter.count.textContent).toBe('39');
      expect(layer.filter.feature_count.style.display).toBe('block');
      expect(locationCount).not.toHaveBeenCalled();
    });

    it('queries the location count for a viewport filter', async () => {
      const { layer } = await countriesPanel((layers) => {
        popFilter('integer')(layers);
        layers.countries.filter = { viewport: true };
      });

      Object.assign(layer.filter, {
        countValue: '39',
        countedFilter: JSON.stringify(layer.filter.current),
      });

      const locationCount = vi
        .spyOn(mapp.ui.utils, 'locationCount')
        .mockResolvedValue(12);

      fakeTimers();

      updatePanel(layer)(layer);

      expect(layer.filter.count.textContent).toBe('?');

      await vi.advanceTimersByTimeAsync(1000);

      expect(locationCount).toHaveBeenCalledTimes(1);
      expect(layer.filter.count.textContent).toBe('12');
    });

    it('discards a location count which is outdated', async () => {
      const { layer } = await countriesPanel(popFilter('integer'));

      const first = deferred();
      const second = deferred();

      vi.spyOn(mapp.ui.utils, 'locationCount')
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise);

      fakeTimers();

      updatePanel(layer)(layer);

      await vi.advanceTimersByTimeAsync(1000);

      // The filter changes while the first count is pending.
      layer.filter.current.continent = { in: ['Europe'] };

      updatePanel(layer)(layer);

      first.resolve(177);

      await first.promise;

      expect(layer.filter.count.textContent).toBe('?');
      expect(layer.filter.countedFilter).toBeUndefined();

      await vi.advanceTimersByTimeAsync(1000);

      second.resolve(39);

      await expect.poll(() => layer.filter.count.textContent).toBe('39');

      expect(layer.filter.countedFilter).toBe(
        JSON.stringify(layer.filter.current),
      );
    });

    it('does not cache a failed location count', async () => {
      const { layer } = await countriesPanel(popFilter('integer'));

      vi.spyOn(mapp.ui.utils, 'locationCount').mockResolvedValue(undefined);

      fakeTimers();

      updatePanel(layer)(layer);

      await vi.advanceTimersByTimeAsync(1000);

      expect(layer.filter.count.textContent).toBe('?');
      expect(layer.filter.countedFilter).toBeUndefined();
    });

    it('hides the feature count with the layer', async () => {
      const { layer } = await groceryPanel();

      // The clearAll button is visible in the expanded layer view and filter drawer.
      layer.view.classList.add('expanded');
      layer.filter.view.classList.add('expanded');

      await addFilterCard(layer, 'open_date');

      layer.filter.feature_count.style.display = 'block';

      layer.hide();

      expect(layer.filter.feature_count.style.display).toBe('none');
    });

    it('skips the min and max query for a filter with Min and Max', async () => {
      const { layer } = await countriesPanel(
        popFilter({
          Max: POP_MAX,
          max: POP_MAX,
          Min: 100,
          min: 100,
          type: 'integer',
        }),
      );

      mockApplyFilter();

      await addFilterCard(layer, 'pop_est');

      const generateMinMax = vi.spyOn(mapp.ui.layers.filters, 'generateMinMax');

      vi.spyOn(mapp.ui.utils, 'locationCount').mockResolvedValue(150);

      fakeTimers();

      updatePanel(layer)(layer);

      // The mocked location count resolves within the debounce.
      await vi.advanceTimersByTimeAsync(1000);

      expect(layer.filter.count.textContent).toBe('150');

      expect(generateMinMax).not.toHaveBeenCalled();
    });

    // The filter card of a numeric filter with configured min and max has no filter.slider to replace.
    // https://github.com/GEOLYTIX/xyz/issues/3138
    it.fails(
      'updates the slider of a numeric filter with configured min and max',
      async () => {
        const reasons = catchRejections();

        const { layer } = await countriesPanel(
          popFilter({ max: POP_MAX, min: 0, type: 'integer' }),
        );

        mockApplyFilter();

        const filter = await addFilterCard(layer, 'pop_est');

        vi.spyOn(mapp.ui.utils, 'locationCount').mockResolvedValue(150);

        updatePanel(layer)(layer);

        // The updatePanel timeout callback throws a TypeError for the undefined filter.slider.
        await expect
          .poll(() => reasons.length || layer.filter.count.textContent, {
            timeout: 5000,
          })
          .not.toBe('?');

        expect(reasons).toEqual([]);
        expect(layer.filter.count.textContent).toBe('150');
        expect(filter.card.contains(filter.slider)).toBe(true);
      },
    );

    // A Min of 0 is not fixed, so the min and max are queried for a filter with Min and Max.
    // https://github.com/GEOLYTIX/xyz/issues/3138
    it.fails(
      'skips the min and max query for a filter with a Min of 0',
      async () => {
        const reasons = catchRejections();

        const { layer } = await countriesPanel(
          popFilter({
            Max: POP_MAX,
            max: POP_MAX,
            Min: 0,
            min: 0,
            type: 'integer',
          }),
        );

        mockApplyFilter();

        await addFilterCard(layer, 'pop_est');

        const generateMinMax = vi.spyOn(
          mapp.ui.layers.filters,
          'generateMinMax',
        );

        vi.spyOn(mapp.ui.utils, 'locationCount').mockResolvedValue(150);

        updatePanel(layer)(layer);

        await expect
          .poll(() => reasons.length || layer.filter.count.textContent, {
            timeout: 5000,
          })
          .not.toBe('?');

        expect(generateMinMax).not.toHaveBeenCalled();
        expect(reasons).toEqual([]);
      },
    );
  });
});
