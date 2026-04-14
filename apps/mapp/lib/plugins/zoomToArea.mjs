/**
### Zoom To Area Plugin

Dictionary entries:
- toolbar_zoom_to_area

@requires /dictionary

@module /plugins/zoomtoArea
*/

/**
Adds a "Zoom to Area" button to the map view for zooming to a specific area.
@function zoomToArea
@param {Object} plugin - The plugin configuration object.
@param {Object} mapview - The mapview object.
@param {Object} mapview.interactions - The interactions object of the mapview.
@param {Function} mapview.interactions.highlight - The highlight interaction function.
@param {Function} mapview.interactions.zoom - The zoom interaction function.
@returns {void}
*/
export function zoomToArea(plugin, mapview) {
  const btnColumn = mapview.mapButton;

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;

  function toggleZoomInteraction(e) {
    // If active cancel zoom and enable highlight interaction.
    if (e.target.classList.contains('active')) {
      // Will remove the 'active' class in callback of zoom interaction.
      mapview.interactions.highlight();
      return;
    }

    // Add active class
    e.target.classList.add('active');

    // Make zoom interaction current.
    mapview.interactions.zoom({
      // The interaction callback is executed on cancel or finish.
      callback: () => {
        e.target.classList.remove('active');
        delete mapview.interaction;

        // Set highlight interaction if no other interaction is current after 400ms.
        setTimeout(() => {
          !mapview.interaction && mapview.interactions.highlight();
        }, 400);
      },
    });
  }

  const btn = mapp.utils.html.node`
    <button
      class="mobile-display-none"
      data-id="zoomtoarea"
      title=${mapp.dictionary.toolbar_zoom_to_area}
      onclick=${toggleZoomInteraction}>
      <span class="notranslate material-symbols-outlined">pageview`;

  btnColumn.append(btn);
}
