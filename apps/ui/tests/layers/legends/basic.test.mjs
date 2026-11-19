import { describe, expect, it } from 'vitest';
import { scratchListview, selectOption } from '../../elements/_helpers.mjs';

describe('ui/layers/legends/basic', () => {
  it('creates a legend with the theme style and label', async () => {
    const { layer } = await scratchListview((layers) => {
      layers.compare_areas.style.theme = 'Boundary Only';
      layers.compare_areas.style.themes['Boundary Only'].label = 'Boundary';
    });

    const contents = layer.style.legend.querySelectorAll('.contents');

    expect(contents).toHaveLength(1);
    expect(contents[0].querySelector('.label').textContent).toBe('Boundary');

    // The Boundary Only theme style has a strokeColor without a fillColor.
    const icon = contents[0].querySelector('.legend-icon div');

    expect(icon.style.width).toBe('24px');
    expect(decodeURIComponent(icon.style.backgroundImage)).toContain(
      'stroke="#000"',
    );
  });

  it('draws the legend for the basic theme selected in the themes dropdown', async () => {
    const { layer } = await scratchListview((layers) => {
      layers.compare_areas.display = true;
    });

    const legend = layer.style.legend;

    selectOption(
      layer.view.querySelector('[data-id=themesDropdown]'),
      'Boundary Only',
    );

    // The theme method creates a new legend node.
    expect(layer.style.legend).not.toBe(legend);
    expect(layer.style.legend.querySelectorAll('.contents')).toHaveLength(1);

    await layer.loading;
  });

  it('assigns the legend node to a layer without a legend', () => {
    const layer = {
      style: { theme: { label: 'Area', style: { fillColor: '#ff0000' } } },
    };

    const node = mapp.ui.layers.legends.basic(layer);

    expect(layer.style.legend).toBe(node);
    expect(layer.style.theme.legend.node).toBe(node);
    expect(layer.style.theme.style).toMatchObject({ width: 24, height: 24 });
    expect(
      node.querySelector('.contents-wrapper.grid .label').textContent,
    ).toBe('Area');
  });

  it('creates a legend for a theme without a style', () => {
    const layer = { style: { theme: { label: 'Area' } } };

    mapp.ui.layers.legends.basic(layer);

    expect(layer.style.theme.style).toEqual({ width: 24, height: 24 });
    expect(
      layer.style.legend.querySelector('.legend-icon').children,
    ).toHaveLength(0);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3142: a stray semicolon after the style attribute of the label element is parsed as an attribute with the name ';'.
  it.fails(
    'creates a label element with the class and style attributes only',
    () => {
      const layer = { style: { theme: { label: 'Area' } } };

      mapp.ui.layers.legends.basic(layer);

      expect(
        layer.style.legend.querySelector('.label').getAttributeNames(),
      ).toEqual(['class', 'style']);
    },
  );
});
