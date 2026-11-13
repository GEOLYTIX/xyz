import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import styleParser from '../../lib/layer/styleParser.mjs';

/**
The styleParser parses the layer.style configuration in place and warns on legacy configurations.

Every test builds its own layer object. The console.warn spy records the warnings, which are part of the parser behaviour.
*/

let warn;

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  warn.mockRestore();
});

function warnings() {
  return warn.mock.calls.map((call) => call[0]);
}

function parse(layer) {
  layer.key ??= 'test';
  styleParser(layer);
  return layer;
}

describe('styleParser: defaults', () => {
  it('is exported as mapp.layer.styleParser', () => {
    expect(mapp.layer.styleParser).toBe(styleParser);
  });

  it('creates a style with drawer and default style for a layer without style', () => {
    const layer = parse({});

    expect(layer.style.drawer).toBe('disableOnHide');
    expect(layer.style.default).toEqual({
      fillColor: '#fff9',
      strokeColor: '#333',
    });
    expect(warnings()).toEqual([
      'Layer: test has no implicit default style. Please add style.default.',
    ]);
  });

  it('keeps an implicit drawer class', () => {
    const layer = parse({ style: { drawer: 'custom', default: {} } });

    expect(layer.style.drawer).toBe('custom');
    expect(warnings()).toEqual([]);
  });

  it('assigns a dot icon default style for a cluster layer', () => {
    const layer = parse({ cluster: {}, style: {} });

    expect(layer.style.default).toEqual({ icon: { type: 'dot' } });
  });

  it('replaces a default style with its nested style object', () => {
    const layer = parse({
      style: { default: { style: { strokeColor: '#f00' } } },
    });

    expect(layer.style.default).toEqual({ strokeColor: '#f00' });
    expect(warnings()).toEqual([
      'Layer: test has a style object within the default style configuration.',
    ]);
  });
});

describe('styleParser: icon objects', () => {
  it('moves icon keys from the default style into an icon object', () => {
    const layer = parse({
      style: {
        default: {
          type: 'dot',
          scale: 2,
          anchor: [0.5, 1],
          fillColor: '#f00',
        },
      },
    });

    expect(layer.style.default).toEqual({
      fillColor: '#f00',
      icon: { type: 'dot', scale: 2, anchor: [0.5, 1] },
    });
  });

  it('assigns the svg as icon url', () => {
    const layer = parse({ style: { default: { svg: 'a.svg' } } });

    expect(layer.style.default.icon).toEqual({ url: 'a.svg' });
  });

  it('keeps an icon url over the svg', () => {
    const layer = parse({
      style: { default: { icon: { url: 'url.svg', svg: 'svg.svg' } } },
    });

    expect(layer.style.default.icon).toEqual({ url: 'url.svg' });
  });

  it('turns an icon array of one into an icon object', () => {
    const layer = parse({
      style: { default: { icon: [{ svg: 'a.svg' }] } },
    });

    expect(layer.style.default.icon).toEqual({ url: 'a.svg' });
  });

  it('keeps an icon array of several icons', () => {
    const layer = parse({
      style: { default: { icon: [{ svg: 'a.svg' }, { url: 'b.svg' }] } },
    });

    expect(layer.style.default.icon).toEqual([
      { url: 'a.svg' },
      { url: 'b.svg' },
    ]);
  });
});

describe('styleParser: highlight', () => {
  it('assigns an Infinity zIndex and moves the scale to highlightScale', () => {
    const layer = parse({
      style: { default: {}, highlight: { scale: 1.5 } },
    });

    expect(layer.style.highlight).toEqual({
      zIndex: Infinity,
      highlightScale: 1.5,
    });
  });

  it('keeps an implicit zIndex and highlightScale', () => {
    const layer = parse({
      style: {
        default: {},
        highlight: { zIndex: 10, highlightScale: 2, scale: 3 },
      },
    });

    expect(layer.style.highlight).toEqual({ zIndex: 10, highlightScale: 2 });
  });
});

