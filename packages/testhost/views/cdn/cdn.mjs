/**
The cdn view loads the published @geolytix/mapp package from the jsDelivr CDN instead of the /mapp/lib source modules, the way a page outside of XYZ uses the MAPP library.

The package version or dist-tag is read from the `version` URL parameter, eg. `/views/cdn/?version=next` or `/views/cdn/?version=5.1.0`. The default is `latest`.

The page is not an XYZ view and has no `data-dir`, so the `mapp.host` is set after the import. A page on another origin sets the url of the XYZ instance, which must allow the cross-origin requests.

The view creates a mapview with the `osm` base layer and the `locations_categorized` layer of the testview locale. The mapview is assigned to `window.mapview`, and `document.body.dataset.ready` is set once the mapview has rendered.
*/

const version = new URLSearchParams(location.search).get('version') || 'latest';

const cdn = `https://cdn.jsdelivr.net/npm/@geolytix/mapp@${version}`;

const css = document.createElement('link');
css.rel = 'stylesheet';
css.href = `${cdn}/dist/mapp.css`;
document.head.append(css);

const { default: mapp } = await import(`${cdn}/dist/mapp.js`);

// The XYZ API of the testhost which serves this view.
mapp.host = location.origin;

document.getElementById('version').textContent =
  `@geolytix/mapp@${version} (v${mapp.version}) from jsDelivr`;

const locale = await mapp.utils.xhr(
  `${mapp.host}/api/workspace/locale?locale=testview&layers=true`,
);

if (locale instanceof Error) {
  throw locale;
}

const mapview = await mapp.Mapview({
  target: document.getElementById('map'),
  locale,
  view: { lat: 48, lng: 5, z: 4 },
});

await mapview.addLayer(
  locale.layers.filter((layer) =>
    ['osm', 'locations_categorized'].includes(layer.key),
  ),
);

await mapview.renderComplete;

window.mapview = mapview;

document.body.dataset.ready = true;
