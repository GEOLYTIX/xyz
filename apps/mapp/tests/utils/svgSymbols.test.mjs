import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as svgSymbols from '../../lib/utils/svgSymbols.mjs';

const prefix = 'data:image/svg+xml,';

/**
Parses the svg data:image url returned by an svgSymbols method.
@returns {SVGSVGElement} The svg document element.
*/
function parse(dataUrl) {
  expect(dataUrl.startsWith(prefix)).toBe(true);

  const svgString = decodeURIComponent(dataUrl.slice(prefix.length));

  const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml');

  expect(doc.querySelector('parsererror')).toBeNull();

  return doc.documentElement;
}

function fills(svg, selector) {
  return [...svg.querySelectorAll(selector)].map((el) =>
    el.getAttribute('fill'),
  );
}

describe('utils/svgSymbols', () => {
  const namespace = mapp.utils.svgSymbols;

  // The module namespace is not extensible. A plain object copy holds the templates, see the BUG in svgTemplates.test.mjs.
  beforeEach(() => {
    mapp.utils.svgSymbols = { ...namespace };
  });

  afterEach(() => {
    mapp.utils.svgSymbols = namespace;
  });

  it('is assigned to mapp.utils', () => {
    expect(namespace.dot).toBe(svgSymbols.dot);
  });

  describe('dot', () => {
    it('creates a dot with the fillColor over a shadow', () => {
      const svg = parse(svgSymbols.dot({ fillColor: '#e6194b' }));

      expect(fills(svg, 'circle')).toEqual(['#333', '#e6194b']);
    });

    it('memoizes the icon by fillColor', () => {
      expect(svgSymbols.dot({ fillColor: '#123456' })).toBe(
        svgSymbols.dot({ fillColor: '#123456', other: true }),
      );

      expect(svgSymbols.dot({ fillColor: '#123456' })).not.toBe(
        svgSymbols.dot({ fillColor: '#654321' }),
      );
    });

    it('defaults to a white fill', () => {
      const svg = parse(svgSymbols.dot({}));

      expect(fills(svg, 'circle')[1]).toBe('#fff');
    });
  });

  describe('layered symbols', () => {
    const layers = { 0.5: '#f00', 0.25: '#0f0' };

    it.each([
      ['target', 'circle', ['#333', '#FFF']],
      ['square', 'rect', ['#333', '#FFF']],
      ['diamond', 'polygon', ['#333', '#FFF']],
      ['triangle', 'polygon', ['#333', '#FFF']],
      ['semiCircle', 'circle', ['#333', '#FFF']],
    ])('creates a %s with default fills', (method, selector, expected) => {
      const svg = parse(svgSymbols[method]({}));

      expect(fills(svg, selector)).toEqual(expected);
    });

    it.each([
      ['target', 'circle'],
      ['square', 'rect'],
      ['diamond', 'polygon'],
      ['triangle', 'polygon'],
      ['semiCircle', 'circle'],
    ])('creates a %s with the fillColor and layers', (method, selector) => {
      const svg = parse(svgSymbols[method]({ fillColor: '#00f', layers }));

      // The layers are added in the order of the style.layers keys.
      expect(fills(svg, selector)).toEqual(['#333', '#00f', '#f00', '#0f0']);
    });

    it('scales the target layer radius', () => {
      const svg = parse(svgSymbols.target({ layers: { 0.5: '#f00' } }));

      expect(svg.querySelectorAll('circle')[2].getAttribute('r')).toBe('5');
    });

    it('scales and centres the square layer', () => {
      const rect = parse(
        svgSymbols.square({ layers: { 0.5: '#f00' } }),
      ).querySelectorAll('rect')[2];

      expect(rect.getAttribute('width')).toBe('10');
      expect(rect.getAttribute('height')).toBe('10');
      expect(rect.getAttribute('x')).toBe('5');
      expect(rect.getAttribute('y')).toBe('5');
    });
  });

  describe('markers', () => {
    it('creates a marker with a letter', () => {
      const svg = parse(
        svgSymbols.markerLetter({ color: '#f00', letter: 'A' }),
      );

      expect(svg.querySelector('path').getAttribute('fill')).toBe('#f00');
      expect(svg.querySelector('text').textContent.trim()).toBe('A');
    });

    it('creates a marker with a dot colour', () => {
      const svg = parse(
        svgSymbols.markerColor({ colorMarker: '#f00', colorDot: '#00f' }),
      );

      expect(fills(svg, 'path')).toEqual(['#f00', '#f00']);
      expect(fills(svg, 'circle')[1]).toBe('#00f');
    });
  });

  describe('circle', () => {
    it.each([
      ['defaults', {}, '#333', '1'],
      [
        'the stroke style',
        { strokeColor: '#f00', strokeWidth: 3 },
        '#f00',
        '3',
      ],
    ])('creates a circle with %s', (_, style, stroke, width) => {
      const circle = parse(svgSymbols.circle(style)).querySelector('circle');

      expect(circle.getAttribute('stroke')).toBe(stroke);
      expect(circle.getAttribute('stroke-width')).toBe(width);
    });
  });

  describe('template', () => {
    it('returns undefined without a matching template', () => {
      expect(svgSymbols.template({ template: 'missing' })).toBeUndefined();
    });

    it('returns the template with substitutes as data url', () => {
      mapp.utils.svgSymbols.templates = {
        pin: '<svg xmlns="http://www.w3.org/2000/svg"><circle fill="$FILL" stroke="$FILL"/></svg>',
      };

      const svg = parse(
        svgSymbols.template({ template: 'pin', substitute: { $FILL: '#f00' } }),
      );

      expect(fills(svg, 'circle')).toEqual(['#f00']);
      expect(svg.querySelector('circle').getAttribute('stroke')).toBe('#f00');
    });

    it('returns the template without substitutes', () => {
      mapp.utils.svgSymbols.templates = { plain: '<svg/>' };

      expect(svgSymbols.template({ template: 'plain' })).toBe(
        `${prefix}${encodeURIComponent('<svg/>')}`,
      );
    });
  });
});
