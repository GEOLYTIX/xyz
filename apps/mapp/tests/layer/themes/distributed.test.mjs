import { describe, expect, it } from 'vitest';
import distributed from '../../../lib/layer/themes/distributed.mjs';

const formatWKT = new ol.format.WKT();

function theme() {
  return {
    type: 'distributed',
    categories: [
      { style: { fillColor: '#aaa' } },
      { style: { fillColor: '#bbb' } },
      { style: { fillColor: '#ccc' } },
    ],
  };
}

function feature(id, wkt, properties = {}) {
  const f = new ol.Feature({ geometry: formatWKT.readGeometry(wkt) });
  f.properties = { id, ...properties };
  return f;
}

function square(x, y, size = 10) {
  return `POLYGON((${x} ${y},${x + size} ${y},${x + size} ${y + size},${x} ${y + size},${x} ${y}))`;
}

/**
Applies the theme to a feature for each wkt geometry, with the index + 1 as id, and returns the fillColor of each feature style.
*/
function distribute(t, geometries) {
  return geometries.map((wkt, i) => {
    const f = feature(i + 1, wkt);
    distributed(t, f);
    return f.style?.fillColor;
  });
}

describe('layer/themes/distributed', () => {
  it('assigns the categories in turn to point features', () => {
    const t = theme();

    const fills = distribute(t, [
      'POINT(1 1)',
      'POINT(2 2)',
      'POINT(3 3)',
      'POINT(4 4)',
    ]);

    expect(fills).toEqual(['#aaa', '#bbb', '#ccc', '#aaa']);
    expect(t.categories[0].values).toEqual(['1', '4']);
    expect(t.field).toBe('id');
  });

  it('assigns the same style to features with the same field value', () => {
    const t = theme();

    const a = feature(1, 'POINT(0 0)');
    const b = feature(1, 'POINT(5 5)');

    distributed(t, a);
    distributed(t, b);

    expect(b.style).toBe(a.style);
    expect(t.index).toBe(0);
  });

  it('distributes on the theme field', () => {
    const t = theme();
    t.field = 'group';

    const fills = [
      feature(1, 'POINT(0 0)', { group: 'x' }),
      feature(2, 'POINT(1 1)', { group: 'x' }),
      feature(3, 'POINT(2 2)', { group: 'y' }),
    ].map((f) => {
      distributed(t, f);
      return f.style.fillColor;
    });

    expect(fills).toEqual(['#aaa', '#aaa', '#bbb']);
  });

  it('assigns the categories in turn to features which do not intersect', () => {
    const fills = distribute(theme(), [
      square(0, 0),
      square(100, 0),
      square(200, 0),
    ]);

    expect(fills).toEqual(['#aaa', '#bbb', '#ccc']);
  });

  it('avoids the category of an intersecting feature', () => {
    // The fourth square takes index 0 in turn, but intersects the first square.
    const fills = distribute(theme(), [
      square(0, 0),
      square(100, 0),
      square(200, 0),
      square(5, 5),
    ]);

    expect(fills[3]).toBe('#bbb');
  });

  // BUG: distributed.mjs:107 pushes the value to categories[theme.index].values instead of the assigned categories[bbox.themeIdx].values.
  it.fails('records the value on the assigned category', () => {
    const t = theme();

    distribute(t, [square(0, 0), square(100, 0), square(200, 0), square(5, 5)]);

    expect(t.categories[1].values).toContain('4');
  });

  it('keeps the index in turn if all categories intersect', () => {
    const t = theme();
    t.categories = t.categories.slice(0, 2);

    const fills = distribute(t, [square(0, 0), square(2, 2), square(4, 4)]);

    expect(fills).toEqual(['#aaa', '#bbb', '#aaa']);
  });

  // BUG: distributed.mjs:32 casts the field value with String() before the falsy check, so a feature without a field value is styled as 'undefined'.
  it.fails('does not style a feature without a field value', () => {
    const t = theme();
    t.field = 'group';

    const f = feature(1, 'POINT(0 0)');

    distributed(t, f);

    expect(f.style).toBeUndefined();
  });
});
