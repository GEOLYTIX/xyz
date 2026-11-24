import { describe, expect, it, vi } from 'vitest';
import { groceryMapview } from '../helpers.mjs';
import {
  countriesLayer,
  fakeTimers,
  filterNode,
  mockApplyFilter,
  POP_MAX,
  POP_MIN,
} from './_filterHelpers.mjs';

const { filters } = mapp.ui.layers;

/**
@function retailPoints
@async

@description
Returns the retail_points layer of a grocery mapview.

@returns {Promise<layer>} The retail_points layer.
*/
async function retailPoints() {
  const mapview = await groceryMapview();

  return mapview.layers.retail_points;
}

/**
@function check
@description
Toggles the checkbox with a label in a filter node.

@param {HTMLElement} node The filter node.
@param {string} label The checkbox label.
*/
function check(node, label) {
  const chkbox = [...node.querySelectorAll('label.checkbox')].find(
    (el) => el.textContent.trim() === label,
  );

  toggle(chkbox.querySelector('input'));
}

/**
@function toggle
@description
Toggles a checkbox input and dispatches the change event. A click on a checkbox which is not in the document does not dispatch the change event.

@param {HTMLInputElement} input The checkbox input.
*/
function toggle(input) {
  input.checked = !input.checked;
  input.dispatchEvent(new Event('change'));
}

/**
@function histogramQueries
@description
Returns the histogram queries of a mapp.utils.xhr mock.

@param {MockInstance} xhr The xhr mock.
@returns {Array} The histogram query calls.
*/
function histogramQueries(xhr) {
  return xhr.mock.calls.filter(([url]) =>
    String(url).includes('template=histogram'),
  );
}

