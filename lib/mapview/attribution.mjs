export default function attribution(mapview) {

  if (typeof mapview.attribution !== 'object') return;

  if (!mapview.attribution.target) {

    mapview.attribution.node = mapview.target.appendChild(
      mapp.utils.html.node`<div class="map-attribution">
        ${mapview.attribution.logo}`)

    mapview.attribution.target = mapview.attribution.node
      .appendChild(mapp.utils.html.node`<div class="attribution-links">`)
  }

  mapview.attribution.links ??= {}

  mapview.attribution.check = () => {

    const links = structuredClone(mapview.attribution.links)

    // Iterate through layers to check whether attribution should be displayed.
    Object.values(mapview.layers)
      .filter(layer => !!layer.display)
      .filter(layer => !!layer.attribution)
      .forEach(layer => Object.assign(links, layer.attribution))

    // Render the layer attribution links into the placeholder.
    mapp.utils.render(mapview.attribution.target,
      mapp.utils.html`${Object.entries(links)
        .map(entry => mapp.utils.html`
          <a target="_blank" href="${entry[1]}">${entry[0]}`)}`)

  }
}