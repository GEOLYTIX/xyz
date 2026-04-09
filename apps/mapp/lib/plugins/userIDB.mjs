/** 
### /plugins/userIDB

The plugin provides a JSON editor interface for the userIndexedDB 'user' store.

@requires /utils/userIndexedDB
@module /plugins/userIDB
*/

/**
@function userIDB

The userIDB plugin method adds a button to toggle the user dialog.

@param {Object} plugin The userIDB config.
@param {Object} mapview The mapview object.
*/
export function userIDB(plugin, mapview) {
  plugin.user = mapp.user || {
    email: 'anonymous',
  };

  // Find the btnColumn element.
  const btnColumn = mapview.mapButton;

  if (!btnColumn) return;

  plugin.title ??= 'userIDB';

  plugin.button = mapp.utils.html.node`
  <button
    title=${plugin.title}
    onclick=${() => {
      if (plugin.button.classList.toggle('active')) {
        userDialog(plugin);
      } else {
        plugin.dialog?.close();
      }
    }}>
    <span class="notranslate material-symbols-outlined">rule_settings`;

  // Append the plugin btn to the btnColumn.
  btnColumn.append(plugin.button);
}

/**
@function userDialog

The userDialog method show a dialog with a jsonEditor element containing the user object.

Custom button elements added to the jsonEditor toolbar allow to store/update the user object in the userIndexedDB or to remove the stored user.

@param {Object} plugin The userIDB config.
*/
async function userDialog(plugin) {
  const content = mapp.utils.html.node`<div>`;

  const jsoneditor = await mapp.ui.elements.jsoneditor({
    props: {
      content: {
        text: JSON.stringify(plugin.user),
      },
      mode: 'text',
      onRenderMenu: renderUpdateMenu,
    },
    target: content,
  });

  plugin.dialog = {
    closeBtn: true,
    content,
    header: plugin.title,
    onClose: (e) => {
      plugin.button.classList.remove('active');
    },
    target: document.getElementById('Map'),
  };

  mapp.ui.elements.dialog(plugin.dialog);

  // Create a custom menu for the userLayer jsoneditor control.
  function renderUpdateMenu(items) {
    // Push button to add layer to mapview layers.
    items.push(
      {
        className: 'notranslate material-symbols-outlined-important',
        onClick: updateUser,
        text: 'person_edit',
        title: 'Update User',
        type: 'button',
      },
      {
        className: 'notranslate material-symbols-outlined-important',
        onClick: removeUser,
        text: 'person_remove',
        title: 'Remove User',
        type: 'button',
      },
    );

    return items
      .filter((item) => item.text !== 'table')
      .filter((item) => item.text !== 'tree')
      .filter((item) => item.type !== 'separator')
      .filter((item) => item.className !== 'jse-undo')
      .filter((item) => item.className !== 'jse-redo')
      .filter((item) => item.className !== 'jse-search')
      .filter((item) => item.className !== 'jse-contextmenu')
      .filter((item) => item.className !== 'jse-sort')
      .filter((item) => item.className !== 'jse-transform');
  }

  async function updateUser() {
    const content = jsoneditor.get();

    const jsonUser = JSON.parse(content.text);

    await mapp.utils.userIndexedDB.put({
      store: 'user',
      name: jsonUser.email,
      obj: jsonUser,
    });
  }

  async function removeUser() {
    const content = jsoneditor.get();

    const jsonUser = JSON.parse(content.text);

    if (!jsonUser.email) return;

    await mapp.utils.userIndexedDB.remove({
      store: 'user',
      name: jsonUser.email,
    });

    content.text = JSON.stringify({
      email: jsonUser.email,
    });

    jsoneditor.set(content);
  }
}
