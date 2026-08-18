import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

/**
The olStyle module is browser code with no browser imports. It reads the ol namespace and mapp.utils from globals, so it can be tested in node against fake Openlayers style classes.

The svgToBitmap module is mocked so that a test controls which icon variants have been rasterized. The fake Icon and Circle record the options they were constructed with: counting constructions is what these tests are for, since the module must construct one image style per distinct icon variant rather than one per feature.
*/
let olStyle;

const bitmapEntries = new Map();

const unavailableSrcs = new Set();

vi.mock('../../apps/mapp/lib/utils/svgToBitmap.mjs', () => ({
  bitmapStats: () => ({}),
  bitmapUnavailable: (src) => unavailableSrcs.has(src),
  iconBitmap: (src) => bitmapEntries.get(src),
  onBitmapReady: () => {},
  requestBitmaps: async () => {},
  requestBitmap: () => undefined,
}));

const iconOptions = [];
const circleOptions = [];

class Icon {
  constructor(options) {
    this.options = options;
    iconOptions.push(options);
  }
}

class Circle {
  constructor(options) {
    this.options = options;
    circleOptions.push(options);
  }
}

class Style {
  constructor(options) {
    Object.assign(this, options);
  }
}

beforeAll(async () => {
  vi.stubGlobal('ol', {
    style: {
      Circle,
      Fill: class {},
      Icon,
      Stroke: class {},
      Style,
      Text: class {},
    },
  });

  vi.stubGlobal('mapp', {
    utils: {
      hexa: (color) => color,
      svgSymbols: {
        // Stands in for the memoized svgSymbols methods. An identical style resolves to an identical data URL.
        dot: (icon) =>
          `data:image/svg+xml,${encodeURIComponent(`<svg><circle fill="${icon.fillColor}"/></svg>`)}`,
      },
    },
  });

  olStyle = (await import('../../apps/mapp/lib/utils/olStyle.mjs')).default;
});

beforeEach(() => {
  iconOptions.length = 0;
  circleOptions.length = 0;
});

/**
The image style memos are module scoped and persist for the lifetime of the module. Each test uses its own src so that a style memoized by one test can not satisfy another test.
*/
function testSrc(id) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg id="${id}"/>`)}`;
}

/**
Seeds a variant which will not be rasterized for the src, as the svgToBitmap module would for a failed rasterization or once the bitmap limit is reached.
*/
function seedUnavailable(src) {
  unavailableSrcs.add(src);
  return src;
}

/**
Seeds a rasterized variant for the src, as the svgToBitmap module would.
*/
function seedBitmap(src, pixelRatio = 2) {
  const image = { height: 24 * pixelRatio, width: 24 * pixelRatio };
  bitmapEntries.set(src, { image, pixelRatio });
  return image;
}

describe('olStyle bitmap icons', () => {
  it('constructs one Icon for many features with an identical icon style', () => {
    const src = testSrc('shared');
    const image = seedBitmap(src);

    const Styles = Array.from({ length: 100 }, () =>
      // Each feature carries its own cloned style object, as featureStyle assigns with structuredClone.
      olStyle({ icon: { url: src } }),
    );

    // One Icon for one hundred features. Every feature style holds the same object.
    expect(iconOptions).toHaveLength(1);
    expect(new Set(Styles.map((s) => s[0].image)).size).toBe(1);
    expect(iconOptions[0].img).toBe(image);
    expect(iconOptions[0].src).toBeUndefined();
  });

  it('divides the scale by the pixel ratio the bitmap was rasterized at', () => {
    const src = testSrc('pixelRatio');
    seedBitmap(src, 2);

    // A bitmap rasterized at twice the device pixel ratio must render at half the scale to occupy the size the SVG declares.
    olStyle({ icon: { scale: 3, url: src } });

    expect(iconOptions[0].scale).toBe(1.5);
  });

  it('constructs a separate Icon per scale and per anchor', () => {
    const src = testSrc('variants');
    seedBitmap(src, 1);

    // The cluster, zoom, field, and highlight scales are per feature values, so the scale must stay part of the Icon key and out of the variant key.
    olStyle({ clusterScale: 1.5, icon: { url: src } });
    olStyle({ clusterScale: 2.5, icon: { url: src } });
    olStyle({ clusterScale: 1.5, icon: { url: src } });
    olStyle({ icon: { anchor: [0.5, 1], url: src } });

    expect(iconOptions).toHaveLength(3);
  });

  it('caches the Styles on the feature', () => {
    const src = testSrc('cached');
    seedBitmap(src);

    const feature = { set: vi.fn() };

    olStyle({ icon: { url: src } }, feature);

    expect(feature.set).toHaveBeenCalledWith('Styles', expect.anything(), true);
  });
});

