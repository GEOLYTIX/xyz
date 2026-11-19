import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { mockJSONEditor } from '../../elements/_helpers.mjs';
import { layersListview } from '../../helpers.mjs';

/**
Creates a layers listview with the jsonEditor panel for the retail_points layer and opens the jsoneditor dialog with a click on the panel button.

The dialog is closed when the test finishes.

@returns {Promise<Object>} The layer, mapview, panel button, the createJSONEditor mock and the Update Layer menu button.
*/
async function openEditor() {
  const { createJSONEditor } = mockJSONEditor();

  const { layer, mapview } = await layersListview((layers) => {
    layers.retail_points.jsonEditor = true;
  });

  const btn = layer.view.querySelector('[data-id=jsonEditor]');

  btn.click();

  await vi.waitFor(() => expect(layer.jsonEditor.dialog).toBeDefined());

  onTestFinishedClose(layer);

  const { props } = createJSONEditor.mock.calls[0][0];

  // The renderMenu method of the layerJSE adds the Update Layer button to the menu.
  const [updateBtn] = props.onRenderMenu([]);

  return { btn, createJSONEditor, layer, mapview, props, updateBtn };
}

/**
Closes the jsoneditor dialog of a layer when the test finishes.
*/
function onTestFinishedClose(layer) {
  const dialog = layer.jsonEditor.dialog;

  onTestFinished(() => dialog.node.isConnected && dialog.close());
}

describe('ui/layers/panels/jsonEditor', () => {
  it('opens a dialog with a jsoneditor for the layer json', async () => {
    const { btn, layer, props, updateBtn } = await openEditor();

    expect(btn.textContent).toBe('JSON Editor');
    expect(btn.classList).toContain('active');

    const dialog = layer.jsonEditor.dialog;

    // The dialog is modal without a target.
    expect(dialog.node.classList).toContain('modal');
    expect(dialog.node.querySelector('.content > div')).not.toBeNull();

    expect(props.content.json.key).toBe('retail_points');
    expect(props.content.json.name).toBe('Grocery');

    expect(updateBtn).toMatchObject({ text: 'Update Layer', type: 'button' });

    dialog.node.querySelector('[data-id=close]').click();

    expect(btn.classList).not.toContain('active');
  });

  it('closes the dialog when the layer is removed', async () => {
    const { layer } = await openEditor();

    layer.remove();

    expect(layer.jsonEditor.dialog.node.isConnected).toBe(false);
  });

  it('replaces the layer with a layer decorated from the json', async () => {
    const { layer, mapview, props, updateBtn } = await openEditor();

    props.content.json.name = 'Updated grocery';

    const view = layer.view;

    const next = view.nextElementSibling;

    const newLayer = await updateBtn.onClick();

    expect(mapview.layers.retail_points).toBe(newLayer);
    expect(newLayer).not.toBe(layer);
    expect(newLayer.name).toBe('Updated grocery');

    // The view of the new layer replaces the view of the layer.
    expect(view.isConnected).toBe(false);
    expect(newLayer.view.nextElementSibling).toBe(next);
    expect(newLayer.view.querySelector('.header h2').textContent).toBe(
      'Updated grocery',
    );

    await newLayer.loading;
  });

  it('decorates the layer from the text content', async () => {
    const { layer, mapview, props, updateBtn } = await openEditor();

    const json = props.content.json;

    delete props.content.json;

    props.content.text = JSON.stringify({ ...json, name: 'From text' });

    const newLayer = await updateBtn.onClick();

    expect(mapview.layers.retail_points.name).toBe('From text');
    expect(newLayer).not.toBe(layer);

    await newLayer.loading;
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3143: the layer decorate method returns undefined if a layer can not be decorated. The updateLayer method reads the L property of undefined and throws.
  it.fails('warns if the layer can not be decorated', async () => {
    const { layer, mapview, props, updateBtn } = await openEditor();

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    props.content.json.format = 'unknown';

    await expect(updateBtn.onClick()).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledWith('Updated layer could not be decorated');
    expect(mapview.layers.retail_points).toBe(layer);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3142: the colon is missing in the 'height 300px' declaration of the dialog css_style. The declaration is invalid and the height is not assigned.
  it.fails('shows the dialog with a height of 300px', async () => {
    const { layer } = await openEditor();

    expect(layer.jsonEditor.dialog.node.style.height).toBe('300px');
  });
});
