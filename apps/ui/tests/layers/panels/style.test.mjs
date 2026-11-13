import { describe, expect, it } from 'vitest';
import { layersListview } from '../../helpers.mjs';

describe('ui/layers/panels/style', () => {
  it('creates the style drawer with the style elements in the default order', async () => {
    const { layer } = await layersListview();

    const drawer = layer.view.querySelector('[data-id=style-drawer]');

    expect(layer.style.drawer).toBe(drawer);
    expect(drawer.querySelector('.header h3').textContent).toBe('Style');
    expect(drawer.classList).toContain('disable-on-hide');
    expect(layer.style.view.parentElement).toBe(
      drawer.querySelector('.content'),
    );

    expect(
      [...layer.style.view.children].map(
        (el) => el.dataset.id || el.firstElementChild.dataset.id,
      ),
    ).toEqual([
      'labelCheckbox-retail_points',
      'hoverCheckbox-retail_points',
      'layerTheme',
      'iconScalingSlider',
    ]);
  });

  it('does not create a drawer for a hidden style', async () => {
    const { layer } = await layersListview((layers) => {
      layers.retail_points.style.hidden = true;
    });

    expect(layer.view.querySelector('[data-id=style-drawer]')).toBeNull();
    expect(layer.style.legend).toBeUndefined();
  });

  it('creates the configured style elements only', async () => {
    const { layer } = await layersListview((layers) => {
      layers.retail_points.style.elements = ['theme', 'hover'];
    });

    expect([...layer.style.view.children].map((el) => el.dataset.id)).toEqual([
      'layerTheme',
      'hoverCheckbox-retail_points',
    ]);
  });

  it('adds the style.classList to the drawer', async () => {
    const { layer } = await layersListview((layers) => {
      layers.retail_points.style.classList = 'retail-style';
    });

    expect(layer.style.drawer.classList).toContain('retail-style');
  });

  it('disables the drawer with the layer display', async () => {
    const { layer } = await layersListview();

    layer.style.drawer.classList.add('expanded');

    layer.hide();

    expect(layer.style.drawer.classList).toContain('disabled');
    expect(layer.style.drawer.classList).not.toContain('expanded');

    layer.show();

    await layer.loading;

    expect(layer.style.drawer.classList).not.toContain('disabled');
  });

  it('toggles the label and hover display with the checkboxes', async () => {
    const { layer } = await layersListview();

    const labelInput = layer.view.querySelector(
      '[data-id=labelCheckbox-retail_points] input',
    );

    const hoverInput = layer.view.querySelector(
      '[data-id=hoverCheckbox-retail_points] input',
    );

    expect(labelInput.checked).toBe(true);
    expect(hoverInput.checked).toBe(true);

    hoverInput.click();

    expect(layer.style.hover.display).toBe(false);

    labelInput.click();

    expect(layer.style.label.display).toBe(false);

    // The label checkbox reloads the layer.
    await layer.loading;
  });
});
