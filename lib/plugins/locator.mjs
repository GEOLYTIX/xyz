/**
### Locator Plugin
@module /plugins/locator
 */

/**
Adds a locator button to the map view for triggering geolocation.
@function locator
@param {Object} plugin - The plugin configuration object.
@param {Object} mapview - The mapview object.
@param {Function} mapview.locate - The locate function of the mapview.
@returns {void}
*/
export function locator(plugin, mapview) {
  const btnColumn = document.getElementById('mapButton');

  // The btnColumn element only exists in the default mapp view.
  if (!btnColumn) return;

  const btn = mapp.utils.html.node`
    <button
      title=${mapp.dictionary.toolbar_current_location}
      onclick=${(e) => {
        e.target.classList.toggle('active');
        mapview.locate();
      }}><div class="mask-icon gps-not-fixed">`;

  btnColumn.append(btn);
}
