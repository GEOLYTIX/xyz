// @vitest-environment jsdom
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

/**
The legendIcon module renders a mapp style object into an element outside the mapview.Map canvas. It builds nodes with uhtml and serializes them with XMLSerializer, so the tests run in a jsdom environment.

The icon url and image style are resolved through the mapp.utils.iconUrl and mapp.utils.imageStyle methods, which are faked so that a test controls whether an image is loaded, which bitmaps are available, and which icons have no url. The Openlayers render context is faked to record what is drawn into the canvas.
*/
let legendIcon;

/**
The params every imageStyle request was made with.
*/
const imageStyleParams = [];

/**
The bitmaps the svgBitmap module would hold for a src.
*/
const bitmapEntries = new Map();

/**
The image styles which report their image as loaded, by url.
*/
const loadedUrls = new Set();

/**
The intrinsic size the image style reports for a url.
*/
const imageSizes = new Map();

const drawn = [];

const requestBitmaps = vi.fn(async () => {});

class FakeImage extends EventTarget {}

class FakeImageStyle {
  constructor(params) {
    this.params = params;
    this.image = new FakeImage();

    // The Openlayers image style loads its image asynchronously. A test dispatches the load event.
    this.load = vi.fn();
  }

  loaded() {
    this.image.dispatchEvent(new Event('load'));
  }

  getImage() {
    return this;
  }

  getImageState() {
    return loadedUrls.has(this.params.url) ? 2 : 0;
  }

  getImageSize() {
    return imageSizes.get(this.params.url);
  }

  getScale() {
    return this.params.scale;
  }

  addEventListener(type, listener) {
    this.image.addEventListener(type, listener);
  }
}

class Style {
  constructor(options) {
    this.options = options;
  }

  getImage() {
    return this.options.image;
  }
}

class Point {
  constructor(coordinates) {
    this.coordinates = coordinates;
  }
}

function iconUrl(icon) {
  if (icon.url) return icon.url;

  if (icon.svg) return icon.svg;

  if (icon.type === 'missing') return;

  return `data:image/svg+xml,${encodeURIComponent(`<svg data-type="${icon.type || 'dot'}" fill="${icon.fillColor}"/>`)}`;
}

const contexts = [];

beforeAll(async () => {
  const uhtml = await import('../../../mapp/lib/utils/uhtml.mjs');

  vi.stubGlobal('ol', {
    geom: { Point },
    render: {
      toContext: vi.fn((context, options) => {
        const vectorContext = {
          context,
          drawGeometry: vi.fn((geometry) =>
            drawn.push({ geometry, style: vectorContext.style }),
          ),
          options,
          setStyle: vi.fn((style) => {
            vectorContext.style = style;
          }),
        };

        contexts.push(vectorContext);

        return vectorContext;
      }),
    },
    style: { Style },
  });

  vi.stubGlobal('mapp', {
    utils: {
      html: uhtml.html,
      iconUrl,
      imageStyle: (params) => {
        imageStyleParams.push(params);
        return new FakeImageStyle(params);
      },
      svg: uhtml.svg,
      svgBitmap: {
        iconBitmap: (src) => bitmapEntries.get(src),
        requestBitmaps,
      },
    },
  });

  // jsdom does not implement the canvas context. The fake records what is drawn into it.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    function () {
      this.context ??= { drawImage: vi.fn() };
      return this.context;
    },
  );

  legendIcon = (await import('../../../mapp/lib/ui/elements/legendIcon.mjs'))
    .default;
});

beforeEach(() => {
  imageStyleParams.length = 0;
  drawn.length = 0;
  contexts.length = 0;
  bitmapEntries.clear();
  loadedUrls.clear();
  imageSizes.clear();
  requestBitmaps.mockClear();
  ol.render.toContext.mockClear();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  console.warn.mockRestore();
});

/**
Awaits the microtasks queued by a resolved requestBitmaps promise.
*/
async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

function backgroundUrl(element) {
  const match = element
    .getAttribute('style')
    .match(/background-image: url\((.*)\);/);

  return match && decodeURIComponent(match[1]);
}

