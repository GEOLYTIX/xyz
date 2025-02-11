/**
### Login Plugin
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
  const btnColumn = document.getElementById('mapButton');

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;

  // Append login/logout link.
  if (!document.head.dataset.login) return;

  const iconClass = `mask-icon ${mapp.user ? 'logout' : 'lock-open'}`;

  btnColumn.appendChild(mapp.utils.html.node`
    <a
      title=${mapp.user ? mapp.dictionary.toolbar_logout : mapp.dictionary.toolbar_login}
      href=${mapp.user ? '?logout=true' : '?login=true'}>
      <div class=${iconClass}>`);
}
