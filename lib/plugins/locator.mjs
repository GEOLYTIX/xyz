export function locator(plugin, mapview) {

  const btnColumn = document.getElementById('mapButton');

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;

  const btn = mapp.utils.html.node`
    <button
      title=${mapp.dictionary.toolbar_current_location}
      onclick=${(e) => {
      e.target.classList.toggle('active');
      mapview.locate();
    }}><div class="mask-icon gps-not-fixed">`

  btnColumn.append(btn)
}