export function admin(plugin, mapview) {

  const btnColumn = document.getElementById('mapButton');

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;

  // Append user admin link.
  if (!mapp.user?.admin) return;
  
  btnColumn.appendChild(mapp.utils.html.node`
    <a
      title=${mapp.dictionary.toolbar_admin}
      href="${mapp.host + '/api/user/admin'}">
      <div class="mask-icon supervisor-account">`);
}