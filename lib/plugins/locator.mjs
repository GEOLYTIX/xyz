/**
### Locator Plugin

Dictionary entries:
- toolbar_current_location

@requires /dictionary

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
  const btnColumn = mapview.mapButton;

  // The btnColumn element only exists in the default mapp view.
  if (!btnColumn) return;

  const btn = mapp.utils.html.node`
    <button
      data-id="locator"
      title=${mapp.dictionary.toolbar_current_location}
      onclick=${(e) => {
        e.target.classList.toggle('active');
        mapview.locate();
      }}><span class="notranslate material-symbols-outlined">my_location`;

  btnColumn.append(btn);
}
