import { describe, expect, it, onTestFinished, vi } from 'vitest';
import plugins from '../../lib/plugins/_plugins.mjs';
import { userLayer } from '../../lib/plugins/userLayer.mjs';
import { addLayers, createMapview, getLocale } from '../helpers.mjs';

/**
Stubs the esmImport of the vanilla-jsoneditor module from esm.sh with a fake createJSONEditor method. The fake editor renders the menu with the onRenderMenu prop, and get() and set() the content.

Returns the array of the fake editors.
*/
function mockJSONEditor() {
  const editors = [];

  const createJSONEditor = vi.fn((params) => {
    let content = params.props.content;

    const editor = {
      menu: params.props.onRenderMenu([
        { text: 'text' },
        { text: 'tree' },
        { type: 'separator' },
        { className: 'jse-format' },
      ]),
      get: () => content,
      set: (c) => {
        content = c;
      },
      target: params.target,
    };

    editors.push(editor);

    return editor;
  });

  vi.spyOn(mapp.utils, 'esmImport').mockResolvedValue({ createJSONEditor });

  return editors;
}

/**
Adds a #layers element to the document, like the default view. The element and the modal dialogs are removed when the test finishes.
*/
function layersNode() {
  const node = document.createElement('div');
  node.id = 'layers';
  document.body.append(node);

  onTestFinished(() => {
    node.remove();
    for (const dialog of document.querySelectorAll('dialog.modal')) {
      dialog.remove();
    }
  });

  return node;
}

/**
Creates a scratch mapview with the locale layers and the userLayer plugin in a #layers element.

Returns the plugin, the mapview, the #layers node and the fake jsoneditor.
*/
async function setup() {
  const editors = mockJSONEditor();
  const node = layersNode();

  // The mapview.zIndex for the user layer is assigned when the locale layers are added.
  const mapview = await addLayers(
    await createMapview(await getLocale('scratch')),
  );

  const plugin = {};

  await userLayer(plugin, mapview);

  return { editor: editors[0], mapview, node, plugin };
}

/**
Returns the 'Add Layer' menu item of a fake editor.
*/
function addLayerItem(editor) {
  return editor.menu.find((item) => item.text === 'Add Layer');
}

describe('plugins/userLayer', () => {
  it('is in the plugins collection', () => {
    expect(plugins.userLayer).toBe(userLayer);
  });

  it('does nothing without a #layers element', async () => {
    const esmImport = vi.spyOn(mapp.utils, 'esmImport');

    const plugin = {};

    await userLayer(plugin, {});

    expect(plugin.layersNode).toBeNull();
    expect(esmImport).not.toHaveBeenCalled();
  });

  it('adds a button and a jsoneditor with a custom menu', async () => {
    const { editor, node, plugin } = await setup();

    expect(node.lastElementChild).toBe(plugin.btn);
    expect(plugin.btn.textContent).toBe('Add Layer');
    expect(plugin.jsoneditor).toBe(editor);
    expect(editor.get()).toEqual({ json: {} });

    // The layerJSE menu removes the mode and separator items.
    expect(editor.menu.map((item) => item.text || item.className)).toEqual([
      'jse-format',
      'Add Layer',
    ]);
  });

  it('opens the jsoneditor dialog', async () => {
    const { editor, plugin } = await setup();

    plugin.btn.click();

    expect(plugin.btn.classList.contains('active')).toBe(true);
    expect(plugin.dialog.node.isConnected).toBe(true);
    expect(plugin.dialog.node.contains(editor.target)).toBe(true);

    plugin.dialog.node.querySelector('[data-id=close]').click();

    expect(plugin.btn.classList.contains('active')).toBe(false);
    expect(plugin.dialog.node.isConnected).toBe(false);
  });

  it('adds a layer from the jsoneditor to the mapview', async () => {
    const { editor, mapview, node, plugin } = await setup();

    plugin.btn.click();

    const zIndex = mapview.zIndex;

    editor.set({
      text: JSON.stringify({
        key: 'user_tiles',
        format: 'tiles',
        URI: `${mapp.host}/tiles/{z}/{x}/{y}.png`,
      }),
    });

    await addLayerItem(editor).onClick();

    const layer = mapview.layers.user_tiles;

    expect(layer.L).toBeInstanceOf(ol.layer.Tile);
    expect(layer.zIndex).toBe(zIndex);
    expect(mapview.zIndex).toBe(zIndex + 1);
    expect(node.lastElementChild).toBe(layer.view);

    // The layer is not displayed without the display flag.
    expect(mapview.Map.getLayers().getArray()).not.toContain(layer.L);

    expect(plugin.dialog.node.isConnected).toBe(false);
  });

  it('assigns the zIndex as key and shows a display layer', async () => {
    const { editor, mapview, plugin } = await setup();

    plugin.btn.click();

    const zIndex = mapview.zIndex;

    editor.set({
      text: JSON.stringify({
        display: true,
        format: 'tiles',
        URI: `${mapp.host}/tiles/{z}/{x}/{y}.png`,
      }),
    });

    await addLayerItem(editor).onClick();

    const layer = mapview.layers[zIndex];

    expect(layer.key).toBe(zIndex);
    expect(mapview.Map.getLayers().getArray()).toContain(layer.L);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3117: a second click on the button toggles the active class off, but creates another dialog instead of closing the dialog. The close event of the replaced modal toggles the active class back on.
  it.fails('closes the dialog with a second click', async () => {
    const { plugin } = await setup();

    plugin.btn.click();
    plugin.btn.click();

    // The close event of a dialog element is dispatched async.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(plugin.btn.classList.contains('active')).toBe(false);
    expect(document.querySelectorAll('dialog.modal')).toHaveLength(0);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3117: the css_style of the dialog has a typo, 'height 300px' is missing the colon and is dropped as an invalid declaration.
  it.fails('sets the height of the dialog', async () => {
    const { plugin } = await setup();

    plugin.btn.click();

    expect(plugin.dialog.node.style.width).toBe('500px');
    expect(plugin.dialog.node.style.height).toBe('300px');
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3117: mapp.layer.decorate returns undefined for an unknown format, so the newLayer.L check throws a TypeError instead of the warning.
  it.fails('warns for a layer with an unknown format', async () => {
    const { editor } = await setup();

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    editor.set({ text: JSON.stringify({ key: 'foo', format: 'foo' }) });

    await expect(addLayerItem(editor).onClick()).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledWith('JSON layer could not be decorated');
  });
});
