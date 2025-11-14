/**
### Login Plugin

Dictionary entries:
- toolbar_login
- toolbar_logout

@requires /dictionary

@module /plugins/login
 */

/**
Adds a login/logout button to the map view.
@function login
@param {Object} plugin - The plugin configuration object.
@param {Object} mapview - The mapview object.
@returns {void}
*/
export function login(plugin, mapview) {
  const btnColumn = mapview.mapButton;

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;

  // Append login/logout link.
  if (!document.head.dataset.login) return;

  const iconName = `${mapp.user ? 'logout' : 'lock_open'}`;

  const iconClass =
    'notranslate material-symbols-outlined' +
    (mapp.user ? ' color-danger' : '');

  let userURL;

  if (mapp.user) {
    userURL = '?logout=true';
  } else {
    userURL = '?login=true';
  }

  console.log(mapp.user);

  btnColumn.appendChild(mapp.utils.html.node`
    <a
      title=${mapp.user ? mapp.dictionary.toolbar_logout : mapp.dictionary.toolbar_login}
      href=${userURL}>
      <span class=${iconClass}>${iconName}`);
}
