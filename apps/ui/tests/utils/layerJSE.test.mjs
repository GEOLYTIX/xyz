import { describe, expect, it, vi } from 'vitest';

const { layerJSE } = mapp.ui.utils;

// The default menu items of the vanilla-jsoneditor in the text mode.
const MENU = [
  { type: 'button', text: 'text' },
  { type: 'button', text: 'tree' },
  { type: 'button', text: 'table' },
  { type: 'separator' },
  { type: 'button', className: 'jse-format' },
  { type: 'button', className: 'jse-compact' },
  { type: 'separator' },
  { type: 'button', className: 'jse-sort' },
  { type: 'button', className: 'jse-transform' },
  { type: 'button', className: 'jse-search' },
  { type: 'button', className: 'jse-contextmenu' },
  { type: 'separator' },
  { type: 'button', className: 'jse-undo' },
  { type: 'button', className: 'jse-redo' },
];

/**
@function mockJSONEditor

@description
Stubs the import of the vanilla-jsoneditor module. The createJSONEditor method of the module returns an editor stand-in.

@returns {Object} The esmImport spy and the createJSONEditor mock.
*/
function mockJSONEditor() {
  const createJSONEditor = vi.fn((params) => ({ params }));

  const esmImport = vi
    .spyOn(mapp.utils, 'esmImport')
    .mockResolvedValue({ createJSONEditor });

  return { createJSONEditor, esmImport };
}

describe('ui/utils/layerJSE', () => {
  it('creates a jsoneditor in the text mode with the content', async () => {
    const { createJSONEditor, esmImport } = mockJSONEditor();

    const target = document.createElement('div');

    const content = { json: { key: 'layer' } };

    const jsoneditor = await layerJSE(target, content, {});

    expect(esmImport).toHaveBeenCalledWith('vanilla-jsoneditor@3.3.1');
    expect(createJSONEditor).toHaveBeenCalledOnce();

    const [params] = createJSONEditor.mock.calls[0];

    expect(jsoneditor).toBe(createJSONEditor.mock.results[0].value);
    expect(params.target).toBe(target);
    expect(params.props.content).toBe(content);
    expect(params.props.mode).toBe('text');
    expect(params.props.onRenderMenu).toBeTypeOf('function');
  });

  it('filters the menu items and adds the btn', async () => {
    const { createJSONEditor } = mockJSONEditor();

    const btn = { type: 'button', text: 'Update Layer' };

    await layerJSE(document.createElement('div'), {}, btn);

    const { onRenderMenu } = createJSONEditor.mock.calls[0][0].props;

    expect(onRenderMenu(structuredClone(MENU))).toEqual([
      { type: 'button', className: 'jse-format' },
      { type: 'button', className: 'jse-compact' },
      btn,
    ]);
  });

  it('returns the error if the jsoneditor import fails', async () => {
    const error = new Error('offline');

    vi.spyOn(mapp.utils, 'esmImport').mockResolvedValue(error);

    await expect(layerJSE(document.createElement('div'), {})).resolves.toBe(
      error,
    );
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3110: the renderMenu method pushes the btn to the menu items without a check. Without a btn, the undefined item throws a TypeError in the filter for the item.text.
  it.fails('renders the menu without a btn', async () => {
    const { createJSONEditor } = mockJSONEditor();

    await layerJSE(document.createElement('div'), {});

    const { onRenderMenu } = createJSONEditor.mock.calls[0][0].props;

    expect(onRenderMenu(structuredClone(MENU))).toEqual([
      { type: 'button', className: 'jse-format' },
      { type: 'button', className: 'jse-compact' },
    ]);
  });
});
