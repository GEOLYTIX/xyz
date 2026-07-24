/**
### /plugins/userLocale

The userLocale plugin allows to open a dialog for the userLocale element.

@module /plugins/userLocale
*/

/**
@function userLocale
The method assigns a button to the btnColumn which allows to toggle a dialog for the userLocale element.

@param {Object} plugin The userLocale config from the locale.
@param {Object} mapview The mapview object.
*/
export function userLocale(plugin, mapview) {
  if (!mapp.user) return;

  const btnColumn = mapview.mapButton;

  // The btnColumn element only exists in the default mapp view.
  if (!btnColumn) return;

  plugin = {};

  const content = mapp.ui.elements.userLocale(plugin, mapview);

  const dialog = {
    closeBtn: true,
    content,
    header: 'User Locale',
    onClose: (e) => {
      btn.classList.remove('active');
    },
    target: document.getElementById('Map'),
  };

  const btn = mapp.utils.html.node`
    <button
      data-id="user-locale"
      onclick=${() => {
        if (btn.classList.toggle('active')) {
          mapp.ui.elements.dialog(dialog);
        } else {
          dialog.close();
        }
      }}><span class="notranslate material-symbols-outlined">save_as`;

  btnColumn.append(btn);
}
