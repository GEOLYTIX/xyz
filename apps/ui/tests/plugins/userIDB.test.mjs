import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import plugins from '../../lib/plugins/_plugins.mjs';
import { userIDB } from '../../lib/plugins/userIDB.mjs';

afterEach(() => {
  delete mapp.user;
});

// The default menu items of the jsoneditor which are filtered by the plugin.
const defaultMenu = [
  { text: 'text' },
  { text: 'tree' },
  { text: 'table' },
  { type: 'separator' },
  { className: 'jse-undo' },
  { className: 'jse-redo' },
  { className: 'jse-search' },
  { className: 'jse-contextmenu' },
  { className: 'jse-sort' },
  { className: 'jse-transform' },
  { className: 'jse-format' },
];

/**
Stubs the esmImport of the vanilla-jsoneditor module from esm.sh with a fake createJSONEditor method. The fake editor renders the menu with the onRenderMenu prop, and get() and set() the content.

Returns the array of the fake editors.
*/
function mockJSONEditor() {
  const editors = [];

  const createJSONEditor = vi.fn((params) => {
    let content = params.props.content;

    const editor = {
      menu: params.props.onRenderMenu([...defaultMenu]),
      get: () => content,
      set: vi.fn((c) => {
        content = c;
      }),
      target: params.target,
    };

    editors.push(editor);

    return editor;
  });

  vi.spyOn(mapp.utils, 'esmImport').mockResolvedValue({ createJSONEditor });

  return editors;
}

/**
Replaces the mapp.utils.userIndexedDB namespace with put and remove mocks, because the methods of the ESM namespace can't be spied on. The namespace is restored when the test finishes.
*/
function mockIndexedDB() {
  const put = vi.fn().mockResolvedValue('user@geolytix.co.uk');
  const remove = vi.fn().mockResolvedValue(undefined);

  const userIndexedDB = mapp.utils.userIndexedDB;
  mapp.utils.userIndexedDB = { ...userIndexedDB, put, remove };

  onTestFinished(() => {
    mapp.utils.userIndexedDB = userIndexedDB;
  });

  return { put, remove };
}

/**
Adds a #Map element as dialog target to the document, like the default view. The element is removed when the test finishes.

The close event is dispatched on each dialog in the target first. The close method of the dialog disconnects the ResizeObserver of a non-modal dialog from its target. The event is dispatched, because the close() method of a dialog element which is not open doesn't dispatch the event.
*/
function mapTarget() {
  const target = document.createElement('div');
  target.id = 'Map';
  document.body.append(target);

  onTestFinished(() => {
    for (const node of target.querySelectorAll('dialog')) {
      node.dispatchEvent(new Event('close'));
    }

    target.remove();
  });

  return target;
}

/**
Returns a mapview stub with a mapButton element.
*/
function mapview() {
  return { mapButton: document.createElement('div'), locale: { key: 'test' } };
}

/**
Creates the plugin button, clicks the button and waits for the dialog with the fake jsoneditor.

Returns the plugin config, the dialog target and the fake editors.
*/
async function openDialog(plugin = {}) {
  const editors = mockJSONEditor();
  const target = mapTarget();

  userIDB(plugin, mapview());

  plugin.button.click();

  await vi.waitFor(() => {
    expect(target.querySelector('dialog')).toBeTruthy();
  });

  return { editors, plugin, target };
}

/**
Returns a menu item of a fake editor by its title.
*/
function menuItem(editor, title) {
  return editor.menu.find((item) => item.title === title);
}

