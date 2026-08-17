import { beforeAll, describe, expect, it, vi } from 'vitest';

/**
The svgToBitmap module rasterizes SVG data URLs into ImageBitmap objects. The browser APIs it uses are stubbed: an Image which resolves decode, a canvas which records nothing, and a createImageBitmap which returns the canvas dimensions.

What the tests establish is the behaviour that keeps the isolated SVG documents from coming back: only data URLs are rasterized, a src is rasterized once however often it is requested, a failure is not retried, and the variant count is capped rather than evicted.
*/
let svgToBitmap;

let imagesCreated = 0;
let failSrc;

const pixelRatio = 2;

class FakeImage {
  set src(value) {
    this.src_ = value;
    imagesCreated++;
  }

  get naturalWidth() {
    return 24;
  }

  get naturalHeight() {
    return 24;
  }

  decode() {
    return this.src_ === failSrc
      ? Promise.reject(new Error('decode failed'))
      : Promise.resolve();
  }
}

beforeAll(async () => {
  vi.stubGlobal('Image', FakeImage);
  vi.stubGlobal('devicePixelRatio', pixelRatio);

  vi.stubGlobal('document', {
    createElement: () => ({
      getContext: () => ({ drawImage: () => {} }),
      height: 0,
      width: 0,
    }),
  });

  vi.stubGlobal('createImageBitmap', async (canvas) => ({
    height: canvas.height,
    width: canvas.width,
  }));

  // The module notifies listeners once per animation frame.
  vi.stubGlobal('requestAnimationFrame', (callback) => {
    callback();
    return 1;
  });

  svgToBitmap = await import('../../apps/mapp/lib/utils/svgToBitmap.mjs');
});

function testSrc(id) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg id="${id}"/>`)}`;
}

describe('svgToBitmap rasterization', () => {
  it('rasterizes a data url at the device pixel ratio', async () => {
    const src = testSrc('rasterize');

    // The first read misses and requests the rasterization.
    expect(svgToBitmap.iconBitmap(src)).toBeUndefined();

    await svgToBitmap.prewarm([src]);

    const entry = svgToBitmap.iconBitmap(src);

    expect(entry.pixelRatio).toBe(pixelRatio);
    expect(entry.image.width).toBe(24 * pixelRatio);
    expect(entry.image.height).toBe(24 * pixelRatio);
  });

  it('rasterizes a src once however often it is requested', async () => {
    const src = testSrc('once');
    const before = imagesCreated;

    // Consecutive renders read the same src before the first rasterization resolves.
    svgToBitmap.iconBitmap(src);
    svgToBitmap.iconBitmap(src);
    svgToBitmap.requestBitmap(src);

    await svgToBitmap.prewarm([src, src]);

    svgToBitmap.iconBitmap(src);

    expect(imagesCreated - before).toBe(1);
  });

  it('does not rasterize a url', async () => {
    const before = imagesCreated;
    const url = 'https://geolytix.github.io/MapIcons/poi/train_icon.svg';

    // A url is a single image resource shared by every feature which references it.
    expect(svgToBitmap.iconBitmap(url)).toBeUndefined();
    expect(svgToBitmap.requestBitmap(url)).toBeUndefined();

    await svgToBitmap.prewarm([url]);

    expect(imagesCreated).toBe(before);
  });

  it('does not retry a failed src', async () => {
    const src = testSrc('fails');
    failSrc = src;

    await svgToBitmap.prewarm([src]);

    expect(svgToBitmap.iconBitmap(src)).toBeUndefined();
    expect(svgToBitmap.bitmapStats().failed).toBeGreaterThan(0);

    const before = imagesCreated;

    svgToBitmap.iconBitmap(src);
    await svgToBitmap.prewarm([src]);

    expect(imagesCreated).toBe(before);

    failSrc = undefined;
  });

  it('notifies listeners when bitmaps become available', async () => {
    const listener = vi.fn();

    svgToBitmap.onBitmapReady(listener);

    await svgToBitmap.prewarm([testSrc('notify')]);

    expect(listener).toHaveBeenCalled();
  });

  it('ignores a nullish or non string src', async () => {
    expect(svgToBitmap.iconBitmap(undefined)).toBeUndefined();
    expect(svgToBitmap.iconBitmap(null)).toBeUndefined();
    expect(svgToBitmap.requestBitmap({})).toBeUndefined();
    await expect(svgToBitmap.prewarm(undefined)).resolves.toBeUndefined();
  });

  it('caps the number of variants rather than evicting them', async () => {
    // A bitmap is retained by the Openlayers IconImageCache under the uid of the image object. Evicting and rasterizing a variant again would create a second permanent cache entry, so the cache is capped.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const srcs = Array.from({ length: 400 }, (_, index) =>
      testSrc(`cap${index}`),
    );

    await svgToBitmap.prewarm(srcs);

    const stats = svgToBitmap.bitmapStats();

    expect(stats.capped).toBe(true);
    expect(stats.bitmaps).toBeLessThan(srcs.length);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('icon variants'));

    warn.mockRestore();
  });
});