describe('styleParser: legacy configurations', () => {
  it('moves layer.hover into layer.style.hover', () => {
    const hover = { field: 'name' };
    const layer = parse({ hover, style: { default: {} } });

    expect(layer.hover).toBeUndefined();
    expect(layer.style.hover).toBe(hover);
    expect(layer.style.hover.method).toBe(mapp.layer.featureHover);
    expect(warnings()).toEqual([
      'Layer: test, layer.hover{} should be defined within layer.style{}.',
    ]);
  });

  it('warns on a deprecated style.zIndex', () => {
    parse({ style: { default: {}, zIndex: 5 } });

    expect(warnings()).toEqual([
      'Layer: test, layer.style.zIndex has been deprecated. Use layer.zIndex instead.',
    ]);
  });

  it('assigns layer.icon_scaling to the style', () => {
    const icon_scaling = { field: 'size' };
    const layer = parse({ icon_scaling, style: { default: {} } });

    expect(layer.style.icon_scaling).toBe(icon_scaling);
    expect(warnings()).toEqual([
      'Layer: test, layer.icon_scaling has been assigned to layer.style.icon_scaling',
    ]);
  });

  it('keeps an existing style.icon_scaling over layer.icon_scaling', () => {
    const icon_scaling = { field: 'style' };
    const layer = parse({
      icon_scaling: { field: 'layer' },
      style: { default: {}, icon_scaling },
    });

    expect(layer.style.icon_scaling).toBe(icon_scaling);
  });
});

describe('styleParser: cluster layer', () => {
  it('assigns a dot icon to a cluster layer default style without icon', () => {
    const layer = parse({
      cluster: {},
      style: { default: { strokeColor: '#f00' } },
    });

    expect(layer.style.default).toEqual({ icon: { type: 'dot' } });
    expect(warnings()).toEqual([
      "Cluster Layer: test has no default icon. 'Dot' will be assigned.",
    ]);
  });

  it('removes stroke and fill keys from a cluster layer default style', () => {
    const layer = parse({
      cluster: {},
      style: {
        default: {
          icon: { type: 'dot' },
          strokeColor: '#f00',
          fillColor: '#0f0',
        },
      },
    });

    expect(layer.style.default).toEqual({ icon: { type: 'dot' } });
    expect(warnings()).toEqual([
      'Cluster Layer: test; strokeColor key removed from default style.',
      'Cluster Layer: test; fillColor key removed from default style.',
    ]);
  });

  it('creates a default cluster style', () => {
    const layer = parse({
      cluster: {},
      style: { default: { icon: { type: 'dot' } } },
    });

    expect(layer.style.cluster).toEqual({
      clusterScale: 1,
      icon: { type: 'dot' },
    });
  });

  it('merges the cluster style and moves the zoom scales to the layer style', () => {
    const layer = parse({
      cluster: {},
      style: {
        default: { icon: { type: 'dot' } },
        cluster: {
          clusterScale: 2,
          zoomInScale: 0.5,
          zoomOutScale: 1.5,
          icon: { svg: 'cluster.svg' },
        },
      },
    });

    expect(layer.style.cluster).toEqual({
      clusterScale: 2,
      icon: { url: 'cluster.svg' },
    });
    expect(layer.style.zoomInScale).toBe(0.5);
    expect(layer.style.zoomOutScale).toBe(1.5);
  });

  it('assigns the url for each icon in a cluster icon array', () => {
    const layer = parse({
      cluster: {},
      style: {
        default: { icon: { type: 'dot' } },
        cluster: { icon: [{ svg: 'a.svg' }, { url: 'b.svg' }] },
      },
    });

    expect(layer.style.cluster.icon).toEqual([
      { url: 'a.svg' },
      { url: 'b.svg' },
    ]);
  });
});

