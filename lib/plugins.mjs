/**
## mapp.plugins{}

@module plugins
*/

export async function svg_templates(plugin, mapview) {

  if (typeof mapp.utils.svgSymbols.templates !== 'object') {
    mapp.utils.svgSymbols.templates = {}
  }

  // Iterate through svg_templates entries.
  const promises = Object.entries(plugin).map(entry => {

    // Fetch entry value.
    return fetch(entry[1])
      .then(response => response.text())
      .then(svgString => {

        // Assign parsed svgString as entry key to templates object.
        mapp.utils.svgSymbols.templates[entry[0]] = svgString
      })
  })

  await Promise.all(promises)
}

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

export function fullscreen(plugin, mapview) {

  const btnColumn = document.getElementById('mapButton');

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;

  function toggleFullscreen(e) {

    e.target.classList.toggle('active');
    document.body.classList.toggle('fullscreen');
    mapview.Map.updateSize();
    Object.values(mapview.layers)
      .forEach((layer) => layer.mbMap?.resize());
  }

  const btn = mapp.utils.html.node`
  <button
    class="mobile-display-none"
    title=${mapp.dictionary.toolbar_fullscreen}
    onclick=${toggleFullscreen}>
    <div class="mask-icon map">`

  btnColumn.append(btn)
}

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

export function zoomBtn(plugin, mapview) {

  const btnColumn = document.getElementById('mapButton');

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;

  // Add zoomIn button.
  const btnZoomIn = btnColumn.appendChild(mapp.utils.html.node`
    <button
      id="btnZoomIn"
      .disabled=${mapview.Map.getView().getZoom() >= mapview.locale.maxZoom}
      title=${mapp.dictionary.toolbar_zoom_in}
      onclick=${(e) => {
        const z = parseInt(mapview.Map.getView().getZoom() + 1);
        mapview.Map.getView().setZoom(z);
        e.target.disabled = z >= mapview.locale.maxZoom;
      }}><div class="mask-icon add">`)

  // Add zoomOut button.
  const btnZoomOut = btnColumn.appendChild(mapp.utils.html.node`
    <button
      id="btnZoomOut"
      .disabled=${mapview.Map.getView().getZoom() <= mapview.locale.minZoom}
      title=${mapp.dictionary.toolbar_zoom_out}
      onclick=${(e) => {
        const z = parseInt(mapview.Map.getView().getZoom() - 1);
        mapview.Map.getView().setZoom(z);
        e.target.disabled = z <= mapview.locale.minZoom;
      }}><div class="mask-icon remove">`)

  // changeEnd event listener for zoom button
  mapview.Map.getTargetElement()
    .addEventListener('changeEnd', () => {
      const z = mapview.Map.getView().getZoom();
      btnZoomIn.disabled = z >= mapview.locale.maxZoom;
      btnZoomOut.disabled = z <= mapview.locale.minZoom;
    });
}

export function admin(plugin, mapview) {

  const btnColumn = document.getElementById('mapButton');

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;

  // Append user admin link.
  mapp.user?.admin
    && btnColumn.appendChild(mapp.utils.html.node`
      <a
        title=${mapp.dictionary.toolbar_admin}
        href="${mapp.host + '/api/user/admin'}">
        <div class="mask-icon supervisor-account">`);
}

export function login(plugin, mapview) {

  const btnColumn = document.getElementById('mapButton');

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;
  
  // Append login/logout link.
  if (!document.head.dataset.login) return;

  const iconClass = `mask-icon ${mapp.user? 'logout': 'lock-open'}`

  btnColumn.appendChild(mapp.utils.html.node`
    <a
      title=${mapp.user? mapp.dictionary.toolbar_logout: mapp.dictionary.toolbar_login}
      href=${mapp.user? "?logout=true": "?login=true"}>
      <div class=${iconClass}>`);
}