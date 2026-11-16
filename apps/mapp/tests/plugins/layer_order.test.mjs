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

  it('keeps the relative order of the referenced layers', () => {
    const mv = mapview(['b', 'a']);

    // Both keys are first in the layer_order, so their order is kept.
    layer_order(['a', 'b'], mv);

    expect(keys(mv)).toEqual(['a', 'b']);
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

  // https://github.com/GEOLYTIX/xyz/issues/3083: layers are added in the order of
  // the locale.layers array, each with an increasing zIndex, so a layer later in
  // the array is drawn on top. A key which is not in the layer_order returns -1
  // from indexOf, which sorts it to the front of the array, so it is drawn at the
  // bottom. The module documents that unreferenced layers are on top.
  it.fails('sorts the layers without a plugin key on top', () => {
    const mv = mapview(['a', 'x', 'b']);

    layer_order(['a', 'b'], mv);

    // The unreferenced x layer should be last, so it is drawn on top.
    expect(keys(mv)).toEqual(['a', 'b', 'x']);
  });

  // https://github.com/GEOLYTIX/xyz/issues/3083: the guard optional chains the
  // mapview and locale, but not the layers array, so the sort throws when a
  // locale has no layers.
  it.fails('does not throw when the locale has no layers', () => {
    expect(() => layer_order(['a'], { locale: {} })).not.toThrow();
  });
});
