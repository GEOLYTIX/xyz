/**
## /ui/plugins/login

@module /ui/plugins/login
*/

/**
@function login
@description
The login plugin adds a login/logout button to the map view if the login feature is enabled by the presence of the data-login attribute in the document head.

The button will link to either the login or logout endpoint depending on the user authentication state.

@param {Object} plugin The plugin configuration object.
@param {Object} mapview The mapview object.
@returns {void}
*/
export function login(plugin, mapview) {
  const btnColumn = mapview.mapButton;

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;

  // Append login/logout link.
  if (!document.head.dataset.login) return;

  const iconName = mapp.user ? 'logout' : 'lock_open';

  const iconClass = `notranslate material-symbols-outlined ${mapp.user ? ' color-danger' : ''}`;

  const authPath = document.head.dataset.authPath || '/api/user';
  const dir = document.head.dataset.dir || '';

  const userURL = mapp.user
    ? `${dir}${authPath}/logout`
    : `${dir}${authPath}/login`;

  const btn = mapp.utils.html.node`
    <a
      title=${mapp.user ? mapp.dictionary.toolbar_logout : mapp.dictionary.toolbar_login}
      href=${userURL}>
      <span class=${iconClass}>${iconName}`;

  btnColumn.append(btn);
}
