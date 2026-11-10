import { describe, expect, it } from 'vitest';
import graduated from '../../../lib/layer/themes/graduated.mjs';

function theme(graduated_breaks) {
  return {
    type: 'graduated',
    field: 'value',
    graduated_breaks,
    categories: [
      { value: 10, style: { fillColor: '#100' } },
      { value: 20, style: { fillColor: '#200' } },
      { value: 30, style: { fillColor: '#300' } },
    ],
  };
}

function feature(value) {
  return { properties: { value }, style: { fillColor: '#999', scale: 2 } };
}

describe('layer/themes/graduated', () => {
  it.each([
    [5, '#100'],
    [10, '#100'],
    [15, '#200'],
    [20, '#200'],
    [25, '#300'],
    [30, '#300'],
    // A value above the range takes the highest category.
    [99, '#300'],
    ['12.5', '#200'],
  ])('less_than assigns %s the %s category', (value, fillColor) => {
    const f = feature(value);

    graduated(theme('less_than'), f);

    expect(f.style).toEqual({ fillColor, scale: 2 });
  });

  it.each([
    // A value below the range takes the lowest category.
    [5, '#100'],
    [10, '#100'],
    [15, '#100'],
    [20, '#200'],
    [25, '#200'],
    [30, '#300'],
    [99, '#300'],
  ])('greater_than assigns %s the %s category', (value, fillColor) => {
    const f = feature(value);

    graduated(theme('greater_than'), f);

    expect(f.style.fillColor).toBe(fillColor);
  });

  it('matches categories by value, not order', () => {
    const t = theme('less_than');
    t.categories.reverse();

    const f = feature(15);

    graduated(t, f);

    expect(f.style.fillColor).toBe('#200');
  });

  it('ignores categories without a numeric value', () => {
    const t = theme('less_than');
    t.categories.unshift({ value: 'n/a', style: { fillColor: '#nan' } });
    t.categories.push({ value: undefined, style: { fillColor: '#undef' } });

    const f = feature(15);

    graduated(t, f);

    expect(f.style.fillColor).toBe('#200');
  });

  it.each([
    ['null', null],
    ['a string', 'abc'],
    ['undefined', undefined],
  ])('keeps the default style for %s values', (_, value) => {
    const f = feature(value);

    graduated(theme('less_than'), f);

    expect(f.style).toEqual({ fillColor: '#999', scale: 2 });
  });

  it('assigns a null style for a category with a null style', () => {
    const t = theme('less_than');
    t.categories[1].style = null;

    const f = feature(15);

    graduated(t, f);

    expect(f.style).toBeNull();
  });

  it('returns without feature properties', () => {
    const f = { style: { fillColor: '#999' } };

    graduated(theme('less_than'), f);

    expect(f.style.fillColor).toBe('#999');
  });

  it('does not style cluster features', () => {
    const f = feature(15);
    f.properties.features = [{}, {}];

    graduated(theme('less_than'), f);

    expect(f.style.fillColor).toBe('#999');
  });

  it('styles a cluster with a single feature from its properties', () => {
    const f = {
      properties: { features: [new ol.Feature({ value: 25 })] },
      style: {},
    };

    graduated(theme('less_than'), f);

    expect(f.style.fillColor).toBe('#300');
  });

  // https://github.com/GEOLYTIX/xyz/issues/3062: the renderer reduces theme.categories without guarding an absent array. A graduated theme may have no categories yet, eg. until a plugin or dataview populates them, so a numeric feature throws.
  it.fails('does not throw for a graduated theme without categories', () => {
    const t = {
      type: 'graduated',
      field: 'value',
      graduated_breaks: 'less_than',
    };

    expect(() => graduated(t, feature(15))).not.toThrow();
  });

  // https://github.com/GEOLYTIX/xyz/issues/3062: an empty category array reduces to undefined and theme.categories[0] is undefined, so cat.style throws.
  it.fails('does not throw for a graduated theme with empty categories', () => {
    const t = {
      type: 'graduated',
      field: 'value',
      graduated_breaks: 'less_than',
      categories: [],
    };

    expect(() => graduated(t, feature(15))).not.toThrow();
  });

  // https://github.com/GEOLYTIX/xyz/issues/3062: the renderer looks up graduated_breaks[theme.graduated_breaks]. Categories assigned after the styleParser early return leave graduated_breaks undefined, so the lookup is undefined and the reduce throws.
  it.fails('does not throw without a graduated_breaks mode', () => {
    const t = {
      type: 'graduated',
      field: 'value',
      categories: [{ value: 10, style: { fillColor: '#100' } }],
    };

    expect(() => graduated(t, feature(15))).not.toThrow();
  });
});
