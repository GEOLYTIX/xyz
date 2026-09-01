import { beforeEach, describe, expect, it, vi } from 'vitest';
import styleParser, {
  styleIcons,
} from '../../../mapp/lib/layer/styleParser.mjs';

/**
The styleIcons method collects the icon style objects of a layer style configuration, which the styleParser uses to establish whether the layer must be redrawn as icon bitmaps become available.

The layer style configuration is JSON, but the styleParser assigns self references between the style, theme, themes, and label objects. The walk must terminate on those and must not descend into anything which is not a plain configuration object.
*/
describe('styleIcons', () => {
  it('collects icons from the default, highlight, and cluster styles', () => {
    const style = {
      cluster: { icon: { type: 'target' } },
      default: { icon: { type: 'dot' } },
      highlight: { icon: { type: 'dot' } },
    };

    expect(styleIcons(style)).toHaveLength(3);
  });

  it('collects an icon array as separate icons', () => {
    const style = {
      default: { icon: [{ type: 'dot' }, { type: 'square' }] },
    };

    expect(styleIcons(style)).toHaveLength(2);
  });

  it('collects icons from every theme category', () => {
    const style = {
      theme: {
        categories: Array.from({ length: 430 }, (_, index) => ({
          style: { icon: { substitute: { COLOUR: `#${index}` } } },
        })),
        type: 'categorized',
      },
    };

    // The variant count of the profiled layer. Every category is a variant which may be rendered.
    expect(styleIcons(style)).toHaveLength(430);
  });

  it('terminates on the self references the styleParser assigns', () => {
    const theme = { categories: [{ style: { icon: { type: 'dot' } } }] };
    const style = { theme, themes: { one: theme } };

    // theme and themes.one are the same object. Without the visited check the walk would not terminate on a cycle.
    theme.self = theme;
    style.style = style;

    expect(styleIcons(style)).toHaveLength(1);
  });

  it('does not descend into objects which are not plain configuration objects', () => {
    class OlLayer {
      constructor() {
        this.icon = { type: 'dot' };
      }
    }

    const style = { default: { icon: { type: 'dot' } }, L: new OlLayer() };

    // A style property may hold a DOM node or an Openlayers object. Walking one would traverse the whole map.
    expect(styleIcons(style)).toHaveLength(1);
  });

  it('returns an empty array for a style without icons', () => {
    expect(styleIcons({ default: { fillColor: '#fff' } })).toEqual([]);
    expect(styleIcons({})).toEqual([]);
  });
});

/**
The redrawStyleIcons method registers a callback with the svgToBitmap module to redraw the layer as icon bitmaps become available.

The callback holds the layer, and the svgToBitmap listeners are held for the lifetime of the session. What these tests establish is that the registration is revoked as the layer is removed, and that a layer which is decorated again is not registered twice: a retained callback holds the layer, its mapview, and every feature of both.
*/
describe('redrawStyleIcons', () => {
  const listeners = new Set();

  beforeEach(() => {
    listeners.clear();

    vi.stubGlobal('mapp', {
      layer: { featureHover: () => {} },
      utils: {
        svgBitmap: {
          onBitmapReady: (callback) => {
            listeners.add(callback);
            return () => listeners.delete(callback);
          },
        },
      },
    });
  });

  /**
  Stands in for the layer the decorator passes to the format method, which calls the styleParser. The removeCallbacks array is assigned by the decorator after the format method has returned, so the styleParser must create it.
  */
  function testLayer() {
    return {
      key: 'test',
      style: { bitmap_icons: true, default: { icon: { type: 'dot' } } },
    };
  }

  it('registers a redraw callback for a layer with the bitmap_icons flag', () => {
    styleParser(testLayer());

    expect(listeners.size).toBe(1);
  });

  it('does not register a callback without the bitmap_icons flag', () => {
    const layer = testLayer();
    delete layer.style.bitmap_icons;

    styleParser(layer);

    expect(listeners.size).toBe(0);
  });

  it('does not register a callback for a style without icons', () => {
    const layer = testLayer();
    layer.style.default = { fillColor: '#fff' };

    styleParser(layer);

    expect(listeners.size).toBe(0);
  });

  it('removes the callback as the layer is removed', () => {
    const layer = testLayer();

    styleParser(layer);

    expect(listeners.size).toBe(1);

    // The layer.remove method calls the removeCallbacks with the layer.
    layer.removeCallbacks.forEach((fn) => fn(layer));

    expect(listeners.size).toBe(0);
    expect(layer.offBitmapReady).toBeUndefined();
  });

  it('does not register a callback twice for a layer which is parsed again', () => {
    const layer = testLayer();

    styleParser(layer);
    styleParser(layer);

    expect(listeners.size).toBe(1);

    // The remove callback removes whichever registration is current, so a second is not pushed.
    expect(layer.removeCallbacks).toHaveLength(1);

    layer.removeCallbacks.forEach((fn) => fn(layer));

    expect(listeners.size).toBe(0);
  });
});