describe('styleParser: theme', () => {
  it('warns on an unavailable theme type and leaves the theme as is', () => {
    const theme = { type: 'unknown', cat: { a: {} } };
    const layer = parse({ style: { default: {}, theme } });

    expect(layer.style.theme).toBe(theme);
    expect(theme.cat).toEqual({ a: {} });
    expect(warnings()).toEqual([
      'Layer: test; Theme Type: unknown unavailable.',
    ]);
  });

  it('merges the default style into the theme style', () => {
    const layer = parse({
      style: {
        default: { strokeColor: '#333', fillColor: '#fff' },
        theme: {
          type: 'basic',
          style: { fillColor: '#f00', type: 'dot' },
        },
      },
    });

    expect(layer.style.theme.style).toEqual({
      strokeColor: '#333',
      fillColor: '#f00',
      icon: { type: 'dot' },
    });
  });

  it('turns a legacy cat object into categories', () => {
    const layer = parse({
      style: {
        default: {},
        theme: {
          type: 'categorized',
          field: 'category',
          cat: {
            office: { fillColor: '#f00' },
            city: { label: 'City', value: 'town' },
          },
        },
      },
    });

    const { theme } = layer.style;

    expect(theme.cat).toBeUndefined();
    expect(theme.categories.map((cat) => [cat.label, cat.value])).toEqual([
      ['office', 'office'],
      ['City', 'town'],
    ]);
    // Style keys on the category are moved into the category style.
    expect(theme.categories[0].style).toEqual({ fillColor: '#f00' });
    expect(theme.categories[0].fillColor).toBeUndefined();
  });

  it('turns a legacy cat_arr into categories', () => {
    const cat_arr = [{ value: 'a' }, { value: 'b', label: 'B' }];
    const layer = parse({
      style: {
        default: {},
        theme: { type: 'categorized', field: 'category', cat_arr },
      },
    });

    expect(layer.style.theme.cat_arr).toBeUndefined();
    expect(layer.style.theme.categories).toBe(cat_arr);
    expect(cat_arr.map((cat) => cat.label)).toEqual(['a', 'B']);
  });
});

describe('styleParser: category styles', () => {
  function parseCats(categories, defaultStyle = {}) {
    const layer = parse({
      style: {
        default: defaultStyle,
        theme: { type: 'categorized', field: 'category', categories },
      },
    });

    return layer.style.theme.categories;
  }

  it('merges the default style keys into the category style', () => {
    const [cat] = parseCats([{ value: 'a', style: { fillColor: '#f00' } }], {
      strokeColor: '#333',
      fillColor: '#fff',
      // Not a style key, not merged.
      foo: 'bar',
    });

    expect(cat.style).toEqual({ strokeColor: '#333', fillColor: '#f00' });
  });

  it('creates an empty style object for a category without style', () => {
    const [cat] = parseCats([{ value: 'a' }]);

    expect(cat.style).toEqual({});
    expect(cat.label).toBe('a');
  });

  it('keeps a style array as is', () => {
    const style = [{ fillColor: '#f00' }, { strokeColor: '#0f0' }];
    const [cat] = parseCats([{ value: 'a', style }], { strokeColor: '#333' });

    expect(cat.style).toBe(style);
    expect(cat.style).toEqual([{ fillColor: '#f00' }, { strokeColor: '#0f0' }]);
  });

  it('moves a category icon into the category style', () => {
    const [cat] = parseCats([{ value: 'a', icon: { type: 'dot' } }]);

    expect(cat.icon).toBeUndefined();
    expect(cat.style).toEqual({ icon: { type: 'dot' } });
  });

  it('assigns the url for each icon of a category icon array', () => {
    const [cat] = parseCats(
      [{ value: 'a', style: { icon: [{ svg: 'a.svg' }, { svg: 'b.svg' }] } }],
      { icon: { type: 'dot', scale: 2 } },
    );

    expect(cat.style.icon).toEqual([{ url: 'a.svg' }, { url: 'b.svg' }]);
  });

  it('does not merge the default icon into a category icon with type', () => {
    const [cat] = parseCats(
      [{ value: 'a', style: { icon: { type: 'square', fillColor: '#f00' } } }],
      { icon: { type: 'dot', scale: 2 } },
    );

    expect(cat.style.icon).toEqual({ type: 'square', fillColor: '#f00' });
  });

  it('does not merge the default icon into a category svg icon', () => {
    const [cat] = parseCats(
      [{ value: 'a', style: { icon: { svg: 'a.svg' } } }],
      { icon: { type: 'dot', scale: 2 } },
    );

    expect(cat.style.icon).toEqual({ url: 'a.svg' });
  });

  it('merges the default icon into a category icon without type or url', () => {
    const [cat] = parseCats(
      [{ value: 'a', style: { icon: { fillColor: '#f00' } } }],
      { icon: { type: 'dot', scale: 2, fillColor: '#999' } },
    );

    expect(cat.style.icon).toEqual({
      type: 'dot',
      scale: 2,
      fillColor: '#f00',
    });
  });

  it('keeps a category icon without type or url if the default icon is an array', () => {
    const [cat] = parseCats(
      [{ value: 'a', style: { icon: { fillColor: '#f00' } } }],
      { icon: [{ type: 'dot' }, { type: 'square' }] },
    );

    expect(cat.style.icon).toEqual({ fillColor: '#f00' });
  });

  it('creates a category icon from icon keys on the category', () => {
    const [cat] = parseCats([{ value: 'a', type: 'dot', scale: 3 }], {
      icon: { type: 'square' },
    });

    expect(cat.type).toBeUndefined();
    expect(cat.scale).toBeUndefined();
    expect(cat.style.icon).toEqual({ type: 'dot', scale: 3 });
  });

  it('assigns a copy of the default icon if no category icon is defined', () => {
    // The default icon is not a style key and is not merged into the category style.
    const [cat] = parseCats([{ value: 'a', style: { fillColor: '#f00' } }], {
      icon: { type: 'dot', fillColor: '#999' },
    });

    expect(cat.style).toEqual({
      fillColor: '#f00',
      icon: { type: 'dot', fillColor: '#999' },
    });
    expect(warnings()[0]).toMatch(
      /^Layer:test, Failed to evaluate icon: .* Default icon will be assigned\.$/,
    );
  });
});

