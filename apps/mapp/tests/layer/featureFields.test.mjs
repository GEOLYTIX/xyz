import { afterEach, describe, expect, it, vi } from 'vitest';
import * as featureFields from '../../lib/layer/featureFields.mjs';

function layer(style = {}, fields = ['category']) {
  return {
    params: { fields },
    style,
    L: { changed: vi.fn() },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('layer/featureFields', () => {
  describe('reset', () => {
    it('creates an empty values array for each field', () => {
      const l = layer({}, ['a', 'b']);

      l.featureFields = { a: { values: [1, 2], jenks: [1] } };

      featureFields.reset(l);

      expect(l.featureFields).toEqual({ a: { values: [] }, b: { values: [] } });
    });

    it('returns without params.fields', () => {
      const l = layer({}, null);

      featureFields.reset(l);

      expect(l.featureFields).toBeUndefined();
    });
  });

  describe('fieldsArray', () => {
    it('returns the fields required by the params and style', () => {
      const l = {
        params: { default_fields: ['name', 'id'] },
        style: {
          theme: { field: 'category', fields: ['shop'] },
          label: { field: 'label' },
          hover: { field: 'hover' },
          icon_scaling: { field: 'size' },
        },
        cluster: { label: 'cluster_label' },
      };

      expect(featureFields.fieldsArray(l)).toEqual([
        'name',
        'id',
        'category',
        'label',
        'hover',
        'size',
        'cluster_label',
        'shop',
      ]);
    });

    // https://github.com/GEOLYTIX/xyz/issues/3042: the default_fields are deduplicated against the style fields.
    it('does not duplicate default_fields', () => {
      const l = {
        params: { default_fields: ['category'] },
        style: { theme: { field: 'category' } },
      };

      expect(featureFields.fieldsArray(l)).toEqual(['category']);
    });

    it('returns an empty array without fields', () => {
      expect(featureFields.fieldsArray({ params: {}, style: {} })).toEqual([]);
    });

    it('does not duplicate fields', () => {
      const l = {
        params: {},
        style: {
          theme: { field: 'category' },
          label: { field: 'category' },
        },
      };

      expect(featureFields.fieldsArray(l)).toEqual(['category']);
    });
  });

  describe('process', () => {
    it('assigns the max of the icon_scaling field values', async () => {
      const l = layer({ icon_scaling: { field: 'size' } }, ['size']);

      featureFields.reset(l);
      l.featureFields.size.values.push(1, '7', 3, 'n/a');

      await featureFields.process(l);

      expect(l.style.icon_scaling.max).toBe(7);
    });

    it('does not draw the legend for a theme without distribution', async () => {
      const drawLegend = vi.spyOn(mapp.layer, 'drawLegend');

      const l = layer({ theme: { type: 'categorized', field: 'category' } });

      featureFields.reset(l);

      await featureFields.process(l);

      expect(drawLegend).not.toHaveBeenCalled();
      expect(l.L.changed).not.toHaveBeenCalled();
      expect(featureFields.distributionReady(l)).toBe(true);
    });

    it('counts the values of the theme field', async () => {
      const drawLegend = vi
        .spyOn(mapp.layer, 'drawLegend')
        .mockImplementation(() => {});

      const l = layer({
        theme: {
          type: 'categorized',
          field: 'category',
          distribution: 'count',
        },
      });

      featureFields.reset(l);

      expect(featureFields.distributionReady(l)).toBe(false);

      l.featureFields.category.values.push('city', 'office', 'city');

      await featureFields.process(l);

      expect(l.featureFields.category.city).toBe(2);
      expect(l.featureFields.category.office).toBe(1);
      expect(l.L.changed).toHaveBeenCalledOnce();
      expect(drawLegend).toHaveBeenCalledWith(l);
      expect(featureFields.distributionReady(l)).toBe(true);
    });

    it('counts the values of the theme fields', async () => {
      vi.spyOn(mapp.layer, 'drawLegend').mockImplementation(() => {});

      const l = layer(
        {
          theme: {
            type: 'categorized',
            fields: ['shop', 'brand'],
            distribution: 'count',
          },
        },
        ['shop', 'brand'],
      );

      featureFields.reset(l);

      l.featureFields.shop.values.push('food', 'food');
      l.featureFields.brand.values.push('acme', 'other');

      await featureFields.process(l);

      expect(l.featureFields.shop.food).toBe(2);
      expect(l.featureFields.brand.acme).toBe(1);
      expect(l.featureFields.brand.other).toBe(1);
    });

    it('is not ready for a new theme or after a reset', async () => {
      vi.spyOn(mapp.layer, 'drawLegend').mockImplementation(() => {});

      const l = layer({
        theme: {
          type: 'categorized',
          field: 'category',
          distribution: 'count',
        },
      });

      featureFields.reset(l);

      await featureFields.process(l);

      expect(featureFields.distributionReady(l)).toBe(true);

      l.style.theme = { ...l.style.theme };

      expect(featureFields.distributionReady(l)).toBe(false);

      await featureFields.process(l);

      featureFields.reset(l);

      expect(featureFields.distributionReady(l)).toBe(false);
    });

    it('assigns jenks breaks as category values and labels', async () => {
      vi.spyOn(mapp.layer, 'drawLegend').mockImplementation(() => {});

      const jenks = vi.fn(() => [1, 5, 5, 9]);

      vi.spyOn(mapp.utils, 'simpleStatistics').mockResolvedValue({ jenks });

      const l = layer(
        {
          theme: {
            type: 'graduated',
            field: 'value',
            distribution: 'jenks',
            legend: { suffix: 'm' },
            categories: [{}, {}, {}, {}],
          },
        },
        ['value'],
      );

      featureFields.reset(l);

      l.featureFields.value.values.push('1', null, '5', '9', '2');

      await featureFields.process(l);

      // Null values are removed and the values are parsed as float.
      expect(jenks).toHaveBeenCalledWith([1, 5, 9, 2], 4);

      // A duplicate break is assigned as undefined category value.
      expect(l.style.theme.categories.map((cat) => cat.value)).toEqual([
        1,
        5,
        undefined,
        9,
      ]);

      expect(l.style.theme.categories[1].label).toBe(
        mapp.utils.formatNumericValue({ suffix: 'm', value: 5 }),
      );
    });

    it('limits the jenks classes to the number of values', async () => {
      vi.spyOn(mapp.layer, 'drawLegend').mockImplementation(() => {});

      const jenks = vi.fn(() => [1, 2]);

      vi.spyOn(mapp.utils, 'simpleStatistics').mockResolvedValue({ jenks });

      const l = layer(
        {
          theme: {
            field: 'value',
            distribution: 'jenks',
            categories: [{}, {}, {}],
          },
        },
        ['value'],
      );

      featureFields.reset(l);

      l.featureFields.value.values.push(1, 2);

      await featureFields.process(l);

      expect(jenks).toHaveBeenCalledWith([1, 2], 2);
    });

    it('returns if simpleStatistics fails to load', async () => {
      vi.spyOn(mapp.layer, 'drawLegend').mockImplementation(() => {});

      vi.spyOn(mapp.utils, 'simpleStatistics').mockResolvedValue(
        new Error('offline'),
      );

      const l = layer(
        {
          theme: {
            field: 'value',
            distribution: 'jenks',
            categories: [{ value: 3 }],
          },
        },
        ['value'],
      );

      featureFields.reset(l);

      l.featureFields.value.values.push(1);

      await featureFields.process(l);

      expect(l.featureFields.value.jenks).toBeUndefined();
      expect(l.style.theme.categories[0].value).toBe(3);
    });
  });
});
