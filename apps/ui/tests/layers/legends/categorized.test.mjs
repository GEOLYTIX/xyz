import { describe, expect, it } from 'vitest';
import { layersListview } from '../../helpers.mjs';

/**
Returns the legend label element of a category.
*/
function label(layer, cat) {
  return layer.style.legend.querySelector(`[data-id="${cat}"] .label`);
}

/**
Returns the retailer values of the layer source features.
*/
function retailers(layer) {
  return new Set(layer.source.getFeatures().map((F) => F.get('retailer')));
}

describe('ui/layers/legends/categorized', () => {
  it('creates a category with the count of the features in the viewport', async () => {
    const { layer } = await layersListview();

    const counts = layer.featureFields.retailer;

    const labels = [...layer.style.legend.querySelectorAll('.contents')].map(
      (el) => [el.dataset.id, el.querySelector('.label').textContent.trim()],
    );

    expect(labels).toEqual([
      ['Aldi', `Aldi [${counts.Aldi}]`],
      ['Lidl', `Lidl [${counts.Lidl}]`],
      // The category has a label.
      ['Sainsburys', `Sainsbury's [${counts.Sainsburys}]`],
      ['Tesco', `Tesco [${counts.Tesco}]`],
      ['Waitrose', `Waitrose [${counts.Waitrose}]`],
      ['cluster', 'Multiple locations'],
    ]);

    expect(counts.Tesco).toBeGreaterThan(0);

    // The counts are from the features in the source.
    expect(counts.Tesco).toBe(
      layer.source.getFeatures().filter((F) => F.get('retailer') === 'Tesco')
        .length,
    );
  });

  it('creates an icon with the category style', async () => {
    const { layer } = await layersListview();

    const icon = layer.style.legend.querySelector(
      '[data-id=Tesco] .legend-icon div',
    );

    expect(icon.style.width).toBe('24px');
    expect(decodeURIComponent(icon.style.backgroundImage)).toContain(
      'fill="#00539F"',
    );
  });

  it('does not create a category without features', async () => {
    const { layer } = await layersListview((layers) => {
      layers.retail_points.style.themes.retailer.cat.Netto = {
        icon: { type: 'dot', fillColor: '#FFE500' },
      };
    });

    expect(
      layer.style.theme.categories.some((cat) => cat.value === 'Netto'),
    ).toBe(true);

    expect(layer.style.legend.querySelector('[data-id=Netto]')).toBeNull();
  });

  it('filters a category from the layer with a click on the label', async () => {
    const { layer } = await layersListview();

    expect(retailers(layer)).toContain('Lidl');

    label(layer, 'Lidl').click();

    expect(layer.filter.current.retailer).toEqual({ ni: ['Lidl'] });

    await layer.loading;

    expect(retailers(layer)).not.toContain('Lidl');
    expect(retailers(layer)).toContain('Tesco');

    // The legend is drawn again from the reloaded data with the disabled category.
    expect(label(layer, 'Lidl').classList).toContain('disabled');
    expect(label(layer, 'Lidl').textContent.trim()).toBe('Lidl');

    label(layer, 'Lidl').click();

    expect(layer.filter.current.retailer).toBeUndefined();

    await layer.loading;

    expect(retailers(layer)).toContain('Lidl');
    expect(label(layer, 'Lidl').classList).not.toContain('disabled');
  });

  it('switches all categories', async () => {
    const { layer } = await layersListview();

    layer.style.legend.querySelector('.switch-all button').click();

    expect(layer.filter.current.retailer.ni).toEqual([
      'Aldi',
      'Lidl',
      'Sainsburys',
      'Tesco',
      'Waitrose',
    ]);

    await layer.loading;

    expect(retailers(layer)).not.toContain('Tesco');

    // Retailers without a category are not filtered.
    expect(retailers(layer)).toContain('Asda');

    layer.style.legend.querySelector('.switch-all button').click();

    expect(layer.filter.current.retailer).toBeUndefined();

    await layer.loading;

    expect(retailers(layer)).toContain('Tesco');
  });
});
