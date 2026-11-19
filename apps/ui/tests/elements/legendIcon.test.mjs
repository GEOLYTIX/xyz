import { describe, expect, it, vi } from 'vitest';

const { legendIcon } = mapp.ui.elements;

/**
Returns the decoded background-image of an icon element.
*/
function backgroundImage(el) {
  return decodeURIComponent(el.style.backgroundImage);
}

describe('ui/elements/legendIcon', () => {
  it('creates an icon from an svgSymbols type', () => {
    const node = legendIcon({
      icon: { type: 'dot', fillColor: '#00539F' },
      width: 24,
      height: 20,
    });

    expect(node.classList).toContain('legend-icon');
    expect(node.children).toHaveLength(1);

    const icon = node.firstElementChild;

    expect(icon.style.width).toBe('24px');
    expect(icon.style.height).toBe('20px');
    expect(backgroundImage(icon)).toContain('fill="#00539F"');
  });

  it('assigns the dot type to a style without an icon type', () => {
    const style = { icon: { fillColor: '#f00' }, width: 24, height: 24 };

    legendIcon(style);

    expect(style.icon.type).toBe('dot');
  });

  it('creates an icon from an svg or url', () => {
    const svg = legendIcon({
      svg: 'https://example.com/icon.svg',
      width: 30,
      height: 30,
    }).firstElementChild;

    expect(svg.style.backgroundImage).toBe(
      'url("https://example.com/icon.svg")',
    );

    const url = legendIcon({
      icon: { url: 'https://example.com/icon.png' },
      width: 30,
      height: 30,
    }).firstElementChild;

    expect(url.style.backgroundImage).toBe(
      'url("https://example.com/icon.png")',
    );
  });

  it('warns for an icon type which is not an svgSymbol', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const icon = { type: 'unknown' };

    legendIcon({ icon, width: 24, height: 24 });

    expect(warn).toHaveBeenCalledWith(
      'legendIcon: icon has no url, the svg or template may be missing/invalid: ',
      icon,
    );
  });

  it('creates a polygon symbol for a fillColor', () => {
    const style = {
      fillColor: '#ff0000',
      strokeColor: '#000000',
      width: 24,
      height: 24,
    };

    const icon = legendIcon(style).firstElementChild;

    const image = backgroundImage(icon);

    expect(image).toContain('<rect');
    expect(image).toContain('fill="#ff0000"');
    expect(image).toContain('stroke="#000000"');
    expect(image).toContain('fill-opacity="1"');

    // The defaults are assigned to the style.
    expect(style).toMatchObject({ fillOpacity: 1, strokeWidth: 1 });
    expect(icon.style.width).toBe('24px');
  });

  it('creates a line symbol for a strokeColor without a fillColor', () => {
    const icon = legendIcon({
      strokeColor: '#00ff00',
      strokeWidth: 2,
      lineDash: '4 2',
      width: 20,
      height: 10,
    }).firstElementChild;

    const image = backgroundImage(icon);

    expect(image).toContain('<path');
    expect(image).toContain('d="M 0,5 L 10,5 10,5 20,5"');
    expect(image).toContain('stroke="#00ff00"');
    expect(image).toContain('stroke-width="2"');
    expect(image).toContain('stroke-dasharray="4 2"');
  });

  it('creates an icon and a polygon symbol for a style with an icon and a fillColor', () => {
    const node = legendIcon({
      icon: { type: 'dot' },
      fillColor: '#ff0000',
      width: 24,
      height: 24,
    });

    expect(node.children).toHaveLength(2);
  });

  it('creates an empty icon for a style without an icon, fill or stroke', () => {
    expect(legendIcon({}).children).toHaveLength(0);
  });

  it('draws the layered icons of an icon array on a canvas', async () => {
    const style = {
      icon: [
        { type: 'dot', fillColor: '#ff0000', legendScale: 2 },
        { type: 'dot', fillColor: '#0000ff', scale: 0.5 },
      ],
      width: 30,
      height: 30,
    };

    const canvas = legendIcon(style).firstElementChild;

    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(canvas.width).toBe(30);
    expect(canvas.height).toBe(30);

    // Each icon is assigned an Openlayers style for the legend with the scale of the first icon.
    expect(style.icon[0].legendStyle.getImage().getScale()).toBe(2);
    expect(style.icon[1].legendStyle.getImage().getScale()).toBe(1);

    // The icons are drawn when the images have been loaded.
    await vi.waitFor(() => {
      const [r, g, b, a] = canvas
        .getContext('2d')
        .getImageData(15, 15, 1, 1).data;

      // The second icon is drawn on top of the first.
      expect(a).toBeGreaterThan(0);
      expect(b).toBeGreaterThan(r);
      expect(g).toBe(0);
    });
  });

  it('warns for an icon in an icon array without a url', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const icon = { type: 'unknown' };

    legendIcon({ icon: [icon], width: 10, height: 10 });

    expect(warn).toHaveBeenCalledWith(
      'legendIcon: icon has no url, the svg or template may be missing/invalid: ',
      icon,
    );
    expect(icon.legendStyle).toBeUndefined();
  });
});