describe('styleParser: categorized theme with multiple fields', () => {
  it('warns on categories with a missing field or without icon style', () => {
    const layer = parse({
      style: {
        default: {},
        theme: {
          type: 'categorized',
          fields: ['a', 'b'],
          categories: [
            { field: 'a', value: 1, style: { icon: { type: 'dot' } } },
            { field: 'c', value: 2, label: 'C', style: { fillColor: '#f00' } },
          ],
        },
      },
    });

    const [valid, invalid] = layer.style.theme.categories;

    expect(valid.style.icon).toEqual({ type: 'dot' });
    expect(invalid.style.icon).toEqual({ type: 'dot' });
    expect(warnings()).toEqual([
      'Layer: test; Cat C missed valid field.',
      'Layer: test; Cat C has invalid icon style.',
    ]);
  });
});

describe('styleParser: graduated theme', () => {
  function graduated(theme) {
    return parse({
      style: {
        default: {},
        theme: { type: 'graduated', field: 'value', ...theme },
      },
    }).style.theme;
  }

  const categories = () => [{ value: '10' }, { value: 1 }, { value: '5' }];

  it('sorts less_than categories by numeric value from highest to lowest', () => {
    const theme = graduated({
      graduated_breaks: 'less_than',
      categories: categories(),
    });

    expect(theme.categories.map((cat) => cat.value)).toEqual([10, 5, 1]);
  });

  it('sorts greater_than categories by numeric value from lowest to highest', () => {
    const theme = graduated({
      graduated_breaks: 'greater_than',
      categories: categories(),
    });

    expect(theme.categories.map((cat) => cat.value)).toEqual([1, 5, 10]);
  });

  it.each([undefined, 'between'])(
    'assigns less_than for graduated_breaks %s',
    (graduated_breaks) => {
      const theme = graduated({ graduated_breaks, categories: categories() });

      expect(theme.graduated_breaks).toBe('less_than');
      expect(theme.categories.map((cat) => cat.value)).toEqual([10, 5, 1]);
    },
  );

  it('assigns the numeric value as label', () => {
    const theme = graduated({ categories: [{ value: '5' }] });

    expect(theme.categories[0].label).toBe(5);
  });

  // https://github.com/GEOLYTIX/xyz/issues/3062: a graduated theme without categories cannot map a value to a style. The parser warns and invalidates the theme by removing its type, so the renderer and legend ignore it.
  it.each([
    ['without a categories array', {}],
    ['with an empty categories array', { categories: [] }],
    [
      'without a categories array and with a distribution',
      { distribution: 'jenks' },
    ],
    [
      'with an empty categories array and a distribution',
      { categories: [], distribution: 'jenks' },
    ],
  ])('invalidates a graduated theme %s', (_, theme) => {
    const parsed = graduated(theme);

    expect(parsed.type).toBeUndefined();
    expect(parsed.distribution).toBeUndefined();
    expect(warnings()).toContain(
      'Layer: test; Graduated theme without categories ignored.',
    );
  });
});

