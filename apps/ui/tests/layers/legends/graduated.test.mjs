import { describe, expect, it, vi } from 'vitest';
import { scratchListview } from '../../elements/_helpers.mjs';

/**
Assigns a graduated theme on the numeric id field as the current theme of the compare_areas layer. The id field is referenced by the distributed theme of the layer in the workspace, so the field can be requested.
*/
function graduatedTheme(theme = {}) {
  return (layers) => {
    layers.compare_areas.display = true;

    layers.compare_areas.style.themes.Graduated = {
      type: 'graduated',
      title: 'Graduated',
      field: 'id',
      graduated_breaks: 'greater_than',
      categories: [
        { value: 1, label: 'From 1', style: { fillColor: '#ff0000' } },
        { value: 3, style: { fillColor: '#0000ff' } },
      ],
      ...theme,
    };

    layers.compare_areas.style.theme = 'Graduated';
  };
}

/**
Returns the legend label element of a category.
*/
function label(layer, value) {
  return layer.style.legend.querySelector(`[data-id="${value}"] .label`);
}

describe('ui/layers/legends/graduated', () => {
  it('creates a category with an icon and label', async () => {
    const { layer } = await scratchListview(graduatedTheme());

    const legend = layer.style.legend;

    expect(layer.style.theme.filterOnly).toBe(true);
    expect(legend.querySelector('.switch-all')).not.toBeNull();
    expect(legend.querySelector('.contents-wrapper').className).toBe(
      'contents-wrapper grid',
    );

    const cats = [...legend.querySelectorAll('.contents')].map((el) => [
      el.dataset.id,
      el.querySelector('.label').textContent.trim(),
      decodeURIComponent(
        el.querySelector('.legend-icon div').style.backgroundImage,
      ).match(/fill="(#\w+)"/)[1],
    ]);

    // The value is the label of a category without a label.
    expect(cats).toEqual([
      ['1', 'From 1', '#ff0000'],
      ['3', '3', '#0000ff'],
    ]);

    await layer.loading;
  });

  it('assigns the horizontal and nowrap legend layout', async () => {
    const { layer } = await scratchListview(
      graduatedTheme({ legend: { horizontal: true, nowrap: true } }),
    );

    expect(
      layer.style.legend.querySelector('.contents-wrapper').className,
    ).toBe('contents-wrapper grid nowrap');
    expect(layer.style.legend.querySelector('.contents').classList).toContain(
      'horizontal',
    );

    await layer.loading;
  });

  it('toggles the category style with a click on the label', async () => {
    const { layer } = await scratchListview(graduatedTheme());

    await layer.loading;

    const changed = vi.spyOn(layer.L, 'changed');

    const cat = layer.style.theme.categories[0];

    const cat_style = cat.style;

    label(layer, 1).click();

    expect(label(layer, 1).classList).toContain('disabled');
    expect(cat.disabled).toBe(true);
    expect(cat.style).toBeNull();
    expect(cat._style).toMatchObject({ fillColor: '#ff0000' });

    // The theme filters the rendered features only.
    expect(layer.filter.current.id).toBeUndefined();
    expect(changed).toHaveBeenCalledOnce();

    label(layer, 1).click();

    expect(label(layer, 1).classList).not.toContain('disabled');
    expect(cat.disabled).toBeUndefined();
    expect(cat.style).toBe(cat_style);
    expect(changed).toHaveBeenCalledTimes(2);
  });

  it('draws the icon of a disabled category from the stored style', async () => {
    const { layer } = await scratchListview(graduatedTheme());

    await layer.loading;

    label(layer, 3).click();

    mapp.ui.layers.legends.graduated(layer);

    expect(label(layer, 3).classList).toContain('disabled');
    expect(
      decodeURIComponent(
        layer.style.legend.querySelector('[data-id="3"] .legend-icon div').style
          .backgroundImage,
      ),
    ).toContain('fill="#0000ff"');
  });

  it('doesn’t create a category without a value', async () => {
    const { layer } = await scratchListview(graduatedTheme());

    await layer.loading;

    // The jenks distribution assigns no value to the category of a duplicate break.
    layer.style.theme.categories.push({ style: { fillColor: '#00ff00' } });

    mapp.ui.layers.legends.graduated(layer);

    expect(layer.style.legend.querySelectorAll('.contents')).toHaveLength(2);
  });

  it('switches all categories', async () => {
    const { layer } = await scratchListview(graduatedTheme());

    await layer.loading;

    layer.style.legend.querySelector('.switch-all button').click();

    expect(
      layer.style.theme.categories.slice(0, 2).map((cat) => cat.style),
    ).toEqual([null, null]);

    layer.style.legend.querySelector('.switch-all button').click();

    expect(label(layer, 1).classList).not.toContain('disabled');
    expect(label(layer, 3).classList).not.toContain('disabled');
  });

  it('returns a pending legend for a distribution which has not been processed', () => {
    const layer = {
      style: {
        theme: { type: 'graduated', field: 'id', distribution: 'jenks' },
      },
    };

    const node = mapp.ui.layers.legends.graduated(layer);

    expect(node).toBe(layer.style.legend);
    expect(node.classList).toContain('legend');
    expect(node.children).toHaveLength(0);
    expect(layer.style.theme.legend).toBeUndefined();
  });
});
