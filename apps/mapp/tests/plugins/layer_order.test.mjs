import { describe, expect, it } from 'vitest';
import { layer_order } from '../../lib/plugins/layer_order.mjs';

/**
Returns a mapview stub with a locale.layers array of the given keys.
*/
function mapview(keys) {
  return { locale: { layers: keys.map((key) => ({ key })) } };
}

/**
Returns the layer keys of a mapview stub in their array order.
*/
function keys(mv) {
  return mv.locale.layers.map((layer) => layer.key);
}

describe('plugins/layer_order', () => {
  it('sorts the layers into the plugin order', () => {
    const mv = mapview(['c', 'a', 'b']);

    layer_order(['a', 'b', 'c'], mv);

    expect(keys(mv)).toEqual(['a', 'b', 'c']);
  });

  it('keeps the original order of the unreferenced layers', () => {
    const mv = mapview(['y', 'b', 'x', 'a', 'z']);

    layer_order(['a', 'b'], mv);

    // The referenced layers follow the plugin order, the unreferenced layers
    // follow in their original order.
    expect(keys(mv)).toEqual(['a', 'b', 'y', 'x', 'z']);
  });

  it('does not sort when the plugin is not an array', () => {
    const mv = mapview(['c', 'a', 'b']);

    layer_order('a,b,c', mv);

    expect(keys(mv)).toEqual(['c', 'a', 'b']);
  });

  it('does not throw without a mapview or locale', () => {
    // The mapview and locale are optional chained.
    expect(() => layer_order(['a'], undefined)).not.toThrow();
    expect(() => layer_order(['a'], {})).not.toThrow();
  });

  // https://github.com/GEOLYTIX/xyz/issues/3083: an unreferenced key returned -1
  // from indexOf, which sorted the layer to the front of the array, so it was
  // drawn at the bottom. Fixed by sorting unreferenced keys to the end.
  it('sorts the layers without a plugin key on top', () => {
    const mv = mapview(['a', 'x', 'b']);

    layer_order(['a', 'b'], mv);

    // The unreferenced x layer should be last, so it is drawn on top.
    expect(keys(mv)).toEqual(['a', 'b', 'x']);
  });

  // https://github.com/GEOLYTIX/xyz/issues/3083: the guard optional chained the
  // mapview and locale, but not the layers array, so the sort threw when a
  // locale had no layers. Fixed by extending the optional chain to the layers.
  it('does not throw when the locale has no layers', () => {
    expect(() => layer_order(['a'], { locale: {} })).not.toThrow();
  });
});
