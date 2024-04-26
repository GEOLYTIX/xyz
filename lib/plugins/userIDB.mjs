export function userIDB(plugin, mapview) {

  // Find the btnColumn element.
  const btnColumn = document.getElementById('mapButton');

  if (!btnColumn) return;

  // Append the plugin btn to the btnColumn.
  btnColumn.append(mapp.utils.html.node`
    <button
      title="Update userIDB locale"
      onclick=${()=>{

        mapp.utils.userIndexedDB.put('locales', mapview.locale)

      }}>
      <div class="mask-icon" style="mask-image:url(https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/rule_settings/default/24px.svg)">`);
}