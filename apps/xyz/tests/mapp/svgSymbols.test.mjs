// @vitest-environment jsdom
import { beforeAll, describe, expect, it, vi } from 'vitest';

/**
The svgSymbols module is browser code. It creates an XMLSerializer at module scope and imports uhtml, which binds document methods at module init, so the tests run in a jsdom environment.

The module is imported dynamically so the mapp global is in place first. The template symbol substitutes into a string. The drawn symbols build nodes with uhtml and serialize them with XMLSerializer.
*/
let svgSymbols;

beforeAll(async () => {
  vi.stubGlobal('mapp', {
    utils: {
      svgSymbols: {
        templates: {
          pin: '<svg><path fill="SUBSTITUTE_COLOUR" id="path2"/></svg>',
        },
      },
    },
  });

  svgSymbols = await import('../../../mapp/lib/utils/svgSymbols.mjs');
});

/**
The memo caches are module scoped and persist for the lifetime of the module. Each test uses its own substitute values so that one test can not satisfy another test from the cache.
*/
describe('svgSymbols.template memoization', () => {
  it('returns the same string reference for an identical substitute', () => {
    const url = svgSymbols.template({
      template: 'pin',
      substitute: { SUBSTITUTE_COLOUR: '#1a9641' },
    });

    const memoized = svgSymbols.template({
      template: 'pin',
      substitute: { SUBSTITUTE_COLOUR: '#1a9641' },
    });

    // The Openlayers IconImageCache is keyed on the icon src. An identical style must resolve to the identical string or the browser will instantiate a second isolated SVG document for the same image.
    expect(memoized).toBe(url);
    expect(decodeURIComponent(url)).toContain('fill="#1a9641"');
  });

  it('returns a different string for a different substitute', () => {
    const green = svgSymbols.template({
      template: 'pin',
      substitute: { SUBSTITUTE_COLOUR: '#2b83ba' },
    });

    const grey = svgSymbols.template({
      template: 'pin',
      substitute: { SUBSTITUTE_COLOUR: '#888888' },
    });

    expect(grey).not.toBe(green);
    expect(decodeURIComponent(green)).toContain('fill="#2b83ba"');
    expect(decodeURIComponent(grey)).toContain('fill="#888888"');
  });

  it('does not substitute into an already memoized string', () => {
    // A memoized url must not be substituted a second time. The substitute key is no longer present in the memoized string, but a naive implementation which memoizes the mutated template rather than the result would corrupt the next call.
    const first = svgSymbols.template({
      template: 'pin',
      substitute: { SUBSTITUTE_COLOUR: '#fdae61' },
    });

    const second = svgSymbols.template({
      template: 'pin',
      substitute: { SUBSTITUTE_COLOUR: '#fdae61' },
    });

    expect(second).toBe(first);
    expect(decodeURIComponent(second)).not.toContain('SUBSTITUTE_COLOUR');
  });

  it('does not memoize a template which is not yet loaded', () => {
    // Templates are fetched asynchronously by the svgTemplates method. A style which renders before its template resolves must not be poisoned with a cached undefined.
    const missing = svgSymbols.template({
      template: 'late',
      substitute: { SUBSTITUTE_COLOUR: '#d7191c' },
    });

    expect(missing).toBeUndefined();

    mapp.utils.svgSymbols.templates.late =
      '<svg><rect fill="SUBSTITUTE_COLOUR"/></svg>';

    const loaded = svgSymbols.template({
      template: 'late',
      substitute: { SUBSTITUTE_COLOUR: '#d7191c' },
    });

    expect(loaded).toBeTypeOf('string');
    expect(decodeURIComponent(loaded)).toContain('fill="#d7191c"');
  });

  it('does not collide keys across templates', () => {
    mapp.utils.svgSymbols.templates.square =
      '<svg><rect fill="SUBSTITUTE_COLOUR"/></svg>';

    const pin = svgSymbols.template({
      template: 'pin',
      substitute: { SUBSTITUTE_COLOUR: '#ffffbf' },
    });

    const square = svgSymbols.template({
      template: 'square',
      substitute: { SUBSTITUTE_COLOUR: '#ffffbf' },
    });

    expect(square).not.toBe(pin);
    expect(decodeURIComponent(pin)).toContain('<path');
    expect(decodeURIComponent(square)).toContain('<rect');
  });
});

