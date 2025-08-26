/**
### Admin Plugin

Dictionary entries:
- toolbar_admin

@requires /dictionary

@module /plugins/admin
*/

/**
Adds an admin button to the map view if the user has admin privileges.
@function admin
@param {Object} plugin - The plugin configuration object.
@param {Object} mapview - The mapview object.
@returns {void}
*/
export function admin(plugin, mapview) {
  const btnColumn = mapview.mapButton;

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;

  // Append user admin link.
  if (!mapp.user?.admin) return;

  btnColumn.appendChild(mapp.utils.html.node`
    <a
      title=${mapp.dictionary.toolbar_admin}
      href="${mapp.host + '/api/user/admin'}">
      <span class="notranslate material-symbols-outlined">supervisor_account`);
}