describe('styleParser: themes', () => {
  it('assigns key and title to each theme and the first theme as theme', () => {
    const layer = parse({
      style: {
        default: {},
        themes: {
          first: { type: 'basic' },
          second: { type: 'basic', title: 'Second theme' },
        },
      },
    });

    const { theme, themes } = layer.style;

    expect(theme).toBe(themes.first);
    expect([themes.first.key, themes.first.title]).toEqual(['first', 'first']);
    expect([themes.second.key, themes.second.title]).toEqual([
      'second',
      'Second theme',
    ]);
  });

  it('looks up a theme string in the themes', () => {
    const layer = parse({
      style: {
        default: {},
        theme: 'second',
        themes: { first: { type: 'basic' }, second: { type: 'basic' } },
      },
    });

    expect(layer.style.theme).toBe(layer.style.themes.second);
  });

  it('removes themes with the skip flag', () => {
    const layer = parse({
      style: {
        default: {},
        themes: {
          skipped: { type: 'basic', skip: true },
          kept: { type: 'basic' },
        },
      },
    });

    expect(Object.keys(layer.style.themes)).toEqual(['kept']);
    expect(layer.style.theme).toBe(layer.style.themes.kept);
  });

  it('assigns the parsed theme to a themes entry referencing the theme key', () => {
    const theme = { type: 'basic', key: 'current' };
    const layer = parse({
      style: { default: {}, theme, themes: { current: 'current' } },
    });

    expect(layer.style.themes.current).toBe(theme);
    expect(layer.style.theme).toBe(theme);
  });

  it('parses the categories of each theme', () => {
    const layer = parse({
      style: {
        default: { strokeColor: '#333' },
        themes: {
          cats: {
            type: 'categorized',
            field: 'category',
            cat: { a: { fillColor: '#f00' } },
          },
        },
      },
    });

    expect(layer.style.themes.cats.categories[0].style).toEqual({
      strokeColor: '#333',
      fillColor: '#f00',
    });
  });
});

describe('styleParser: hovers and labels', () => {
  it('assigns the featureHover method to a hover', () => {
    const method = () => {};
    const layer = parse({
      style: { default: {}, hover: { field: 'name', method } },
    });

    expect(layer.style.hover.method).toBe(method);
  });

  it('assigns key, title and the first hover as hover', () => {
    const layer = parse({
      style: {
        default: {},
        hovers: {
          name: { field: 'name' },
          category: { field: 'category', title: 'Category' },
        },
      },
    });

    const { hover, hovers } = layer.style;

    expect(hover).toBe(hovers.name);
    expect(hover.method).toBe(mapp.layer.featureHover);
    expect([hovers.name.key, hovers.name.title]).toEqual(['name', 'name']);
    expect(hovers.category.title).toBe('Category');
  });

  it('looks up a hover string in the hovers', () => {
    const layer = parse({
      style: {
        default: {},
        hover: 'category',
        hovers: { name: {}, category: {} },
      },
    });

    expect(layer.style.hover).toBe(layer.style.hovers.category);
  });

  it('assigns key, title and the first label as label', () => {
    const layer = parse({
      style: {
        default: {},
        labels: { name: { field: 'name' }, id: { field: 'id', title: 'ID' } },
      },
    });

    const { label, labels } = layer.style;

    expect(label).toBe(labels.name);
    expect([labels.name.key, labels.name.title]).toEqual(['name', 'name']);
    expect(labels.id.title).toBe('ID');
  });

  it('looks up a label string in the labels', () => {
    const layer = parse({
      style: { default: {}, label: 'id', labels: { name: {}, id: {} } },
    });

    expect(layer.style.label).toBe(layer.style.labels.id);
  });
});

describe('styleParser: icon_scaling fields', () => {
  it('assigns key, title and the first field as icon_scaling field', () => {
    const layer = parse({
      style: {
        default: {},
        icon_scaling: {
          fields: {
            size: { field: 'size_field' },
            count: { field: 'count_field', title: 'Count' },
          },
        },
      },
    });

    const { icon_scaling } = layer.style;

    expect(icon_scaling.field).toBe('size_field');
    expect([
      icon_scaling.fields.size.key,
      icon_scaling.fields.size.title,
    ]).toEqual(['size', 'size']);
    expect(icon_scaling.fields.count.title).toBe('Count');
  });

  it('keeps an implicit icon_scaling field', () => {
    const layer = parse({
      style: {
        default: {},
        icon_scaling: {
          field: 'count_field',
          fields: { size: { field: 'size_field' } },
        },
      },
    });

    expect(layer.style.icon_scaling.field).toBe('count_field');
  });
});
