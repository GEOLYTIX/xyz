import { describe, expect, it } from 'vitest';
import categorized from '../../../lib/layer/themes/categorized.mjs';

function theme() {
  return {
    type: 'categorized',
    field: 'category',
    categories: [
      { value: 'office', style: { fillColor: '#e6194b' } },
      { value: 'city', style: { fillColor: '#4363d8' } },
      { value: 'a%20b', style: { fillColor: '#3cb44b' } },
      { value: 'hidden', style: null },
    ],
  };
}

function feature(properties, style = { fillColor: '#999', scale: 2 }) {
  return { properties, style };
}

describe('layer/themes/categorized', () => {
  it.each([
    ['office', '#e6194b'],
    ['city', '#4363d8'],
  ])('assigns the %s category style', (value, fillColor) => {
    const f = feature({ category: value });

    categorized(theme(), f);

    expect(f.style).toEqual({ fillColor, scale: 2 });
  });

  it('matches a URI encoded category value', () => {
    const f = feature({ category: 'a b' });

    categorized(theme(), f);

    expect(f.style.fillColor).toBe('#3cb44b');
  });

  it('keeps the default style without a matching category', () => {
    const f = feature({ category: 'village' });

    categorized(theme(), f);

    expect(f.style).toEqual({ fillColor: '#999', scale: 2 });
  });

  it('assigns a null style for a category with a null style', () => {
    const f = feature({ category: 'hidden' });

    categorized(theme(), f);

    expect(f.style).toBeNull();
  });

  it('returns without feature properties', () => {
    const f = { style: { fillColor: '#999' } };

    categorized(theme(), f);

    expect(f.style).toEqual({ fillColor: '#999' });
  });

  it('does not style cluster features', () => {
    const f = feature({ category: 'office', features: [{}, {}] });

    categorized(theme(), f);

    expect(f.style.fillColor).toBe('#999');
  });

  it('styles a cluster feature with a single feature', () => {
    const f = feature({ category: 'office', features: [{}] });

    categorized(theme(), f);

    expect(f.style.fillColor).toBe('#e6194b');
  });

  describe('theme.fields', () => {
    function fieldsTheme() {
      return {
        type: 'categorized',
        fields: ['shop', 'brand'],
        categories: [
          { field: 'shop', value: 'food', style: { icon: { type: 'dot' } } },
          {
            field: 'shop',
            value: 'fuel',
            style: { icon: [{ type: 'square' }, { type: 'triangle' }] },
          },
          {
            field: 'brand',
            value: 'acme',
            style: { icon: { type: 'target' } },
          },
          { field: 'brand', value: 'none', style: null },
          { field: 'brand', value: 'plain', style: { fillColor: '#f00' } },
          { field: 'brand', value: 'nostyle' },
        ],
      };
    }

    it('assigns an icon array from the categories of each field', () => {
      const f = feature({ shop: 'food', brand: 'acme' });

      categorized(fieldsTheme(), f);

      expect(f.style.icon).toEqual([{ type: 'dot' }, { type: 'target' }]);
      expect(f.style.fillColor).toBe('#999');
    });

    it('spreads an icon array category style', () => {
      const f = feature({ shop: 'fuel', brand: 'acme' });

      categorized(fieldsTheme(), f);

      expect(f.style.icon.map((icon) => icon.type)).toEqual([
        'square',
        'triangle',
        'target',
      ]);
    });

    it('assigns a null style if the category of any field has a null style', () => {
      const f = feature({ shop: 'food', brand: 'none' });

      categorized(fieldsTheme(), f);

      expect(f.style).toBeNull();
    });

    it.each([
      ['a category style without icon', 'plain'],
      ['a category without style', 'nostyle'],
      ['no matching category', 'other'],
    ])('skips %s', (_, brand) => {
      const f = feature({ shop: 'food', brand });

      categorized(fieldsTheme(), f);

      expect(f.style.icon).toEqual([{ type: 'dot' }]);
    });

    it('does not apply the theme.field', () => {
      const t = fieldsTheme();
      t.field = 'shop';
      t.categories.push({ value: 'food', style: { fillColor: '#f00' } });

      const f = feature({ shop: 'food' });

      categorized(t, f);

      expect(f.style.fillColor).toBe('#999');
      expect(f.style.icon).toEqual([{ type: 'dot' }]);
    });
  });
});