/**
The drawn symbols build nodes with uhtml and serialize them with XMLSerializer. Each symbol method is memoized on the style values it reads, and the data URL is the serialized SVG.
*/
describe('svgSymbols drawn symbols memoization', () => {
  it('memoizes dot on fillColor', () => {
    expect(svgSymbols.dot({ fillColor: '#1a9641' })).toBe(
      svgSymbols.dot({ fillColor: '#1a9641' }),
    );

    expect(svgSymbols.dot({ fillColor: '#1a9641' })).not.toBe(
      svgSymbols.dot({ fillColor: '#d7191c' }),
    );
  });

  it('memoizes markerLetter on color and letter', () => {
    expect(svgSymbols.markerLetter({ color: '#2E6F9E', letter: 'A' })).toBe(
      svgSymbols.markerLetter({ color: '#2E6F9E', letter: 'A' }),
    );

    // The letter is part of the key. A key built only from the colour would return the wrong letter.
    expect(svgSymbols.markerLetter({ color: '#2E6F9E', letter: 'A' })).not.toBe(
      svgSymbols.markerLetter({ color: '#2E6F9E', letter: 'B' }),
    );
  });

  it('memoizes the shape symbols on fillColor and layers', () => {
    const layers = { 0.5: '#fdae61' };

    expect(svgSymbols.square({ fillColor: '#FFF', layers })).toBe(
      svgSymbols.square({ fillColor: '#FFF', layers }),
    );

    // The layers object is serialized into the key. A key built only from the fillColor would return the icon without its layers.
    expect(svgSymbols.square({ fillColor: '#FFF', layers })).not.toBe(
      svgSymbols.square({ fillColor: '#FFF', layers: { 0.5: '#2b83ba' } }),
    );
  });

  it('does not share memo entries across symbol types', () => {
    expect(svgSymbols.dot({ fillColor: '#1a9641' })).not.toBe(
      svgSymbols.square({ fillColor: '#1a9641' }),
    );
  });
});

/**
Every drawn symbol serializes into a `data:image/svg+xml` URL. The layered symbols append one element per layer, so the decoded URL carries the layer colour.
*/
describe('svgSymbols drawn symbols output', () => {
  const layers = { 0.5: '#abcdef' };

  const layered = ['target', 'triangle', 'square', 'diamond', 'semiCircle'];

  for (const type of layered) {
    it(`${type} draws the fillColor and the layers`, () => {
      const url = svgSymbols[type]({ fillColor: '#123456', layers });

      expect(url).toMatch(/^data:image\/svg\+xml,/);

      const decoded = decodeURIComponent(url);

      expect(decoded).toContain('#123456');
      expect(decoded).toContain('#abcdef');
    });

    it(`${type} draws without layers and defaults the fillColor`, () => {
      const decoded = decodeURIComponent(svgSymbols[type]({}));

      expect(decoded).toMatch(/#FFF|#fff/);
      expect(decoded).not.toContain('#abcdef');
    });
  }

  it('markerColor draws the marker and dot colours', () => {
    const decoded = decodeURIComponent(
      svgSymbols.markerColor({ colorDot: '#0000ff', colorMarker: '#ff0000' }),
    );

    expect(decoded).toContain('#ff0000');
    expect(decoded).toContain('#0000ff');

    // The dot colour is part of the key.
    expect(
      svgSymbols.markerColor({ colorDot: '#0000ff', colorMarker: '#ff0000' }),
    ).not.toBe(
      svgSymbols.markerColor({ colorDot: '#00ff00', colorMarker: '#ff0000' }),
    );
  });

  it('circle draws the stroke and defaults the stroke values', () => {
    const decoded = decodeURIComponent(
      svgSymbols.circle({ strokeColor: '#654321', strokeWidth: 3 }),
    );

    expect(decoded).toContain('stroke="#654321"');
    expect(decoded).toContain('stroke-width="3"');

    const defaults = decodeURIComponent(svgSymbols.circle({}));

    expect(defaults).toContain('stroke="#333"');
    expect(defaults).toContain('stroke-width="1"');
  });

  it('template does not substitute where the substitute is not an object', () => {
    const decoded = decodeURIComponent(
      svgSymbols.template({ substitute: 'SUBSTITUTE_COLOUR', template: 'pin' }),
    );

    expect(decoded).toContain('SUBSTITUTE_COLOUR');
  });

  it('evicts the oldest memo entry once the memo limit is reached', () => {
    // The memo holds 1024 entries per symbol type and evicts in insertion order. A template is changed after its entry has been evicted, so a memo which did not evict would return the stale string.
    mapp.utils.svgSymbols.templates.evict = '<svg id="stale"/>';

    const stale = svgSymbols.template({ template: 'evict' });

    for (let index = 0; index < 1024; index++) {
      svgSymbols.template({
        substitute: { SUBSTITUTE_COLOUR: `#${index}` },
        template: 'pin',
      });
    }

    mapp.utils.svgSymbols.templates.evict = '<svg id="fresh"/>';

    expect(decodeURIComponent(stale)).toContain('stale');
    expect(
      decodeURIComponent(svgSymbols.template({ template: 'evict' })),
    ).toContain('fresh');
  });
});
