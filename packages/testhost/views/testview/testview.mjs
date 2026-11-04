/**
The testview module imports the MAPP library without MAPP.UI and creates a mapview for each testview configuration.

Each mapview is created with a clone of the testview locale and adds the OSM base layer and the themed layer from the locale layers.

The decorated mapviews are assigned to `window.testviews` and `document.body.dataset.ready` is set once all mapviews have completed their render. Browser tests can await the ready flag before making assertions on the mapviews.
*/

import '/mapp/lib/mapp.mjs';

const testviews = [
  {
    key: 'locations_categorized',
    title: 'Locations: categorized',
    view: { lat: 48, lng: 5, z: 4 },
  },
  {
    key: 'locations_graduated',
    title: 'Locations: graduated',
    view: { lat: 48, lng: 5, z: 4 },
  },
  {
    key: 'features_categorized',
    title: 'Features: categorized with count distribution',
    view: { lat: 51.505, lng: -0.15, z: 13 },
  },
  {
    key: 'features_distributed',
    title: 'Features: distributed',
    view: { lat: 51.505, lng: -0.15, z: 13 },
  },
];

const locale = await mapp.utils.xhr(
  `${mapp.host}/api/workspace/locale?locale=testview&layers=true`,
);

if (locale instanceof Error) {
  throw locale;
}

window.testviews = {};

for (const testview of testviews) {
  const target = mapp.utils.html.node`<div class="map">`;

  document.body.append(mapp.utils.html.node`
    <div class="testview" data-testview=${testview.key}>
      <h2>${testview.title}</h2>
      ${target}`);

  // The mapview decorator modifies the locale and the view object.
  const mapview = await mapp.Mapview({
    host: mapp.host,
    target,
    locale: structuredClone(locale),
    view: { ...testview.view },
  });

  await mapview.addLayer(
    locale.layers.filter((layer) => ['OSM', testview.key].includes(layer.key)),
  );

  window.testviews[testview.key] = mapview;
}

await Promise.all(
  Object.values(window.testviews).map((mapview) => mapview.renderComplete),
);

document.body.dataset.ready = true;
