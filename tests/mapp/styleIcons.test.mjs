import { describe, expect, it } from 'vitest';
import { styleIcons } from '../../apps/mapp/lib/layer/styleParser.mjs';

/**
The styleIcons method collects the icon style objects of a layer style configuration so that their variants can be rasterized before the first render.

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

    // The variant count of the profiled layer. Every category is a variant which must be rasterized.
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
