/**
The locale view creates a mapview for a locale of the testhost workspace, eg. `/views/locale/?locale=smoke`.

The view can check any workspace served by the testhost, eg. the MAPP test workspace or a workspace for a bug or feature.

The mapview is created with the locale view. The view fits the extent of the vector layer features if the locale has no view.

The panel lists the locale layers with their feature count and a checkbox to show or hide the layer. An OSM base map is added once the mapview is ready.

The decorated mapview is assigned to `window.mapview`. `document.body.dataset.ready` is set once the mapview has rendered.
*/

import '/mapp/lib/mapp.mjs';

const panel = document.getElementById('panel');

const key = new URLSearchParams(location.search).get('locale');

if (!key) {
  panel.append(mapp.utils.html.node`
    <h2>No locale</h2>
    <p>Add the locale key to the url, eg. <code>?locale=smoke</code>.</p>`);

  throw new Error('The locale url param is required.');
}

const locale = await mapp.utils.xhr(
  `${mapp.host}/api/workspace/locale?locale=${encodeURIComponent(key)}&layers=true`,
);

if (locale instanceof Error) {
  panel.append(mapp.utils.html.node`
    <h2>${key}</h2>
    <p class="error">The locale ${key} was not found in the testhost workspace (${locale.message}).</p>`);

  throw locale;
}

const mapview = await mapp.Mapview({
  host: mapp.host,
  target: document.getElementById('map'),
  locale,
});

window.mapview = mapview;

await mapview.addLayer(locale.layers);

await mapview.renderComplete;

if (!locale.view) {
  const extent = ol.extent.createEmpty();

  for (const layer of Object.values(mapview.layers)) {
    const source = layer.L?.getSource?.();

    if (source instanceof ol.source.Vector && source.getFeatures().length) {
      ol.extent.extend(extent, source.getExtent());
    }
  }

  if (!ol.extent.isEmpty(extent)) {
    mapview.fitView(extent, { duration: 0 });
  }
}

panel.append(mapp.utils.html.node`<h2>${locale.name || locale.key}</h2>`);

for (const layer of Object.values(mapview.layers)) {
  const source = layer.L?.getSource?.();

  const count =
    source instanceof ol.source.Vector
      ? ` (${source.getFeatures().length})`
      : '';

  panel.append(mapp.utils.html.node`
    <label>
      <input
        type="checkbox"
        checked=${layer.display}
        onchange=${(e) => (e.target.checked ? layer.show() : layer.hide())}>
      ${layer.name || layer.key}${count}
    </label>`);
}

document.body.dataset.ready = true;

// The OSM base map is added by the view, not the workspace, so that test workspaces don't depend on the network.
const baseMap = new ol.layer.Tile({ source: new ol.source.OSM(), zIndex: -1 });

mapview.Map.addLayer(baseMap);

panel.append(mapp.utils.html.node`
  <label>
    <input
      type="checkbox"
      checked
      onchange=${(e) => baseMap.setVisible(e.target.checked)}>
    OSM base map
  </label>`);
