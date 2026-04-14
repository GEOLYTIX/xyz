/**
@module /mapview/attribution
*/

export default function attribution(mapview) {
  if (typeof mapview.attribution !== 'object') return;

  mapview.attribution.target ??= mapview.target;

  mapview.attribution.node = mapp.utils.html.node`
    <div class="map-attribution">${mapview.attribution.logo}`;

  mapview.attribution.target.append(mapview.attribution.node);

  mapview.attribution.linksTarget = mapp.utils.html
    .node`<div class="attribution-links">`;

  mapview.attribution.node.append(mapview.attribution.linksTarget);

  mapview.attribution.links ??= {};

  mapview.attribution.check = () => {
    // Create clone of mapview.attribution.links which are always displayed.
    const links = structuredClone(mapview.attribution.links);

    // Assign layer.attribution for visible to layers to links.
    Object.values(mapview.layers)
      .filter((layer) => !!layer.display)
      .filter((layer) => !!layer.attribution)
      .forEach((layer) => Object.assign(links, layer.attribution));

    const elements = Object.entries(links).map(
      (entry) => mapp.utils.html`
      <a target="_blank" href="${entry[1]}">${entry[0]}`,
    );

    // Render all links into mapview.attribution.target.
    mapp.utils.render(
      mapview.attribution.linksTarget,
      mapp.utils.html.node`${elements}`,
    );
  };
}
