/**
## mapp.utils.svgBitmap{}

The svgToBitmap module rasterizes SVG data URLs into ImageBitmap objects for use as the `img` option of an Openlayers style Icon.

An SVG referenced as an image is not an image resource to the browser. Chrome instantiates a complete isolated SVG document for each one, with a Page, LocalFrame, and StyleEngine, and keeps it alive for the lifetime of the image resource. A canvas or ImageBitmap backed Icon instantiates no document at all.

Rasterization is queued with a concurrency limit. Rasterizing the whole variant set at once creates that many documents at once, and the collector will not keep pace.

A variant is only rasterized when it is being rendered. The feature style render requests the variant of the feature it is styling and substitutes a fallback symbol until the bitmap is available, and the legend requests the variants which it draws. The style configuration of a layer is not rasterized, as a configuration may hold thousands of variants of which only a few are ever rendered.

@module /utils/svgToBitmap
*/

/**
The bitmaps Map holds the rasterized {image, pixelRatio} entry for a data URL.

The pixelRatio the entry was rasterized at is stored with the image. An Icon must be scaled by the reciprocal to render at the size the SVG declares.
*/
const bitmaps = new Map();

/**
The pending Map holds the in flight rasterization promise for a data URL, so that a src requested from consecutive renders is only rasterized once.
*/
const pending = new Map();

/**
The failed Set holds data URLs which could not be rasterized. A failed src is not retried.
*/
const failed = new Set();

/**
Callbacks to be notified when new bitmaps become available, so that a layer can be redrawn.
*/
const listeners = new Set();

/**
The queue holds rasterization jobs which have not yet started.
*/
const queue = [];

/**
The number of variants to rasterize.

A bitmap is retained for the lifetime of the session, as is the Openlayers IconImageCache entry which is keyed on the uid of the image object. Evicting and rasterizing a variant again would create a second uid and a second permanent cache entry, so the cache is capped rather than evicted. A style with more variants than the limit renders the fallback symbol.
*/
const bitmapLimit = 256;

/**
The number of rasterizations to run at once.
*/
const concurrency = 16;

/**
The width and height to rasterize at where the SVG declares no intrinsic size.
*/
const defaultSize = 24;

let active = 0;

let cappedWarning = false;

let notifyFrame = false;

/**
@function iconBitmap

@description
The iconBitmap method returns the rasterized entry for a data URL, and requests the rasterization of a src which has not yet been rasterized.

The method is called from the feature style render and must not block. A src which is not yet available returns undefined for the caller to substitute a fallback symbol.

Only a `data:` src is rasterized. A src which is a url is a single image resource shared by every feature which references it, which is the deduplication the browser is designed for.

@param {string} src The icon url or data URL.

@returns {Object} The {image, pixelRatio} entry for the src.
*/
export function iconBitmap(src) {
  if (typeof src !== 'string') return;

  if (!src.startsWith('data:')) return;

  const entry = bitmaps.get(src);

  if (entry) return entry;

  requestBitmap(src);
}

/**
@function requestBitmap

@description
The requestBitmap method queues the rasterization of a data URL and returns the promise for the queued job.

A request must only be made for a variant which is being rendered. The bitmap cache is bounded and is not evicted, so a variant which is rasterized speculatively is held for the lifetime of the session in place of a variant which is rendered.

@param {string} src The data URL to rasterize.

@returns {Promise} The rasterization promise.
*/
export function requestBitmap(src) {
  if (typeof src !== 'string') return;

  if (!src.startsWith('data:')) return;

  if (bitmaps.has(src) || failed.has(src)) return;

  const inflight = pending.get(src);

  if (inflight) return inflight;

  if (bitmaps.size + pending.size >= bitmapLimit) {
    if (!cappedWarning) {
      cappedWarning = true;
      console.warn(
        `svgToBitmap: ${bitmapLimit} icon variants rasterized. Additional variants will render the fallback symbol. Reduce the number of icon variants in the style configuration.`,
      );
    }
    return;
  }

  const promise = new Promise((resolve) => {
    queue.push({ resolve, src });
  });

  pending.set(src, promise);

  drain();

  return promise;
}

/**
@function requestBitmaps
@async

@description
The requestBitmaps method requests the rasterization of an array of data URLs and resolves once all have been rasterized or have failed.

The method is awaited by a caller which draws the icons itself, such as the legendIcon element. The array must hold the variants which are being drawn. Requesting the variants of a style configuration would fill the bounded cache with variants which are never rendered.

@param {array} srcs An array of icon urls or data URLs.

@returns {Promise<void>}
*/
export async function requestBitmaps(srcs) {
  if (!Array.isArray(srcs)) return;

  const promises = [...new Set(srcs)].map(requestBitmap).filter(Boolean);

  if (!promises.length) return;

  await Promise.all(promises);
}

/**
@function onBitmapReady

@description
The onBitmapReady method registers a callback to be called once per animation frame in which new bitmaps became available.

@param {function} callback The method to call.
*/
export function onBitmapReady(callback) {
  typeof callback === 'function' && listeners.add(callback);
}