describe('legendIcon polygon and line symbols', () => {
  it('draws a polygon symbol for a fillColor style', () => {
    const style = {
      fillColor: '#1a9641',
      height: 24,
      strokeColor: '#333',
      width: 24,
    };

    const icon = legendIcon(style);

    expect(icon.classList.contains('legend-icon')).toBe(true);
    expect(icon.children).toHaveLength(1);

    const url = backgroundUrl(icon.firstElementChild);

    expect(url).toMatch(/^data:image\/svg\+xml,/);
    expect(url).toContain('<rect');
    expect(url).toContain('fill="#1a9641"');
    expect(url).toContain('stroke="#333"');

    // The symbol defaults are assigned to the style object.
    expect(style.fillOpacity).toBe(1);
    expect(style.strokeWidth).toBe(1);
    expect(style.lineDash).toBe('');
  });

  it('draws a line symbol for a strokeColor style without a fillColor', () => {
    const style = { height: 24, strokeColor: '#d7191c', width: 24 };

    const icon = legendIcon(style);

    expect(icon.children).toHaveLength(1);

    const url = backgroundUrl(icon.firstElementChild);

    expect(url).toContain('<path');
    expect(url).toContain('stroke="#d7191c"');
    expect(icon.firstElementChild.getAttribute('style')).toContain(
      'width: 24px',
    );
  });

  it('does not draw a line symbol where the style has a fillColor', () => {
    const icon = legendIcon({
      fillColor: '#FFF',
      height: 24,
      strokeColor: '#333',
      width: 24,
    });

    expect(icon.children).toHaveLength(1);
    expect(backgroundUrl(icon.firstElementChild)).toContain('<rect');
  });

  it('returns an empty legend icon for a style without a symbol', () => {
    expect(legendIcon({}).children).toHaveLength(0);
  });
});

describe('legendIcon inline icon', () => {
  it('draws the icon url as a background image with the default size', () => {
    const icon = legendIcon({ icon: { type: 'dot', fillColor: '#2b83ba' } });

    const element = icon.firstElementChild;

    expect(element.tagName).toBe('DIV');
    expect(backgroundUrl(element)).toContain('fill="#2b83ba"');
    expect(element.getAttribute('style')).toContain('width: 24px');
    expect(element.getAttribute('style')).toContain('height: 24px');
  });

  it('resolves the icon from the style object itself where it has no icon object', () => {
    const icon = legendIcon({ height: 40, type: 'square', width: 40 });

    expect(backgroundUrl(icon.firstElementChild)).toContain(
      'data-type="square"',
    );
    expect(icon.firstElementChild.getAttribute('style')).toContain(
      'width: 40px',
    );
  });

  it('resolves a legacy svg source', () => {
    const icon = legendIcon({ svg: 'https://example.com/pin.svg' });

    expect(backgroundUrl(icon.firstElementChild)).toBe(
      'https://example.com/pin.svg',
    );
  });

  it('warns and returns an element where the icon has no url', () => {
    const icon = legendIcon({ icon: { type: 'missing' } });

    expect(console.warn).toHaveBeenCalledOnce();
    expect(icon.firstElementChild.tagName).toBe('DIV');
  });

  it('draws the background image for a bitmap style with a url which is not a data URL', () => {
    const icon = legendIcon({
      bitmap_icons: true,
      icon: { url: 'https://example.com/pin.svg' },
    });

    expect(icon.firstElementChild.tagName).toBe('DIV');
    expect(requestBitmaps).not.toHaveBeenCalled();
  });

  it('draws the rasterized bitmap into a canvas fitted to the icon ratio', async () => {
    const src = iconUrl({ type: 'dot', fillColor: '#fdae61' });

    // A 20x30 icon rasterized at a pixel ratio of 2.
    bitmapEntries.set(src, { image: { height: 60, width: 40 }, pixelRatio: 2 });

    const icon = legendIcon({
      bitmap_icons: true,
      icon: { type: 'dot', fillColor: '#fdae61' },
    });

    const canvas = icon.firstElementChild;

    expect(canvas.tagName).toBe('CANVAS');
    expect(requestBitmaps).toHaveBeenCalledWith([src]);

    await flush();

    expect(canvas.width).toBe(40);
    expect(canvas.height).toBe(60);

    // The icon is fitted within the 24x24 bounds by the ratio 24/30. A 24x24 element would stretch the icon.
    expect(canvas.style.width).toBe('16px');
    expect(canvas.style.height).toBe('24px');
    expect(canvas.getContext('2d').drawImage).toHaveBeenCalledWith(
      bitmapEntries.get(src).image,
      0,
      0,
    );
  });

  it('replaces the canvas with a background image where the bitmap is unavailable', async () => {
    const icon = legendIcon({
      bitmap_icons: true,
      icon: { type: 'dot', fillColor: '#abdda4' },
    });

    expect(icon.firstElementChild.tagName).toBe('CANVAS');

    await flush();

    expect(icon.children).toHaveLength(1);
    expect(icon.firstElementChild.tagName).toBe('DIV');
    expect(backgroundUrl(icon.firstElementChild)).toContain('fill="#abdda4"');
  });
});

