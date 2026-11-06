import { describe, expect, it } from 'vitest';
import basic from '../../../lib/layer/themes/basic.mjs';

describe('layer/themes/basic', () => {
  it('spreads the theme style into the feature style', () => {
    const feature = { style: { strokeColor: '#333', scale: 2 } };

    basic({ style: { strokeColor: '#f00', fillColor: '#0f0' } }, feature);

    expect(feature.style).toEqual({
      strokeColor: '#f00',
      fillColor: '#0f0',
      scale: 2,
    });
  });

  it('creates a feature style from the theme style', () => {
    const feature = {};

    basic({ style: { fillColor: '#00f' } }, feature);

    expect(feature.style).toEqual({ fillColor: '#00f' });
  });

  it('keeps the feature style without a theme style', () => {
    const feature = { style: { fillColor: '#999' } };

    basic({}, feature);

    expect(feature.style).toEqual({ fillColor: '#999' });
  });
});