/**
@function bitmapUnavailable

@description
The bitmapUnavailable method returns whether a data URL will not be rasterized, either because the rasterization failed or because the bitmap limit is reached.

The caller must render the icon from the data URL src, as there is no bitmap to wait for. A src which is rasterized or in flight is not unavailable, and must render the fallback symbol until the bitmap has been drawn.

@param {string} src The icon url or data URL.

@returns {boolean} The src will not be rasterized.
*/
export function bitmapUnavailable(src) {
  if (typeof src !== 'string') return false;

  if (!src.startsWith('data:')) return false;

  if (bitmaps.has(src) || pending.has(src)) return false;

  if (failed.has(src)) return true;

  return bitmaps.size + pending.size >= bitmapLimit;
}

/**
@function bitmapStats

@description
The bitmapStats method returns the state of the bitmap cache for diagnostics.

@returns {Object} The number of rasterized, pending, and failed variants.
*/
export function bitmapStats() {
  return {
    bitmaps: bitmaps.size,
    capped: bitmaps.size + pending.size >= bitmapLimit,
    failed: failed.size,
    pending: pending.size,
  };
}

/**
@function drain

@description
The drain method starts queued rasterization jobs up to the concurrency limit.
*/
function drain() {
  while (active < concurrency && queue.length) {
    const job = queue.shift();

    active++;

    rasterize(job.src)
      .then((entry) => {
        bitmaps.set(job.src, entry);
        scheduleNotify();
      })
      .catch((error) => {
        failed.add(job.src);

        // The listeners must be notified of a failure as well as of a bitmap. A layer which rendered the fallback symbol for the src would otherwise not redraw the icon from the data URL src.
        scheduleNotify();

        console.warn('svgToBitmap: rasterization failed.', error);
      })
      .finally(() => {
        pending.delete(job.src);
        active--;
        job.resolve();
        drain();
      });
  }
}

/**
@function rasterize
@async

@description
The rasterize method draws an SVG data URL into a canvas and returns the canvas as an ImageBitmap.

The image element is not retained. The isolated SVG document the browser created for it is released with the image, since the data URL is never assigned to an Openlayers style Icon and so is never held by the IconImageCache.

@param {string} src The data URL to rasterize.

@returns {Promise<Object>} The {image, pixelRatio} entry.
*/
async function rasterize(src) {
  const image = new Image();

  image.src = src;

  await (image.decode ? image.decode() : imageLoad(image));

  const pixelRatio = globalThis.devicePixelRatio || 1;

  // The SVG source is the authority on the intrinsic dimensions. An SVG which declares no width and height has no intrinsic size as an image, and the browser reports the default 300x150 replaced element size for it, which is not the ratio the symbol is drawn at.
  const [intrinsicWidth, intrinsicHeight] = svgSize(src) || [
    image.naturalWidth,
    image.naturalHeight,
  ];

  const width = Math.max(
    1,
    Math.round((intrinsicWidth || defaultSize) * pixelRatio),
  );

  const height = Math.max(
    1,
    Math.round((intrinsicHeight || defaultSize) * pixelRatio),
  );

  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  canvas.getContext('2d').drawImage(image, 0, 0, width, height);

  if (typeof createImageBitmap === 'function') {
    try {
      // An ImageBitmap holds only the decoded pixels. Openlayers makes the same swap for the canvas of a RegularShape.
      return { image: await createImageBitmap(canvas), pixelRatio };
    } catch (error) {
      console.warn('svgToBitmap: createImageBitmap failed.', error);
    }
  }

  return { image: canvas, pixelRatio };
}

/**
@function svgSize

@description
The svgSize method returns the intrinsic dimensions declared by an SVG data URL.

The width and height attributes of the root element are read first, and the viewBox is read where the element declares no width and height. Only the ratio of the two matters to the rasterization, so a unit suffix such as `pt` is not converted.

The method returns undefined for a src which is not a percent encoded SVG document, for the caller to fall back to the dimensions the browser reports for the image.

@param {string} src The data URL to read.

@returns {array} The [width, height] the SVG declares.
*/
function svgSize(src) {
  if (!src.startsWith('data:image/svg+xml,')) return;

  let root;

  try {
    root = decodeURIComponent(src.slice(src.indexOf(',') + 1)).match(
      /<svg\b[^>]*>/,
    )?.[0];
  } catch {
    // A src which is not percent encoded is not decoded.
    return;
  }

  if (!root) return;

  const width = Number.parseFloat(
    root.match(/\bwidth\s*=\s*["']?([\d.]+)/)?.[1],
  );

  const height = Number.parseFloat(
    root.match(/\bheight\s*=\s*["']?([\d.]+)/)?.[1],
  );

  if (width > 0 && height > 0) return [width, height];

  const viewBox = root
    .match(/\bviewBox\s*=\s*["']([^"']+)["']/)?.[1]
    ?.split(/[\s,]+/)
    .map(Number);

  if (viewBox?.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) {
    return [viewBox[2], viewBox[3]];
  }
}

/**
@function imageLoad

@description
The imageLoad method resolves once the image element has loaded, for browsers without HTMLImageElement.decode.

@param {Object} image An image element.

@returns {Promise<void>}
*/
function imageLoad(image) {
  return new Promise((resolve, reject) => {
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', reject, { once: true });
  });
}

/**
@function scheduleNotify

@description
The scheduleNotify method calls the registered listeners once for the animation frame in which bitmaps became available.
*/
function scheduleNotify() {
  if (notifyFrame) return;

  // The flag must be set before the frame is requested. Assigning the return value would leave the flag set if the callback were to be called synchronously.
  notifyFrame = true;

  globalThis.requestAnimationFrame(() => {
    notifyFrame = false;
    listeners.forEach((callback) => callback());
  });
}
