import { describe, expect, it, vi } from 'vitest';
import { changeEnd, layersListview } from '../helpers.mjs';
import { optionTitles, selectOption } from './_helpers.mjs';

const { layerStyle } = mapp.ui.elements;

/**
Assigns a value to the range input of a slider and dispatches the input event, like a user moving the slider.
*/
function slide(layer, id, value) {
  const input = layer.style.view.querySelector(
    `[data-id=${id}] input[type=range]`,
  );

  input.value = value;

  input.dispatchEvent(new Event('input'));
}

/**
Configures the retail_points layer with hovers and labels.
*/
function hoversAndLabels(layers) {
  const style = layers.retail_points.style;

  delete style.hover;
  delete style.label;

  style.hovers = {
    store: { title: 'Store name', field: 'store_name', display: true },
    postcode: { title: 'Postcode', field: 'postcode' },
    hidden: { field: 'town', hidden: true },
  };

  style.labels = {
    count: { title: 'Cluster Count', count: true, display: true },
    name: { title: 'Store name', field: 'store_name' },
    zoomed: { title: 'Zoomed', field: 'town', maxZoom: 12 },
  };
}

describe('ui/elements/layerStyle', () => {
  it('returns undefined for a layer without a style', () => {
    expect(layerStyle.panel({})).toBeUndefined();
  });

  it('returns undefined for a style without elements', () => {
    expect(
      layerStyle.panel({ style: { elements: ['unknown', 'default'] } }),
    ).toBeUndefined();
  });

  it('creates a dropdown to switch the hover', async () => {
    const { layer } = await layersListview(hoversAndLabels);

    const dropdown = layer.style.view.querySelector(
      '[data-id=hoversDropdown-retail_points]',
    );

    // The hidden hover is not an option.
    expect(optionTitles(dropdown)).toEqual(['Store name', 'Postcode']);

    expect(
      layer.view
        .querySelector('[data-id=hoverCheckbox-retail_points]')
        .textContent.trim(),
    ).toBe(mapp.dictionary.layer_style_display_hover);

    selectOption(dropdown, 'Postcode');

    expect(layer.style.hover).toBe(layer.style.hovers.postcode);
    expect(layer.style.hover.method).toBe(mapp.layer.featureHover);

    // The display of the current hover is retained.
    expect(layer.style.hover.display).toBe(true);
  });

  it('creates a dropdown to switch the label', async () => {
    const { layer } = await layersListview(hoversAndLabels);

    const dropdown = layer.style.view.querySelector('[data-id=labelsDropdown]');

    expect(optionTitles(dropdown)).toEqual([
      'Cluster Count',
      'Store name',
      'Zoomed',
    ]);

    const chkbox = layer.style.labelCheckbox;

    expect(chkbox.textContent.trim()).toBe(
      mapp.dictionary.layer_style_display_labels,
    );

    selectOption(dropdown, 'Store name');

    expect(layer.style.label).toBe(layer.style.labels.name);
    expect(layer.style.label.display).toBe(true);
    expect(chkbox.classList).not.toContain('disabled');

    await layer.loading;

    // The label checkbox is disabled for a label which is not shown at the current zoom.
    selectOption(dropdown, 'Zoomed');

    expect(chkbox.classList).toContain('disabled');

    await layer.loading;
  });

  it('disables the label checkbox outside the label zoom range', async () => {
    const { layer, mapview } = await layersListview((layers) => {
      layers.retail_points.style.label.minZoom = 13.5;
    });

    const chkbox = layer.style.labelCheckbox;

    // The zoom range is checked with the mapview changeEnd.
    expect(chkbox.classList).not.toContain('disabled');

    let end = changeEnd(mapview);

    mapview.Map.getView().setZoom(12.5);

    await end;

    expect(chkbox.classList).toContain('disabled');

    end = changeEnd(mapview);

    mapview.Map.getView().setZoom(14);

    await end;

    expect(chkbox.classList).not.toContain('disabled');

    await layer.loading;
  });

  it('returns the label checkbox which has been created', async () => {
    const { layer } = await layersListview();

    expect(layerStyle.label(layer)).toBe(layer.style.labelCheckbox);
  });

  it.each([
    ['hover', 'hoverCheckbox-retail_points'],
    ['label', 'labelCheckbox-retail_points'],
  ])('doesn’t create a checkbox for a hidden %s', async (key, id) => {
    const { layer } = await layersListview((layers) => {
      layers.retail_points.style[key].hidden = true;
    });

    expect(layer.view.querySelector(`[data-id=${id}]`)).toBeNull();
  });

  it('shows the theme meta', async () => {
    const { layer } = await layersListview((layers) => {
      layers.retail_points.style.themes.retailer.meta = 'Stores by retailer';
    });

    expect(layer.style.theme.meta_node.textContent).toBe('Stores by retailer');
    expect(layer.style.view.querySelector('[data-id=layerTheme] > p')).toBe(
      layer.style.theme.meta_node,
    );
  });

  it('switches the theme and recreates the style panel', async () => {
    const { layer } = await layersListview((layers) => {
      hoversAndLabels(layers);

      layers.retail_points.style.themes.basic = {
        title: 'All stores',
        type: 'basic',
        label: 'Store',
        setLabel: 'name',
        setHover: 'postcode',
        style: { icon: { type: 'dot', fillColor: '#ff0000' } },
      };
    });

    const drawer = layer.view.querySelector('[data-id=style-drawer]');

    const dropdown = drawer.querySelector('[data-id=themesDropdown]');

    expect(optionTitles(dropdown)).toEqual(['Retailer', 'All stores']);

    // The legend of the categorized theme.
    expect(layer.style.legend.querySelector('[data-id=Tesco]')).not.toBeNull();

    selectOption(dropdown, 'All stores');

    expect(layer.style.theme).toBe(layer.style.themes.basic);

    // The theme assigns its label and hover.
    expect(layer.style.label).toBe(layer.style.labels.name);
    expect(layer.style.hover).toBe(layer.style.hovers.postcode);
    expect(layer.style.hover.method).toBe(mapp.layer.featureHover);

    // The children of the style drawer are replaced with the style panel for the theme.
    expect(drawer.contains(layer.style.legend)).toBe(true);
    expect(layer.style.legend.querySelector('[data-id=Tesco]')).toBeNull();
    expect(layer.style.legend.querySelector('.label').textContent).toBe(
      'Store',
    );

    // The drawLegend method is registered once.
    expect(
      layer.showCallbacks.filter((fn) => fn === mapp.ui.layers.drawLegend),
    ).toHaveLength(1);

    await layer.loading;
  });

  it('switches the theme of a style panel without a style drawer', async () => {
    const { layer } = await layersListview((layers) => {
      layers.retail_points.style.themes.basic = {
        title: 'All stores',
        type: 'basic',
        style: { icon: { type: 'dot' } },
      };
    });

    // A location layer entry has a style.panel instead of the style drawer.
    layer.style.panel = mapp.utils.html.node`<div>`;

    // The themes method returns a template.
    const dropdown = document.createElement('div');

    mapp.utils.render(dropdown, layerStyle.themes(layer));

    selectOption(dropdown, 'All stores');

    expect(layer.style.panel.querySelector('[data-id=layerTheme]')).not.toBe(
      null,
    );
    expect(
      layer.style.panel.querySelector('[data-id=themesDropdown]'),
    ).not.toBe(null);

    await layer.loading;
  });

  it('creates a slider for the layer opacity', async () => {
    const { layer } = await layersListview((layers) => {
      layers.retail_points.style.opacitySlider = true;
    });

    slide(layer, 'opacitySlider', 40);

    expect(layer.L.getOpacity()).toBe(0.4);
  });

  describe('icon_scaling', () => {
    it('creates the cluster, zoom in and zoom out scale sliders', async () => {
      const { layer } = await layersListview((layers) => {
        Object.assign(layers.retail_points.style, {
          icon_scaling: {
            icon: true,
            clusterScale: true,
            zoomInScale: true,
            zoomOutScale: true,
          },
        });

        layers.retail_points.style.cluster.clusterScale = 2;
      });

      const changed = vi.spyOn(layer.L, 'changed');

      slide(layer, 'iconScalingSlider', 2);
      slide(layer, 'iconScalingClusterSlider', 3);
      slide(layer, 'iconScalingZoomInSlider', 1.5);
      slide(layer, 'iconScalingZoomOutSlider', 0.5);

      expect(layer.style.default.scale).toBe(2);
      expect(layer.style.cluster.clusterScale).toBe(3);
      expect(layer.style.zoomInScale).toBe(1.5);
      expect(layer.style.zoomOutScale).toBe(0.5);

      // The layer is rendered after the sliders have been moved.
      await vi.waitFor(() => expect(changed).toHaveBeenCalled());
    });

    it('toggles the scaling field with a checkbox', async () => {
      const { layer } = await layersListview((layers) => {
        layers.retail_points.style.icon_scaling = { field: 'pqi' };
      });

      const input = layer.style.view.querySelector(
        '[data-id=iconScalingFieldCheckbox-retail_points] input',
      );

      expect(input.checked).toBe(true);

      input.click();

      expect(layer.style.icon_scaling.field).toBeUndefined();
      expect(layer.style.icon_scaling._field).toBe('pqi');

      input.click();

      expect(layer.style.icon_scaling.field).toBe('pqi');
      expect(layer.style.icon_scaling._field).toBeUndefined();
    });

    it('creates a dropdown to switch the scaling field', async () => {
      const { layer } = await layersListview((layers) => {
        // The query fields param must be referenced in the workspace layer.
        layers.retail_points.style.icon_scaling = {
          field: 'pqi',
          fields: {
            size: { field: 'size_band', title: 'Size band' },
            pqi: { field: 'pqi' },
          },
        };
      });

      const dropdown = layer.style.view.querySelector(
        '[data-id=iconScalingFieldsDropdown]',
      );

      expect(layer.style.view.querySelector('h3').textContent).toBe(
        mapp.dictionary.icon_scaling_title,
      );

      expect(optionTitles(dropdown)).toEqual([
        'Size band',
        'pqi',
        mapp.dictionary.icon_scaling_no_scaling,
      ]);

      // The placeholder is the title of the current field.
      expect(dropdown.options[0].textContent.trim()).toBe('pqi');

      selectOption(dropdown, 'Size band');

      expect(layer.style.icon_scaling.field).toBe('size_band');

      await layer.loading;

      selectOption(dropdown, mapp.dictionary.icon_scaling_no_scaling);

      expect(layer.style.icon_scaling.field).toBeUndefined();

      await layer.loading;
    });

    it('doesn’t create elements for a hidden icon_scaling', async () => {
      const { layer } = await layersListview((layers) => {
        layers.retail_points.style.icon_scaling.hidden = true;
      });

      expect(
        layer.style.view.querySelector('[data-id=iconScalingSlider]'),
      ).toBeNull();
    });
  });
});
