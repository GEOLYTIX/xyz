import { describe, expect, it, onTestFinished, vi } from 'vitest';

const { dataviewDialog } = mapp.ui.utils;

/**
@function createMap

@description
Appends the #Map element for the dataview dialog to the document. The element and the dialog are removed when the test finishes.

@returns {HTMLElement} The #Map element.
*/
function createMap() {
  const map = document.createElement('div');

  map.id = 'Map';

  map.style.cssText = 'position:relative;width:800px;height:600px;';

  document.body.append(map);

  onTestFinished(() => map.remove());

  return map;
}

/**
@function createDialog

@description
Creates a dataview dialog in a #Map element. The dialog is closed when the test finishes.

@param {Object} [params] Properties to assign to the dataview.
@returns {Object} The dataview and the #Map element.
*/
function createDialog(params) {
  const map = createMap();

  const dataview = {
    key: 'chart',
    label: 'Chart',
    target: 'dialog',
    update: vi.fn(),
    ...params,
  };

  dataviewDialog(dataview);

  onTestFinished(() => dataview.dataview_dialog.close());

  return { dataview, map };
}

describe('ui/utils/dataviewDialog', () => {
  it('returns for a dataview without dialog target', () => {
    const dataview = { target: 'other' };

    dataviewDialog(dataview);

    expect(dataview.dataview_dialog).toBeUndefined();
  });

  it('creates a closed dialog with the dialog content as target', () => {
    const { dataview, map } = createDialog();

    const { dataview_dialog } = dataview;

    expect(dataview_dialog.target).toBe(map);
    expect(dataview_dialog.node.dataset.id).toBe('chart-dataviews-dialog');
    expect(dataview_dialog.node.querySelector('h1').textContent.trim()).toBe(
      'Chart',
    );

    expect(dataview.target).toBe(
      dataview_dialog.node.querySelector('.content'),
    );
    expect(dataview.target.classList).toContain('panel');

    // The dialog is shown with the dataview.
    expect(dataview_dialog.node.isConnected).toBe(false);
  });

  it('assigns the default and dialog_css styles', () => {
    const { dataview: defaults } = createDialog();

    expect(defaults.dataview_dialog.node.style).toMatchObject({
      height: '200px',
      minHeight: '200px',
      minWidth: '300px',
      resize: 'both',
      width: '300px',
    });

    const { dataview } = createDialog({
      dialog_css: {
        height: 400,
        minHeight: 350,
        minWidth: 250,
        resize: 'none',
        width: 500,
      },
    });

    expect(dataview.dataview_dialog.node.style).toMatchObject({
      height: '400px',
      minHeight: '350px',
      minWidth: '250px',
      resize: 'none',
      width: '500px',
    });
  });

  it('shows and hides the dialog with the dataview', () => {
    const { dataview, map } = createDialog();

    dataview.show();

    expect(dataview.update).toHaveBeenCalledTimes(1);
    expect(dataview.dataview_dialog.node.parentElement).toBe(map);

    dataview.hide();

    expect(dataview.dataview_dialog.node.isConnected).toBe(false);
  });

  it('shows the toolbar of the dataview', () => {
    const { dataview } = createDialog({ toolbar: {} });

    // The Toolbar method of the dataview utils creates a hidden btn-row in the target.
    dataview.target.append(
      mapp.utils.html.node`<div class="btn-row" style="display: none">`,
    );

    dataview.show();

    expect(
      dataview.dataview_dialog.node.querySelector('.btn-row').style.display,
    ).toBe('');
  });

  it('moves the canvas of a chart into the dialog', () => {
    const { dataview } = createDialog({ chart: {} });

    const canvas = document.createElement('canvas');

    const content = dataview.target;

    content.append(canvas);

    dataview.show();

    expect(canvas.parentElement).toBe(dataview.dataview_dialog.node);
    expect(content.isConnected).toBe(false);
  });

  it('unchecks the chkbox when the dialog is closed', () => {
    const { dataview } = createDialog();

    dataview.chkbox = mapp.ui.elements.chkbox({
      checked: true,
      label: 'Chart',
    });

    dataview.show();

    dataview.dataview_dialog.node.querySelector('[data-id=close]').click();

    expect(dataview.chkbox.querySelector('input').checked).toBe(false);
    expect(dataview.dataview_dialog.node.isConnected).toBe(false);
  });

  it('closes the dialog when the location is removed', () => {
    const location = { removeCallbacks: [] };

    const { dataview } = createDialog({ location });

    dataview.show();

    location.removeCallbacks.forEach((fn) => fn());

    expect(dataview.dataview_dialog.node.isConnected).toBe(false);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3122: the show method moves the chart canvas from the dialog content into the dialog node and removes the content element. The next show() call queries the canvas in the removed content element, and the appendChild(null) throws a TypeError. A chart dialog can't be shown again after it was closed.
  it.fails('shows a chart dialog again', () => {
    const { dataview } = createDialog({ chart: {} });

    const canvas = document.createElement('canvas');

    dataview.target.append(canvas);

    dataview.show();

    dataview.hide();

    dataview.show();

    expect(canvas.parentElement).toBe(dataview.dataview_dialog.node);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3122: the onClose method of the dialog unchecks the dataview chkbox, but doesn't clear the dataview.display flag. A layer dataview which was closed with the dialog close button is shown again by the layer showCallbacks, which check the display flag, when the layer is hidden and shown.
  it.fails('clears the display flag when the dialog is closed', async () => {
    mapp.ui.utils.fake = { create: vi.fn() };

    onTestFinished(() => delete mapp.ui.utils.fake);

    const { dataview } = createDialog({ dataview: 'fake' });

    await mapp.ui.Dataview(dataview);

    document.body.append(dataview.chkbox);

    onTestFinished(() => dataview.chkbox.remove());

    dataview.chkbox.querySelector('input').click();

    expect(dataview.display).toBe(true);
    expect(dataview.dataview_dialog.node.isConnected).toBe(true);

    dataview.dataview_dialog.node.querySelector('[data-id=close]').click();

    expect(dataview.chkbox.querySelector('input').checked).toBe(false);
    expect(dataview.display).toBe(false);
  });
});
