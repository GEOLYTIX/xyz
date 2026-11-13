import { describe, expect, it } from 'vitest';
import olStyle from '../../lib/utils/olStyle.mjs';

const svg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';

describe('utils/olStyle', () => {
  it('returns null without a style', () => {
    expect(olStyle(null)).toBeNull();
  });

  it('creates a fill and stroke style', () => {
    const [style] = olStyle({
      fillColor: '#ff0000',
      fillOpacity: 0.5,
      strokeColor: '#00ff00',
      strokeWidth: '3',
      lineDash: [5, 4],
      zIndex: 2,
    });

    expect(style.getFill().getColor()).toBe(mapp.utils.hexa('#ff0000', 0.5));
    expect(style.getStroke().getColor()).toBe(mapp.utils.hexa('#00ff00'));
    expect(style.getStroke().getWidth()).toBe(3);
    expect(style.getStroke().getLineDash()).toEqual([5, 4]);
    expect(style.getZIndex()).toBe(2);
  });

  it('creates a stroke without fill and a default stroke width', () => {
    const [style] = olStyle({ strokeColor: '#333' });

    expect(style.getFill()).toBeFalsy();
    expect(style.getStroke().getWidth()).toBe(1);
  });

  it('creates a fill without stroke', () => {
    const [style] = olStyle({ fillColor: '#333' });

    expect(style.getStroke()).toBeFalsy();
    expect(style.getFill()).toBeTruthy();
  });

  it('creates an icon style with the scale of the style factors', () => {
    const [style] = olStyle({
      icon: { url: svg, scale: 2, anchor: [0.5, 1] },
      scale: 2,
      clusterScale: 1.5,
      fieldScale: 2,
      zoomInScale: 1,
      zoomOutScale: 0.5,
      highlightScale: 2,
    });

    const icon = style.getImage();

    expect(icon).toBeInstanceOf(ol.style.Icon);
    expect(icon.getScale()).toBe(2 * 2 * 1.5 * 2 * 0.5 * 2);
    expect(icon.getSrc()).toBe(svg);
  });

  it('creates an icon url from the svg source', () => {
    const icon = { svg };

    olStyle({ icon });

    expect(icon.url).toBe(svg);
  });

  it('creates a dot icon url from the svgSymbols', () => {
    const icon = { fillColor: '#f00' };

    const [style] = olStyle({ icon });

    expect(icon.url).toBe(mapp.utils.svgSymbols.dot({ fillColor: '#f00' }));
    expect(style.getImage().getScale()).toBe(1);
  });

  it('creates an icon style for each icon in an icon array', () => {
    const Styles = olStyle({
      icon: [
        { url: svg, scale: 1 },
        { url: svg, scale: 3 },
      ],
    });

    expect(Styles.map((style) => style.getImage().getScale())).toEqual([1, 3]);
  });

  it('creates a style for each style in a style array', () => {
    const Styles = olStyle([
      { fillColor: '#f00' },
      { strokeColor: '#00f' },
      { icon: { url: svg } },
    ]);

    expect(Styles).toHaveLength(3);
  });

  it('creates a label text style', () => {
    const [style] = olStyle({
      label: {
        text: 42,
        fillColor: '#f00',
        font: '14px serif',
        offsetX: 2,
        offsetY: 4,
        strokeColor: '#fff',
        strokeWidth: 3,
      },
    });

    const text = style.getText();

    expect(text.getText()).toBe('42');
    expect(text.getFill().getColor()).toBe('#f00');
    expect(text.getFont()).toBe('14px serif');
    expect(text.getOffsetX()).toBe(2);
    expect(text.getOffsetY()).toBe(4);
    expect(text.getStroke().getWidth()).toBe(3);
  });

  it('creates a label with default fill and font', () => {
    const [style] = olStyle({ label: { text: '' } });

    const text = style.getText();

    expect(text.getText()).toBe('');
    expect(text.getFill().getColor()).toBe('#000');
    expect(text.getFont()).toBe('12px sans-serif');
    expect(text.getStroke()).toBeFalsy();
  });

  it('does not create a label without text', () => {
    expect(olStyle({ label: { field: 'name' } })).toEqual([]);
  });

  it('caches the Styles on the feature', () => {
    const feature = new ol.Feature();

    const Styles = olStyle({ fillColor: '#f00' }, feature);

    expect(feature.get('Styles')).toBe(Styles);
  });
});
