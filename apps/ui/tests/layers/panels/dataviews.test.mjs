import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { fakeType, mapTarget } from '../../elements/_helpers.mjs';
import { groceryMapview, layersListview } from '../../helpers.mjs';

/**
Returns the dataviews drawer of the retail_points layer view.
*/
function dataviewsDrawer(layer) {
  return layer.view.querySelector('[data-id=retail_points-dataviews-drawer]');
}

/**
Appends a tabview element with the data-id to the document. The addTab event listener assigns show and remove mocks to the dataview, like the Tabview. The element is removed when the test finishes.
*/
function tabview(id) {
  const el = document.createElement('div');

  el.dataset.id = id;

  const addTab = vi.fn((e) => {
    e.detail.show = vi.fn();
    e.detail.remove = vi.fn();
  });

  el.addEventListener('addTab', addTab);

  document.body.append(el);

  onTestFinished(() => el.remove());

  return addTab;
}

describe('ui/layers/panels/dataviews', () => {
  it('creates a drawer with a checkbox and target for each dataview', async () => {
    fakeType();

    const { layer, mapview } = await layersListview((layers) => {
      layers.retail_points.dataviews = {
        chart: { dataview: 'fake', title: 'Fake chart' },
        table: { dataview: 'fake' },
        // Flags are not dataviews.
        flag: true,
        name: 'dataviews',
      };
    });

    const drawer = dataviewsDrawer(layer);

    expect(drawer.querySelector('.header h3').textContent).toBe(
      mapp.dictionary.layer_dataview_header,
    );

    const content = drawer.querySelector('.content');

    expect(
      [...content.children].map((el) => el.dataset.id || el.className),
    ).toEqual(['chart', 'dataview-target', 'table', 'dataview-target']);

    expect(content.querySelector('[data-id=chart]').textContent.trim()).toBe(
      'Fake chart',
    );
    expect(content.querySelector('[data-id=table]').textContent.trim()).toBe(
      'table',
    );

    const { chart } = layer.dataviews;

    expect(chart.key).toBe('chart');
    expect(chart.layer).toBe(layer);
    expect(chart.host).toBe(mapview.host);
    expect(chart.target).toBe(content.children[1]);
    expect(chart._target).toBeUndefined();
  });

  it('shows and hides a dataview with the checkbox and the layer display', async () => {
    const fake = fakeType();

    const { layer } = await layersListview((layers) => {
      layers.retail_points.dataviews = {
        chart: { dataview: 'fake', display: true },
      };
    });

    const { chart } = layer.dataviews;

    const input = chart.chkbox.querySelector('input');

    // The dataview is shown with the displayed layer.
    expect(fake.create).toHaveBeenCalledWith(chart);
    expect(input.checked).toBe(true);
    expect(chart.target.style.display).toBe('block');

    layer.hide();

    expect(input.checked).toBe(false);
    expect(chart.target.style.display).toBe('none');

    // The display flag is retained to show the dataview with the layer.
    expect(chart.display).toBe(true);

    layer.show();

    expect(input.checked).toBe(true);
    expect(chart.target.style.display).toBe('block');

    await layer.loading;

    input.click();

    expect(chart.display).toBe(false);
    expect(chart.target.style.display).toBe('none');

    // A dataview which is not displayed is not shown with the layer.
    layer.hide();
    layer.show();

    expect(chart.target.style.display).toBe('none');

    await layer.loading;
  });

  it('reinstates the target from the _target snapshot', async () => {
    fakeType();

    tabview('dataviews-tabview');

    const mapview = await groceryMapview();

    const layer = mapview.layers.retail_points;

    // The target of a dataview may be lost, eg. in a layer json from the jsonParser.
    layer.dataviews = {
      chart: { dataview: 'fake', _target: 'dataviews-tabview' },
    };

    mapp.ui.layers.panels.dataviews(layer);

    expect(layer.dataviews.chart.tabview.dataset.id).toBe('dataviews-tabview');
  });

  it('adds a dataview with a tabview target to the tabview', async () => {
    fakeType();

    const addTab = tabview('dataviews-tabview');

    const { layer } = await layersListview((layers) => {
      layers.retail_points.dataviews = {
        chart: { dataview: 'fake', target: 'dataviews-tabview', display: true },
      };
    });

    const { chart } = layer.dataviews;

    expect(addTab).toHaveBeenCalledOnce();
    expect(addTab.mock.calls[0][0].detail).toBe(chart);
    expect(chart.show).toHaveBeenCalledOnce();

    // The tabview dataview has no target in the drawer.
    expect([
      ...dataviewsDrawer(layer).querySelector('.content').children,
    ]).toEqual([chart.chkbox]);

    // The hide method removes the tab.
    chart.chkbox.querySelector('input').click();

    expect(chart.display).toBe(false);
    expect(chart.remove).toHaveBeenCalledOnce();
  });

  it('shows a dataview with a dialog target in a dialog', async () => {
    fakeType();

    const target = mapTarget();

    const { layer } = await layersListview((layers) => {
      layers.retail_points.dataviews = {
        chart: { dataview: 'fake', target: 'dialog', title: 'Chart' },
      };
    });

    const { chart } = layer.dataviews;

    const dialog = target.querySelector(
      'dialog[data-id=chart-dataviews-dialog]',
    );

    // The dialog is closed until the dataview is shown.
    expect(dialog).toBeNull();
    expect(chart.dataview_dialog).toBeDefined();

    // The dataview target is in the dialog and not in the drawer.
    expect([
      ...dataviewsDrawer(layer).querySelector('.content').children,
    ]).toEqual([chart.chkbox]);

    chart.chkbox.querySelector('input').click();

    expect(chart.dataview_dialog.node.isConnected).toBe(true);
    expect(chart.dataview_dialog.node.querySelector('h1').textContent).toBe(
      ' Chart',
    );
  });

  it('creates the dataviews without a panel for the hide flag', async () => {
    fakeType();

    const mapview = await groceryMapview();

    const layer = mapview.layers.retail_points;

    layer.dataviews = { hide: true, chart: { dataview: 'fake' } };

    expect(mapp.ui.layers.panels.dataviews(layer)).toBeUndefined();
    expect(layer.dataviews.chart.chkbox).toBeInstanceOf(HTMLElement);
  });

  it('creates a card for drawer false with the classList', async () => {
    fakeType();

    const mapview = await groceryMapview();

    const layer = mapview.layers.retail_points;

    layer.dataviews = {
      drawer: false,
      classList: 'custom-dataviews',
      chart: { dataview: 'fake' },
    };

    const card = mapp.ui.layers.panels.dataviews(layer);

    expect(card.classList).toContain('drawer');
    expect(card.classList).toContain('custom-dataviews');
    expect(card.classList).not.toContain('expandable');
  });

  it('creates a button to show the dataviews in a dialog', async () => {
    fakeType();

    const target = mapTarget();

    const mapview = await groceryMapview();

    const layer = mapview.layers.retail_points;

    layer.dataviews = { dialog: true, chart: { dataview: 'fake' } };

    const btn = mapp.ui.layers.panels.dataviews(layer);

    expect(layer.dataviews.dialog).toMatchObject({
      btn_label: 'Dataviews',
      title: 'Dataviews',
      icon: 'table_view',
    });

    expect(btn.querySelector('span').textContent).toBe('table_view');

    btn.click();

    const dialog = target.querySelector('dialog');

    expect(dialog.querySelector('h1').textContent).toBe('Dataviews');
    expect(dialog.querySelector('[data-id=chart]')).not.toBeNull();
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3144: the loop returns for a tabview dataview on mobile instead of continuing. The following dataviews and the panel are not created.
  it.fails(
    'creates the panel without the tabview dataviews on mobile',
    async () => {
      fakeType();

      tabview('dataviews-tabview');

      const mapview = await groceryMapview();

      const layer = mapview.layers.retail_points;

      layer.dataviews = {
        tab: { dataview: 'fake', target: 'dataviews-tabview' },
        chart: { dataview: 'fake' },
      };

      vi.spyOn(mapp.utils, 'mobile').mockReturnValue(true);

      const drawer = mapp.ui.layers.panels.dataviews(layer);

      expect(drawer.querySelector('[data-id=chart]')).not.toBeNull();
      expect(drawer.querySelector('[data-id=tab]')).toBeNull();
    },
  );

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3144: the populateTabview method interpolates the target in a querySelector. A target element is not a valid selector and the querySelector throws.
  it.fails('creates a dataview with a target element', async () => {
    fakeType();

    const mapview = await groceryMapview();

    const layer = mapview.layers.retail_points;

    const target = document.createElement('div');

    layer.dataviews = { chart: { dataview: 'fake', target } };

    const drawer = mapp.ui.layers.panels.dataviews(layer);

    expect(drawer.querySelector('.content').lastElementChild).toBe(target);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3120: Dataview returns a Promise, so the instanceof Error check never skips a dataview of an unknown type. The undefined chkbox of the dataview is added to the panel content, which is then rendered as text, eg. '[object HTMLLabelElement]'.
  it.fails('skips a dataview of an unknown type', async () => {
    fakeType();

    vi.spyOn(console, 'error').mockImplementation(() => {});

    const mapview = await groceryMapview();

    const layer = mapview.layers.retail_points;

    layer.dataviews = {
      unknown: { dataview: 'unknown' },
      chart: { dataview: 'fake' },
    };

    const drawer = mapp.ui.layers.panels.dataviews(layer);

    expect(drawer.querySelector('[data-id=chart]')).toBe(
      layer.dataviews.chart.chkbox,
    );
    expect(drawer.querySelectorAll('.dataview-target')).toHaveLength(1);
  });
});