describe('ui/layers/filters', () => {
  describe('applyFilter', () => {
    it('reloads the layer once 500ms after the last call', async () => {
      const layer = await retailPoints();

      const reload = vi.spyOn(layer, 'reload').mockImplementation(() => {});

      fakeTimers();

      filters.applyFilter(layer);
      filters.applyFilter(layer);

      vi.advanceTimersByTime(499);

      expect(reload).not.toHaveBeenCalled();

      filters.applyFilter(layer);

      vi.advanceTimersByTime(499);

      expect(reload).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);

      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('draws the legend, updates the filter histograms and dispatches changeEnd', async () => {
      const layer = await retailPoints();

      vi.spyOn(layer, 'reload').mockImplementation(() => {});

      const drawLegend = vi
        .spyOn(mapp.ui.layers, 'drawLegend')
        .mockImplementation(() => {});

      const update = vi.fn();

      layer.filter.list = [{ histogram: { update } }, { field: 'retailer' }];

      const changeEnd = vi.fn();

      layer.mapview.target.addEventListener('changeEnd', changeEnd);

      fakeTimers();

      filters.applyFilter(layer);

      vi.advanceTimersByTime(500);

      expect(drawLegend).toHaveBeenCalledWith(layer);
      expect(update).toHaveBeenCalledTimes(1);
      expect(changeEnd).toHaveBeenCalledTimes(1);

      clearTimeout(layer.mapview.changeEndTimer);
    });

    it('filters the layer features', async () => {
      const layer = await retailPoints();

      layer.filter.current.store_name = { like: 'Lidl' };

      filters.applyFilter(layer);

      // The viewport has 283 features and 9 Lidl stores.
      expect(layer.Features).toHaveLength(283);

      await expect.poll(() => layer.Features.length).toBe(9);
    });
  });

  describe('like and match', () => {
    it('assigns the encoded input value as filter on keyup', async () => {
      const layer = await retailPoints();

      const applyFilter = mockApplyFilter();

      const input = filters.like(layer, { field: 'store_name', type: 'like' });

      expect(input.type).toBe('text');

      input.value = 'Lidl Walworth';
      input.dispatchEvent(new KeyboardEvent('keyup'));

      expect(layer.filter.current.store_name).toEqual({
        like: 'Lidl%20Walworth',
      });
      expect(applyFilter).toHaveBeenCalledWith(layer);
    });

    it('prepends a wildcard with the leading_wildcard flag', async () => {
      const layer = await retailPoints();

      mockApplyFilter();

      const input = filters.like(layer, {
        field: 'store_name',
        leading_wildcard: true,
        type: 'like',
      });

      input.value = 'Walworth';
      input.dispatchEvent(new KeyboardEvent('keyup'));

      expect(layer.filter.current.store_name).toEqual({ like: '%25Walworth' });
    });

    it('assigns a match filter', async () => {
      const layer = await retailPoints();

      mockApplyFilter();

      const input = filters.match(layer, {
        field: 'store_name',
        type: 'match',
      });

      input.value = 'Lidl';
      input.dispatchEvent(new KeyboardEvent('keyup'));

      expect(layer.filter.current.store_name).toEqual({ match: 'Lidl' });
    });

    it('deletes the filter for an empty input', async () => {
      const layer = await retailPoints();

      const applyFilter = mockApplyFilter();

      const input = filters.like(layer, { field: 'store_name', type: 'like' });

      input.value = 'Lidl';
      input.dispatchEvent(new KeyboardEvent('keyup'));

      input.value = '';
      input.dispatchEvent(new KeyboardEvent('keyup'));

      expect(layer.filter.current).not.toHaveProperty('store_name');
      expect(applyFilter).toHaveBeenCalledTimes(2);
    });
  });

  describe.each(['boolean', 'null'])('%s', (type) => {
    it('assigns a false filter on creation', async () => {
      const layer = await retailPoints();

      const applyFilter = mockApplyFilter();

      const node = filters[type](layer, { field: 'add_two', title: 'Title' });

      expect(layer.filter.current.add_two).toEqual({ [type]: false });
      expect(applyFilter).toHaveBeenCalledWith(layer);
      expect(node.querySelector('input').checked).toBe(false);
      expect(node.textContent.trim()).toBe('Title');
    });

    it('toggles the filter with the checkbox', async () => {
      const layer = await retailPoints();

      const applyFilter = mockApplyFilter();

      const node = filters[type](layer, { field: 'add_two' });

      toggle(node.querySelector('input'));

      expect(layer.filter.current.add_two).toEqual({ [type]: true });

      toggle(node.querySelector('input'));

      expect(layer.filter.current.add_two).toEqual({ [type]: false });
      expect(applyFilter).toHaveBeenCalledTimes(3);
    });

    it.each([
      [{ label: 'Label', title: 'Title' }, 'Label'],
      [{ title: 'Title' }, 'Title'],
      [{}, 'chkbox'],
    ])('labels the checkbox for %o', async (params, label) => {
      const layer = await retailPoints();

      mockApplyFilter();

      const node = filters[type](layer, { field: 'add_two', ...params });

      expect(node.textContent.trim()).toBe(label);
    });
  });

  describe('in and ni', () => {
    it('creates a checkbox for each distinct value of the field', async () => {
      const layer = await retailPoints();

      const filter = { field: 'fascia', type: 'in' };

      const node = await filters.in(layer, filter);

      expect(node.className).toBe('filter');
      expect(filter.in).toHaveLength(53);
      expect(filter.in).toContain('Lidl');
      expect(node.querySelectorAll('input[type=checkbox]')).toHaveLength(53);
    });

    it('queries the distinct values with the current filter of other fields', async () => {
      const layer = await retailPoints();

      const applyFilter = mockApplyFilter();

      layer.filter.current.retailer = { in: ['Lidl'] };
      layer.filter.current.fascia = { in: ['Aldi'] };

      const filter = { field: 'fascia', type: 'in' };

      await filters.in(layer, filter);

      expect(filter.in).toEqual(['Lidl']);

      // The current filter on the field is deleted.
      expect(layer.filter.current).toEqual({ retailer: { in: ['Lidl'] } });
      expect(applyFilter).toHaveBeenCalledWith(layer);
    });

    it('creates checkboxes for the configured values without a query', async () => {
      const layer = await retailPoints();

      const xhr = vi.spyOn(mapp.utils, 'xhr');

      const node = await filters.in(layer, {
        field: 'retailer',
        in: ['Aldi', 'Lidl'],
        type: 'in',
      });

      expect(xhr).not.toHaveBeenCalled();
      expect(
        [...node.querySelectorAll('label.checkbox')].map((el) =>
          el.textContent.trim(),
        ),
      ).toEqual(['Aldi', 'Lidl']);
    });

    it('queries the first layer table for a layer without a current table', async () => {
      const layer = await retailPoints();

      vi.spyOn(layer, 'tableCurrent').mockReturnValue(undefined);

      layer.tables = { 10: null, 12: 'geodata.uk_glx_open_retail_points' };

      const xhr = vi.spyOn(mapp.utils, 'xhr');

      const filter = { field: 'retailer', type: 'in' };

      await filters.in(layer, filter);

      expect(xhr.mock.calls[0][0]).toContain(
        'table=geodata.uk_glx_open_retail_points',
      );
      expect(filter.in).toContain('Aldi');
    });

    it('adds and removes the checked values to the filter', async () => {
      const layer = await retailPoints();

      const applyFilter = mockApplyFilter();

      const node = await filters.in(layer, {
        field: 'retailer',
        in: ['Aldi', 'Lidl', 'Tesco'],
        type: 'in',
      });

      check(node, 'Aldi');
      check(node, 'Tesco');

      expect(layer.filter.current.retailer).toEqual({ in: ['Aldi', 'Tesco'] });

      check(node, 'Aldi');

      expect(layer.filter.current.retailer).toEqual({ in: ['Tesco'] });

      check(node, 'Tesco');

      expect(layer.filter.current).not.toHaveProperty('retailer');
      expect(applyFilter).toHaveBeenCalledTimes(4);
    });

    it('assigns the checked values to a ni filter', async () => {
      const layer = await retailPoints();

      mockApplyFilter();

      const node = await filters.ni(layer, {
        field: 'retailer',
        ni: ['Aldi', 'Lidl'],
        type: 'ni',
      });

      check(node, 'Lidl');

      expect(layer.filter.current.retailer).toEqual({ ni: ['Lidl'] });
    });

    it('returns a no data message for a failed query', async () => {
      const layer = await retailPoints();

      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const node = await filters.in(layer, { field: 'unknown', type: 'in' });

      expect(node.textContent).toBe(mapp.dictionary.no_data_filter);
      expect(warn).toHaveBeenCalledWith(
        'Distinct values query did not return any values for field unknown',
      );
    });

    it('creates a dropdown with the dropdown flag', async () => {
      const layer = await retailPoints();

      const applyFilter = mockApplyFilter();

      const node = await filters.in(layer, {
        dropdown: true,
        field: 'retailer',
        in: ['Aldi', 'Lidl'],
        type: 'in',
      });

      const select = node.querySelector('select');

      expect(select.options[0].textContent.trim()).toBe(
        mapp.dictionary.layer_filter_dropdown_select,
      );

      select.selectedIndex = 2;
      select.dispatchEvent(new Event('change'));

      expect(layer.filter.current.retailer).toEqual({ in: ['Lidl'] });

      select.selectedIndex = 2;
      select.dispatchEvent(new Event('change'));

      expect(layer.filter.current).not.toHaveProperty('retailer');
      expect(applyFilter).toHaveBeenCalledTimes(2);
    });

    it('adds the selected values as pills with the dropdown_pills flag', async () => {
      const layer = await retailPoints();

      mockApplyFilter();

      const node = await filters.in(layer, {
        dropdown_pills: true,
        field: 'retailer',
        in: ['Aldi', 'Lidl'],
        placeholder: 'Retailer',
        type: 'in',
      });

      const select = node.querySelector('select');

      select.selectedIndex = 1;
      select.dispatchEvent(new Event('change'));

      expect(layer.filter.current.retailer).toEqual({ in: ['Aldi'] });
      expect(
        [...node.querySelectorAll('.pill')].map((pill) => pill.dataset.value),
      ).toEqual(['Aldi']);

      // The placeholder is kept with pills.
      expect(select.options[0].textContent.trim()).toBe('Retailer');
    });

    describe('searchbox', () => {
      /**
      Creates a searchbox filter for the retailer field with configured values.
      */
      async function searchboxFilter(values) {
        const layer = await retailPoints();

        const applyFilter = mockApplyFilter();

        const node = await filters.in(layer, {
          field: 'retailer',
          in: values,
          searchbox: true,
          type: 'in',
        });

        const input = node.querySelector('input[type=search]');

        const search = (value) => {
          input.value = value;
          input.dispatchEvent(new Event('input'));

          return [...node.querySelectorAll('.searchbox li')].map((li) =>
            li.textContent.trim(),
          );
        };

        return { applyFilter, input, layer, node, search };
      }

      it('lists the values which start with the search input', async () => {
        const { input, search } = await searchboxFilter([
          'Aldi',
          'Asda',
          'Lidl',
          10,
        ]);

        expect(input.placeholder).toBe(
          mapp.dictionary.filter_searchbox_placeholder,
        );
        expect(search('a')).toEqual(['Aldi', 'Asda']);
        expect(search('1')).toEqual(['10']);
        expect(search('')).toEqual([]);
        expect(search('x')).toEqual([mapp.dictionary.no_results]);
      });

      it('lists up to 9 values', async () => {
        const values = Array.from({ length: 12 }, (_, i) => `A${i}`);

        const { search } = await searchboxFilter(values);

        expect(search('a')).toHaveLength(9);
      });

      it('adds a listed value as pill and filter', async () => {
        const { applyFilter, layer, node, search } = await searchboxFilter([
          'Aldi',
          'Asda',
        ]);

        search('a');

        node.querySelector('.searchbox li').click();

        expect(layer.filter.current.retailer).toEqual({ in: ['Aldi'] });
        expect(applyFilter).toHaveBeenCalledWith(layer);

        // A value with a pill is not listed.
        expect(search('a')).toEqual(['Asda']);
      });

      it('removes the value of a removed pill from the filter', async () => {
        const { input, layer, node, search } = await searchboxFilter([
          'Aldi',
          'Asda',
        ]);

        search('a');
        node.querySelector('.searchbox li').click();

        search('a');
        node.querySelector('.searchbox li').click();

        expect(layer.filter.current.retailer).toEqual({ in: ['Aldi', 'Asda'] });

        node.querySelector('.pill[data-value=Aldi] button').click();

        expect(layer.filter.current.retailer).toEqual({ in: ['Asda'] });

        node.querySelector('.pill[data-value=Asda] button').click();

        expect(layer.filter.current).not.toHaveProperty('retailer');
        expect(input.value).toBe('');
      });
    });
  });

  describe('date', () => {
    /**
    Changes the value of a date input.
    */
    function change(node, id, value) {
      const input = node.querySelector(`[data-id=${id}]`);

      input.value = value;
      input.dispatchEvent(new Event('change'));
    }

    it('creates date inputs for the after and before dates', async () => {
      const layer = await retailPoints();

      const node = filterNode(filters.date(layer, { field: 'open_date' }));

      expect(node.querySelector('[data-id=inputAfter]').type).toBe('date');
      expect(node.querySelector('[data-id=inputBefore]').type).toBe('date');
    });

    it('creates datetime-local inputs for a datetime filter', async () => {
      const layer = await retailPoints();

      const node = filterNode(
        filters.datetime(layer, { field: 'open_date', type: 'datetime' }),
      );

      expect(node.querySelector('[data-id=inputAfter]').type).toBe(
        'datetime-local',
      );
    });

    it('assigns the input dates as gt and lt epoch seconds', async () => {
      const layer = await retailPoints();

      const applyFilter = mockApplyFilter();

      const node = filterNode(filters.date(layer, { field: 'open_date' }));

      change(node, 'inputAfter', '2020-01-01');

      expect(layer.filter.current.open_date).toEqual({ gt: 1577836800 });

      change(node, 'inputBefore', '2021-01-01');

      expect(layer.filter.current.open_date).toEqual({
        gt: 1577836800,
        lt: 1609459200,
      });
      expect(applyFilter).toHaveBeenCalledTimes(2);
    });

    // Clearing a date input assigns NaN as bound, which is serialised as null in the filter param.
    // https://github.com/GEOLYTIX/xyz/issues/3139
    it.fails('deletes the bound of a cleared date input', async () => {
      const layer = await retailPoints();

      mockApplyFilter();

      const node = filterNode(filters.date(layer, { field: 'open_date' }));

      change(node, 'inputAfter', '2020-01-01');
      change(node, 'inputBefore', '2021-01-01');

      change(node, 'inputAfter', '');

      expect(layer.filter.current.open_date).toEqual({ lt: 1609459200 });
    });
  });

  describe('generateMinMax', () => {
    it('queries the min and max of the field', async () => {
      const layer = await countriesLayer();

      const filter = { field: 'pop_est', type: 'integer' };

      await filters.generateMinMax(layer, filter);

      expect(filter).toMatchObject({ max: POP_MAX, min: POP_MIN });
    });

    it('queries the min and max without the filter of the field', async () => {
      const layer = await countriesLayer();

      layer.filter.current.continent = { in: ['Europe'] };
      layer.filter.current.pop_est = { gte: 1e9 };

      const filter = { field: 'pop_est', type: 'integer' };

      await filters.generateMinMax(layer, filter);

      expect(filter).toMatchObject({ max: 144373535, min: 361313 });
    });

    it('keeps the configured min and max', async () => {
      const layer = await countriesLayer();

      const filter = { field: 'pop_est', min: 1000, type: 'integer' };

      await filters.generateMinMax(layer, filter);

      expect(filter).toMatchObject({ max: POP_MAX, min: 1000 });
    });

    it('assigns the min and max of the viewport for a viewport filter', async () => {
      const layer = await countriesLayer();

      layer.filter.viewport = true;

      const filter = { field: 'pop_est', max: 6, min: 5, type: 'integer' };

      await filters.generateMinMax(layer, filter);

      expect(filter).toMatchObject({ max: POP_MAX, min: 56225 });
    });

    it('rounds the integer and parses the numeric min and max', async () => {
      const layer = await countriesLayer();

      const integer = {
        field: 'pop_est',
        max: 1e6,
        min: '1.6',
        type: 'integer',
      };

      await filters.generateMinMax(layer, integer);

      expect(integer).toMatchObject({ max: 1e6, min: 2 });

      const numeric = {
        field: 'pop_est',
        max: 1e6,
        min: '1.6',
        type: 'numeric',
      };

      await filters.generateMinMax(layer, numeric);

      expect(numeric).toMatchObject({ max: 1e6, min: 1.6 });
    });

    it('extends the min and max to the val_a and val_b values', async () => {
      const layer = await countriesLayer();

      const filter = {
        field: 'pop_est',
        type: 'integer',
        val_a: 0,
        val_b: 2e9,
      };

      await filters.generateMinMax(layer, filter);

      expect(filter).toMatchObject({ max: 2e9, min: 0 });
    });

    it('returns early without modifying filter when query fails with an Error', async () => {
      const layer = await countriesLayer();

      vi.spyOn(mapp.utils, 'xhr').mockResolvedValue(new Error('failed'));

      const filter = { field: 'pop_est', type: 'integer' };

      await filters.generateMinMax(layer, filter);

      expect(filter.min).toBeUndefined();
      expect(filter.max).toBeUndefined();
    });

    it('returns early when query response is null or minmax is not an array', async () => {
      const layer = await countriesLayer();

      for (const response of [null, {}, { minmax: 'x' }]) {
        vi.spyOn(mapp.utils, 'xhr').mockResolvedValue(response);

        const filter = { field: 'pop_est', type: 'numeric' };

        await filters.generateMinMax(layer, filter);

        expect(filter.min).toBeUndefined();
        expect(filter.max).toBeUndefined();
      }
    });

    it('sets min and max to NaN for an integer filter when minmax values are null', async () => {
      const layer = await countriesLayer();

      vi.spyOn(mapp.utils, 'xhr').mockResolvedValue({
        minmax: [null, null],
      });

      const filter = { field: 'pop_est', type: 'integer' };

      await filters.generateMinMax(layer, filter);

      expect(filter.min).toBeNaN();
      expect(filter.max).toBeNaN();
    });

    it('queries the fallback table when current zoom level table is null', async () => {
      const layer = await countriesLayer();

      layer.tableCurrent = () => null;
      layer.tables = { 0: null, 5: 'ne_10m_admin_0_countries' };

      const xhr = vi
        .spyOn(mapp.utils, 'xhr')
        .mockResolvedValue({ minmax: [10, 20] });

      const filter = { field: 'pop_est', type: 'integer' };

      await filters.generateMinMax(layer, filter);

      expect(xhr).toHaveBeenCalledWith(
        expect.stringContaining('table=ne_10m_admin_0_countries'),
      );
      expect(filter).toMatchObject({ max: 20, min: 10 });
    });

    it('queries the field_minmax template by default', async () => {
      const layer = await countriesLayer();

      const xhr = vi
        .spyOn(mapp.utils, 'xhr')
        .mockResolvedValue({ minmax: [10, 20] });

      const filter = { field: 'pop_est', type: 'integer' };

      await filters.generateMinMax(layer, filter);

      expect(xhr).toHaveBeenCalledWith(
        expect.stringContaining('template=field_minmax'),
      );
    });

    it('queries the minmax_query template when configured', async () => {
      const layer = await countriesLayer();

      const xhr = vi
        .spyOn(mapp.utils, 'xhr')
        .mockResolvedValue({ minmax: [10, 20] });

      const filter = {
        field: 'pop_est',
        minmax_query: 'custom_minmax',
        type: 'integer',
      };

      await filters.generateMinMax(layer, filter);

      expect(xhr).toHaveBeenCalledWith(
        expect.stringContaining('template=custom_minmax'),
      );
      expect(xhr).not.toHaveBeenCalledWith(
        expect.stringContaining('template=field_minmax'),
      );
      expect(filter).toMatchObject({ max: 20, min: 10 });
    });
  });

  describe('numeric and integer', () => {
    it('creates a range slider for the min and max of the field', async () => {
      const layer = await countriesLayer();

      const applyFilter = mockApplyFilter();

      const node = filterNode(
        await filters.integer(layer, { field: 'pop_est', type: 'integer' }),
      );

      const slider = node.querySelector('[data-id=slider_ab]');

      expect(
        slider.querySelector('input[data-id=a][type=range]'),
      ).toMatchObject({
        max: String(POP_MAX),
        min: String(POP_MIN),
        step: '1',
      });
      expect(slider.querySelector('input[data-id=a][type=text]').value).toBe(
        '140',
      );
      expect(slider.querySelector('input[data-id=b][type=text]').value).toBe(
        '1,397,715,000',
      );

      expect(layer.filter.current.pop_est).toEqual({
        gte: POP_MIN,
        lte: POP_MAX,
      });

      // A range of the min and max of the data does not filter the layer.
      expect(applyFilter).not.toHaveBeenCalled();
    });

    it('applies the range of a filter with configured min and max', async () => {
      const layer = await countriesLayer();

      const applyFilter = mockApplyFilter();

      const node = filterNode(
        await filters.numeric(layer, {
          field: 'pop_est',
          max: 1e8,
          min: 1e6,
          type: 'numeric',
        }),
      );

      expect(layer.filter.current.pop_est).toEqual({ gte: 1e6, lte: 1e8 });
      expect(applyFilter).toHaveBeenCalledWith(layer);

      // The numeric step is 0.01.
      expect(node.querySelector('input[data-id=a][type=range]').step).toBe(
        '0.01',
      );
    });

    it('keeps the current filter range of the field', async () => {
      const layer = await countriesLayer();

      layer.filter.current.pop_est = { gte: 1e6 };

      const node = filterNode(
        await filters.integer(layer, { field: 'pop_est', type: 'integer' }),
      );

      expect(layer.filter.current.pop_est).toEqual({
        gte: 1e6,
        lte: POP_MAX,
      });
      expect(node.querySelector('input[data-id=a][type=range]').value).toBe(
        '1000000',
      );
    });

    it('assigns the slider input values as gte and lte filter', async () => {
      const layer = await countriesLayer();

      const applyFilter = mockApplyFilter();

      const node = filterNode(
        await filters.integer(layer, { field: 'pop_est', type: 'integer' }),
      );

      const rangeA = node.querySelector('input[data-id=a][type=range]');

      rangeA.value = '1000000';
      rangeA.dispatchEvent(new Event('input'));

      const inputB = node.querySelector('input[data-id=b][type=text]');

      inputB.value = '2000000';
      inputB.dispatchEvent(new Event('change'));

      const { gte, lte } = layer.filter.current.pop_est;

      // The range input passes the value as string.
      expect([Number(gte), lte]).toEqual([1000000, 2000000]);
      expect(applyFilter).toHaveBeenCalledTimes(2);
    });

    it('uses the infoj entry of the field as filter defaults', async () => {
      const layer = await countriesLayer();

      // The pop_est entry has the integer type.
      layer.infoj.find((entry) => entry.field === 'pop_est').step = 1000;

      const node = filterNode(
        await filters.numeric(layer, { field: 'pop_est' }),
      );

      expect(node.querySelector('input[data-id=a][type=range]').step).toBe(
        '1000',
      );
    });

    it('returns a no data message without a min and max', async () => {
      const layer = await countriesLayer();

      layer.filter.current.continent = { in: ['Atlantis'] };

      const node = await filters.numeric(layer, {
        field: 'pop_est',
        type: 'numeric',
      });

      expect(node.textContent).toBe(mapp.dictionary.no_data_filter);
    });

    // The failed field_minmax query returns a no data message.
    // https://github.com/GEOLYTIX/xyz/issues/3102
    it('returns a no data message for a failed min max query', async () => {
      const layer = await countriesLayer();

      vi.spyOn(mapp.utils, 'xhr').mockResolvedValue(new Error('failed'));

      const node = await filters.integer(layer, {
        field: 'pop_est',
        type: 'integer',
      });

      expect(node.textContent).toBe(mapp.dictionary.no_data_filter);
    });

    it('returns a no data message for an integer filter on an all-null field', async () => {
      const layer = await countriesLayer();

      vi.spyOn(mapp.utils, 'xhr').mockResolvedValue({
        minmax: [null, null],
      });

      const node = await filters.integer(layer, {
        field: 'pop_est',
        type: 'integer',
      });

      expect(node.textContent).toBe(mapp.dictionary.no_data_filter);
      expect(layer.filter.current.pop_est).toBeUndefined();
    });

    // The filter_numeric method assigns the min, max, slider and histogram to a copy of the filter.
    // https://github.com/GEOLYTIX/xyz/issues/3137
    it.fails('assigns the min, max and slider to the filter', async () => {
      const layer = await countriesLayer();

      const filter = { field: 'pop_est', type: 'integer' };

      await filters.integer(layer, filter);

      expect(filter).toMatchObject({ max: POP_MAX, min: POP_MIN });
      expect(filter.slider).toBeInstanceOf(HTMLElement);
    });

    describe('histogram', () => {
      it('creates a histogram dataview for the field', async () => {
        const layer = await countriesLayer();

        const filter = { field: 'pop_est', histogram: {}, type: 'integer' };

        const node = filterNode(await filters.integer(layer, filter));

        expect(filter.histogram).toMatchObject({
          dataview: 'histogram',
          layer,
          options: { tooltip: true },
          queryparams: { field: 'pop_est', filter: true, table: true },
        });
        expect(filter.histogram.update).toBeTypeOf('function');
        expect(node.firstElementChild).toBe(filter.histogram.container);
      });

      it('updates a viewport histogram on changeEnd until the filter is removed', async () => {
        const layer = await countriesLayer();

        layer.filter.viewport = true;

        mockApplyFilter();

        const filter = { field: 'pop_est', histogram: {}, type: 'integer' };

        await filters.integer(layer, filter);

        const update = vi
          .spyOn(filter.histogram, 'update')
          .mockImplementation(() => {});

        const target = layer.mapview.Map.getTargetElement();

        target.dispatchEvent(new Event('changeEnd'));

        expect(update).toHaveBeenCalledTimes(1);

        filters.removeFilter(layer, filter);

        target.dispatchEvent(new Event('changeEnd'));

        expect(update).toHaveBeenCalledTimes(1);
      });

      // The histogram dataview of a histogram: true filter is assigned to a copy of the filter.
      // https://github.com/GEOLYTIX/xyz/issues/3137
      it.fails(
        'removes the changeEnd listener of a histogram: true filter',
        async () => {
          const layer = await countriesLayer();

          layer.filter.viewport = true;

          mockApplyFilter();

          const filter = { field: 'pop_est', histogram: true, type: 'integer' };

          await filters.integer(layer, filter);

          filters.removeFilter(layer, filter);

          const xhr = vi.spyOn(mapp.utils, 'xhr').mockResolvedValue([]);

          layer.mapview.Map.getTargetElement().dispatchEvent(
            new Event('changeEnd'),
          );

          expect(histogramQueries(xhr)).toHaveLength(0);
        },
      );

      // https://github.com/GEOLYTIX/xyz/issues/3137
      it.fails(
        'updates the histogram of a histogram: true filter with applyFilter',
        async () => {
          const layer = await countriesLayer();

          mockApplyFilter();

          const filter = { field: 'pop_est', histogram: true, type: 'integer' };

          await filters.integer(layer, filter);

          layer.filter.list = [filter];

          vi.restoreAllMocks();

          vi.spyOn(layer, 'reload').mockImplementation(() => {});

          const xhr = vi.spyOn(mapp.utils, 'xhr').mockResolvedValue([]);

          fakeTimers();

          filters.applyFilter(layer);

          vi.advanceTimersByTime(500);

          clearTimeout(layer.mapview.changeEndTimer);

          expect(histogramQueries(xhr)).toHaveLength(1);
        },
      );
    });
  });

  describe('removeFilter', () => {
    it('deletes the current filter and removes the filter card', async () => {
      const layer = await retailPoints();

      const applyFilter = mockApplyFilter();

      const card = document.createElement('div');

      const li = document.createElement('li');

      li.classList.add('selected');

      const filter = {
        card,
        field: 'retailer',
        li,
        max: 2,
        min: 1,
        selected: true,
        type: 'in',
      };

      layer.filter.current.retailer = { in: ['Aldi'] };

      filters.removeFilter(layer, filter);

      expect(layer.filter.current).not.toHaveProperty('retailer');
      expect(applyFilter).toHaveBeenCalledWith(layer);
      expect(li.classList).not.toContain('selected');
      expect(filter).not.toHaveProperty('card');
      expect(filter).not.toHaveProperty('selected');

      // The min and max are not fixed as Min and Max.
      expect(filter).not.toHaveProperty('min');
      expect(filter).not.toHaveProperty('max');
    });

    it('keeps the min and max which are fixed as Min and Max', async () => {
      const layer = await retailPoints();

      mockApplyFilter();

      const filter = { field: 'pop', Max: 2, max: 2, Min: 1, min: 1 };

      layer.filter.current.pop = { gte: 1, lte: 2 };

      filters.removeFilter(layer, filter);

      expect(filter).toMatchObject({ max: 2, min: 1 });
    });

    it('does not apply a filter which is not current', async () => {
      const layer = await retailPoints();

      const applyFilter = mockApplyFilter();

      filters.removeFilter(layer, { field: 'retailer', type: 'in' });

      expect(applyFilter).not.toHaveBeenCalled();
    });

    it('hides the clearAll, resetAll and feature count without filter cards', async () => {
      const layer = await retailPoints();

      mockApplyFilter();

      const [clearAll, resetAll, feature_count] = [1, 2, 3].map(() =>
        document.createElement('div'),
      );

      Object.assign(layer.filter, { clearAll, feature_count, resetAll });

      const filter = { card: document.createElement('div'), field: 'a' };

      layer.filter.list = [
        filter,
        { card: document.createElement('div'), field: 'b' },
      ];

      filters.removeFilter(layer, filter);

      expect(clearAll.style.display).toBe('');

      filters.removeFilter(layer, layer.filter.list[1]);

      expect(clearAll.style.display).toBe('none');
      expect(resetAll.style.display).toBe('none');
      expect(feature_count.style.display).toBe('none');
    });
  });

  describe('resetFilter', () => {
    it('deletes the filter without a card', async () => {
      const layer = await retailPoints();

      mockApplyFilter();

      layer.filter.current.retailer = { in: ['Aldi'] };

      await filters.resetFilter(layer, { field: 'retailer', type: 'in' });

      expect(layer.filter.current).not.toHaveProperty('retailer');
    });

    it('replaces the filter card with a new card', async () => {
      const layer = await retailPoints();

      mockApplyFilter();

      const card = document.createElement('div');

      const target = document.createElement('div');

      target.append(card);

      const filter = {
        card,
        field: 'retailer',
        header: 'Retailer',
        in: ['Aldi', 'Lidl'],
        type: 'in',
      };

      layer.filter.current.retailer = { in: ['Aldi'] };

      await filters.resetFilter(layer, filter);

      expect(layer.filter.current).not.toHaveProperty('retailer');
      expect(target.firstElementChild).toBe(filter.card);
      expect(filter.card).not.toBe(card);
      expect(filter.card.querySelectorAll('input:checked')).toHaveLength(0);
      expect(filter.card.querySelectorAll('input[type=checkbox]')).toHaveLength(
        2,
      );
    });
  });
});
