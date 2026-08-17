import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

/**
The olStyle module is browser code with no imports. It reads the ol namespace and mapp.utils from globals, so it can be tested in node against fake Openlayers style classes.

The fake Icon records the options it was constructed with. Counting constructions is what these tests are for: the module must construct one Icon per distinct icon variant rather than one per feature.
*/
let olStyle;

const iconOptions = [];

class Icon {
  constructor(options) {
    this.options = options;
    iconOptions.push(options);
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
});

/**
The Icon memo is module scoped and persists for the lifetime of the module. Each test uses its own src so that an Icon memoized by one test can not satisfy another test.
*/
function testSrc(id) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg id="${id}"/>`)}`;
}

describe('olStyle icon sharing', () => {
  it('constructs one Icon for many features with an identical icon style', () => {
    const src = testSrc('shared');

    const Styles = Array.from({ length: 100 }, () =>
      // Each feature carries its own cloned style object, as featureStyle assigns with structuredClone.
      olStyle({ icon: { url: src } }),
    );

    const images = Styles.map((s) => s[0].image);

    // One Icon for one hundred features. Every feature style holds the same object.
    expect(iconOptions).toHaveLength(1);
    expect(new Set(images).size).toBe(1);
  });

  it('constructs a separate Icon per scale', () => {
    const src = testSrc('scale');

    // The cluster, zoom, field, and highlight scales are per feature values. The scale must stay part of the Icon key.
    olStyle({ clusterScale: 1.5, icon: { url: src } });
    olStyle({ clusterScale: 2.5, icon: { url: src } });
    olStyle({ clusterScale: 1.5, icon: { url: src } });

    expect(iconOptions).toHaveLength(2);
    expect(iconOptions.map((options) => options.scale)).toEqual([1.5, 2.5]);
  });

  it('constructs a separate Icon per anchor', () => {
    const src = testSrc('anchor');

    olStyle({ icon: { anchor: [0.5, 1], url: src } });
    olStyle({ icon: { anchor: [0.5, 0.5], url: src } });
    olStyle({ icon: { anchor: [0.5, 1], url: src } });

    expect(iconOptions).toHaveLength(2);
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

describe('olStyle crossOrigin', () => {
  it('does not assign crossOrigin for a data url', () => {
    // crossOrigin has no effect on a data url and is a component of the Openlayers IconImageCache key.
    olStyle({ icon: { url: testSrc('crossOrigin') } });

    expect(iconOptions[0].crossOrigin).toBeUndefined();
  });

  it('assigns crossOrigin for a remote url', () => {
    olStyle({
      icon: { url: 'https://geolytix.github.io/MapIcons/poi/train_icon.svg' },
    });

    expect(iconOptions[0].crossOrigin).toBe('anonymous');
  });
});

describe('olStyle icon url', () => {
  it('creates the icon url from the svgSymbols type method', () => {
    const Styles = olStyle({ icon: { fillColor: '#1a9641', type: 'dot' } });

    expect(Styles).toHaveLength(1);
    expect(decodeURIComponent(iconOptions[0].src)).toContain('fill="#1a9641"');
  });

  it('does not push a style for an icon without a url', () => {
    // The svgSymbols template method returns undefined for a template which is not yet loaded.
    mapp.utils.svgSymbols.template = () => undefined;

    const Styles = olStyle({ icon: { template: 'late', type: 'template' } });

    expect(iconOptions).toHaveLength(0);
    expect(Styles).toHaveLength(0);
  });

  it('processes an icon array as separate styles', () => {
    const Styles = olStyle({
      icon: [{ url: testSrc('array1') }, { url: testSrc('array2') }],
    });

    expect(Styles).toHaveLength(2);
    expect(iconOptions).toHaveLength(2);
  });
});