describe('plugins/userIDB', () => {
  it('is in the plugins collection', () => {
    expect(plugins.userIDB).toBe(userIDB);
  });

  it('assigns an anonymous user without a mapp.user', () => {
    const plugin = {};

    userIDB(plugin, {});

    expect(plugin.user).toEqual({ email: 'anonymous' });
    expect(plugin.button).toBeUndefined();
  });

  it('adds a button with the default title', () => {
    mapp.user = { email: 'user@geolytix.co.uk' };

    const plugin = {};
    const mv = mapview();

    userIDB(plugin, mv);

    expect(plugin.user).toBe(mapp.user);
    expect(mv.mapButton.querySelector('button')).toBe(plugin.button);
    expect(plugin.button.title).toBe('userIDB');
  });

  it('shows the user in a jsoneditor dialog', async () => {
    mapp.user = { email: 'user@geolytix.co.uk', language: 'en' };

    const { editors, plugin, target } = await openDialog({ title: 'User' });

    expect(plugin.button.classList.contains('active')).toBe(true);
    expect(target.querySelector('dialog h2').textContent).toBe('User');

    const [editor] = editors;

    expect(mapp.utils.esmImport).toHaveBeenCalledWith(
      'vanilla-jsoneditor@3.3.1',
    );
    expect(JSON.parse(editor.get().text)).toEqual(mapp.user);
    expect(target.querySelector('dialog .content > div')).toBe(editor.target);

    // The default menu is reduced to the text mode and format items and the custom buttons.
    expect(editor.menu.map((item) => item.text || item.className)).toEqual([
      'text',
      'jse-format',
      'person_edit',
      'person_remove',
    ]);
  });

  it('closes the dialog with a second click', async () => {
    const { plugin, target } = await openDialog();

    const dialog = target.querySelector('dialog');

    plugin.button.click();

    expect(plugin.button.classList.contains('active')).toBe(false);
    expect(dialog.isConnected).toBe(false);
  });

  it('removes the active class when the dialog is closed', async () => {
    const { plugin, target } = await openDialog();

    target.querySelector('dialog [data-id=close]').click();

    expect(plugin.button.classList.contains('active')).toBe(false);
    expect(target.querySelector('dialog')).toBeNull();
  });

  it('stores the user from the editor', async () => {
    const { put } = mockIndexedDB();

    const { editors } = await openDialog();

    const [editor] = editors;

    editor.set({ text: '{"email":"foo@bar.com","language":"de"}' });

    await menuItem(editor, 'Update User').onClick();

    expect(put).toHaveBeenCalledWith({
      store: 'user',
      name: 'foo@bar.com',
      obj: { email: 'foo@bar.com', language: 'de' },
    });
  });

  it('removes the stored user and resets the editor', async () => {
    mapp.user = { email: 'user@geolytix.co.uk', language: 'en' };

    const { remove } = mockIndexedDB();

    const { editors } = await openDialog();

    const [editor] = editors;

    await menuItem(editor, 'Remove User').onClick();

    expect(remove).toHaveBeenCalledWith({
      store: 'user',
      name: 'user@geolytix.co.uk',
    });

    expect(editor.set).toHaveBeenCalledWith({
      text: '{"email":"user@geolytix.co.uk"}',
    });
  });

  it('does not remove a user without an email', async () => {
    const { remove } = mockIndexedDB();

    const { editors } = await openDialog();

    const [editor] = editors;

    editor.set({ text: '{}' });

    await menuItem(editor, 'Remove User').onClick();

    expect(remove).not.toHaveBeenCalled();
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3116: the updateUser method doesn't catch the JSON.parse error for invalid JSON in the editor. The click handler of the menu button rejects.
  it.fails('handles invalid JSON in the editor', async () => {
    const { put } = mockIndexedDB();

    const { editors } = await openDialog();

    const [editor] = editors;

    editor.set({ text: '{"email":' });

    await expect(
      menuItem(editor, 'Update User').onClick(),
    ).resolves.toBeUndefined();

    expect(put).not.toHaveBeenCalled();
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3116: the dialog is created after the jsoneditor module is imported. A second click before the import resolves finds no plugin.dialog to close, and the dialog opens with an inactive button.
  it.fails(
    'does not open the dialog when the button is toggled off before the editor loads',
    async () => {
      mockJSONEditor();
      const target = mapTarget();

      const plugin = {};

      userIDB(plugin, mapview());

      plugin.button.click();
      plugin.button.click();

      expect(plugin.button.classList.contains('active')).toBe(false);

      // Wait for the jsoneditor import of the first click.
      await vi.waitFor(() => {
        expect(mapp.utils.esmImport).toHaveBeenCalled();
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(target.querySelector('dialog')).toBeNull();
    },
  );

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3116: every click to open the dialog creates a new jsoneditor and dialog. The editor of a closed dialog is never destroyed.
  it.fails(
    'reuses the jsoneditor when the dialog is opened again',
    async () => {
      const { editors, plugin, target } = await openDialog();

      plugin.button.click();

      plugin.button.click();

      await vi.waitFor(() => {
        expect(target.querySelector('dialog')).toBeTruthy();
      });

      expect(editors).toHaveLength(1);
    },
  );
});