describe('legendIcon layered icon', () => {
  it('draws the layered icons once every image has loaded', () => {
    const style = {
      icon: [
        {
          fillColor: '#FFF',
          legendAnchor: [0.5, 1],
          legendScale: 2,
          scale: 0.5,
          type: 'dot',
        },
        { fillColor: '#000', type: 'square' },
      ],
    };

    const icon = legendIcon(style);

    const canvas = icon.firstElementChild;

    expect(canvas.tagName).toBe('CANVAS');
    expect(canvas.width).toBe(24);

    // An image style is requested for each icon with the legend scale and anchor.
    expect(imageStyleParams).toHaveLength(2);
    expect(imageStyleParams[0]).toMatchObject({
      anchor: [0.5, 1],
      bitmap: undefined,
      scale: 1,
    });
    expect(imageStyleParams[1]).toMatchObject({ scale: 2 });

    // Nothing is drawn until every image has loaded.
    expect(ol.render.toContext).not.toHaveBeenCalled();

    // The image styles were loaded, since the images were not yet loaded.
    const images = style.icon.map((icon) => icon.legendStyle.getImage());

    expect(images.every((image) => image.load.mock.calls.length === 1)).toBe(
      true,
    );

    images[0].loaded();

    expect(ol.render.toContext).not.toHaveBeenCalled();

    images[1].loaded();

    expect(ol.render.toContext).toHaveBeenCalledOnce();

    // The composite of images without a size takes the bounds, and is drawn at ratio 1.
    expect(contexts[0].options).toMatchObject({
      pixelRatio: 1,
      size: [24, 24],
    });
    expect(drawn).toHaveLength(2);
    expect(drawn[0].geometry.coordinates).toEqual([12, 12]);

    // The fitted styles are requested for the drawn scale.
    expect(imageStyleParams).toHaveLength(4);
    expect(drawn.map((entry) => entry.style)).toEqual(
      style.icon.map((icon) => icon.legendStyle),
    );
  });

  it('draws already loaded images without waiting for a load event', () => {
    const icons = [
      { fillColor: '#a', type: 'dot' },
      { fillColor: '#b', type: 'dot' },
    ];

    icons.forEach((icon) => loadedUrls.add(iconUrl(icon)));

    legendIcon({ height: 48, icon: icons, width: 48 });

    expect(ol.render.toContext).toHaveBeenCalledOnce();
    expect(contexts[0].options.size).toEqual([48, 48]);
  });

  it('fits the composite of sized images within the bounds', () => {
    const icons = [
      { fillColor: '#c', type: 'dot' },
      { fillColor: '#d', scale: 2, type: 'dot' },
    ];

    icons.forEach((icon) => {
      loadedUrls.add(iconUrl(icon));
      imageSizes.set(iconUrl(icon), [24, 12]);
    });

    legendIcon({ icon: icons });

    // The largest drawn image is 48x24, which is fitted into 24x24 by the ratio 0.5.
    expect(contexts[0].options.size).toEqual([24, 12]);
    expect(drawn[0].geometry.coordinates).toEqual([12, 6]);

    const fitted = imageStyleParams.slice(2);

    expect(fitted.map((params) => params.scale)).toEqual([0.5, 1]);
  });

  it('warns and skips an icon without a url', () => {
    legendIcon({ icon: [{ type: 'missing' }] });

    expect(console.warn).toHaveBeenCalledOnce();
    expect(imageStyleParams).toHaveLength(0);
  });

  it('requests the bitmaps before drawing a bitmap style', async () => {
    const icons = [{ fillColor: '#e', type: 'dot' }];

    loadedUrls.add(iconUrl(icons[0]));

    const style = { bitmap_icons: true, icon: icons };

    legendIcon(style);

    expect(requestBitmaps).toHaveBeenCalledWith([iconUrl(icons[0])]);
    expect(ol.render.toContext).not.toHaveBeenCalled();

    await flush();

    expect(ol.render.toContext).toHaveBeenCalledOnce();
    expect(imageStyleParams[0].bitmap).toBe(true);
  });
});
