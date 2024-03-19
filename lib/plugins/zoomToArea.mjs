export function zoomToArea(plugin, mapview) {

  const btnColumn = document.getElementById('mapButton');

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;

  function toggleZoomInteraction(e) {

    // If active cancel zoom and enable highlight interaction.
    if (e.target.classList.contains('active')) {

      // Will remove the 'active' class in callback of zoom interaction.
      mapview.interactions.highlight()
      return;
    }

    // Add active class
    e.target.classList.add('active')

    // Make zoom interaction current.
    mapview.interactions.zoom({

      // The interaction callback is executed on cancel or finish.
      callback: () => {
        e.target.classList.remove('active');
        delete mapview.interaction

        // Set highlight interaction if no other interaction is current after 400ms.
        setTimeout(() => {
          !mapview.interaction && mapview.interactions.highlight()
        }, 400)
      }
    })
  }

  const btn = mapp.utils.html.node`
    <button
      class="mobile-display-none"
      title=${mapp.dictionary.toolbar_zoom_to_area}
      onclick=${toggleZoomInteraction}>
      <div class="mask-icon pageview">`

  btnColumn.append(btn)
}