describe('olStyle fallback symbol', () => {
  it('renders a Circle rather than a data url Icon while a variant is rasterized', () => {
    // An Icon constructed from the data url would be retained by the Openlayers IconImageCache as an isolated SVG document, which is the leak this replaces.
    const Styles = olStyle({ icon: { url: testSrc('notRasterized') } });

    expect(iconOptions).toHaveLength(0);
    expect(circleOptions).toHaveLength(1);
    expect(Styles[0].image).toBeInstanceOf(Circle);
  });

  it('shares one Circle per fill colour', () => {
    olStyle({ icon: { fillColor: '#1a9641', url: testSrc('fallbackA') } });
    olStyle({ icon: { fillColor: '#1a9641', url: testSrc('fallbackB') } });
    olStyle({ icon: { fillColor: '#d7191c', url: testSrc('fallbackC') } });

    // The Openlayers cache key for a RegularShape is structural, so a fixed radius yields one entry per colour however many features render it.
    expect(circleOptions).toHaveLength(2);
    expect(circleOptions.every((options) => options.radius === 6)).toBe(true);
  });

  it('does not cache the Styles on the feature', () => {
    // Cached Styles would outlive the rasterization and the fallback would never be replaced.
    const feature = { set: vi.fn() };

    olStyle({ icon: { url: testSrc('notCached') } }, feature);

    expect(feature.set).not.toHaveBeenCalled();
  });
});

describe('olStyle unavailable bitmap', () => {
  it('renders the data url Icon for a variant which will not be rasterized', () => {
    // There is no bitmap to wait for. The icon itself must be drawn rather than the symbol which stands in for it, as the legendIcon element likewise draws the data url where no bitmap is available.
    const src = seedUnavailable(testSrc('unavailable'));

    const Styles = olStyle({ icon: { url: src } });

    expect(circleOptions).toHaveLength(0);
    expect(iconOptions).toHaveLength(1);
    expect(iconOptions[0].src).toBe(src);
    expect(Styles[0].image).toBeInstanceOf(Icon);
  });

  it('constructs one Icon for many features with an unavailable variant', () => {
    const src = seedUnavailable(testSrc('unavailableShared'));

    Array.from({ length: 100 }, () => olStyle({ icon: { url: src } }));

    expect(iconOptions).toHaveLength(1);
  });

  it('caches the Styles on the feature', () => {
    // The Styles hold the icon rather than a fallback symbol, so there is nothing for a later render to replace.
    const src = seedUnavailable(testSrc('unavailableCached'));

    const feature = { set: vi.fn() };

    olStyle({ icon: { url: src } }, feature);

    expect(feature.set).toHaveBeenCalledWith('Styles', expect.anything(), true);
  });
});

describe('olStyle url icons', () => {
  it('keeps a remote url on the src path with crossOrigin', () => {
    // A url is a single image resource shared by every feature which references it, which is the deduplication the browser is designed for.
    olStyle({
      icon: { url: 'https://geolytix.github.io/MapIcons/poi/train_icon.svg' },
    });

    expect(iconOptions).toHaveLength(1);
    expect(iconOptions[0].crossOrigin).toBe('anonymous');
    expect(iconOptions[0].src).toBe(
      'https://geolytix.github.io/MapIcons/poi/train_icon.svg',
    );
  });

  it('applies the compound scale to the Icon', () => {
    olStyle({
      clusterScale: 2,
      icon: { scale: 3, url: 'https://geolytix.github.io/MapIcons/dot.svg' },
      scale: 5,
    });

    expect(iconOptions[0].scale).toBe(30);
  });
});

describe('olStyle icon url', () => {
  it('creates the icon url from the svgSymbols type method', () => {
    const Styles = olStyle({ icon: { fillColor: '#2b83ba', type: 'dot' } });

    expect(Styles).toHaveLength(1);
    expect(Styles[0].image).toBeInstanceOf(Circle);
  });

  it('does not push a style for an icon without a url', () => {
    // The svgSymbols template method returns undefined for a template which is not yet loaded.
    mapp.utils.svgSymbols.template = () => undefined;

    const Styles = olStyle({ icon: { template: 'late', type: 'template' } });

    expect(iconOptions).toHaveLength(0);
    expect(circleOptions).toHaveLength(0);
    expect(Styles).toHaveLength(0);
  });

  it('processes an icon array as separate styles', () => {
    const first = testSrc('array1');
    const second = testSrc('array2');
    seedBitmap(first);
    seedBitmap(second);

    const Styles = olStyle({ icon: [{ url: first }, { url: second }] });

    expect(Styles).toHaveLength(2);
    expect(iconOptions).toHaveLength(2);
  });
});
