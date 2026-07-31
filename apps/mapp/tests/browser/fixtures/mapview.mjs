/**
## /tests/browser/fixtures/mapview

Creates a real, decorated mapview backed by a real OpenLayers Map, for the
`browser` Vitest project.

`mapp.Mapview()` is the decorator in `lib/mapview/_mapview.mjs`. It requires a
`locale` and a `target` element, constructs `new ol.Map()` against that target,
and attaches a ResizeObserver plus pointer handlers. It returns the mapview
synchronously unless the locale declares `syncPlugins` or `svgTemplates`, in
which case it returns a promise -- so callers must always await the result.

@module /tests/browser/fixtures/mapview
*/

/**
@function createMapview
@async

@description
Mounts a sized target element in the document and decorates a mapview against
it. The target is sized explicitly because an OpenLayers Map in a zero height
container never renders a frame, and `loadend` would never fire.

The caller is responsible for calling the returned `remove` method, or for
using `mapviewFixture` which does it automatically.

@param {Object} [params] Overrides merged into the mapview definition.

@returns {Promise<Object>} The decorated mapview, with an added `remove` method.
*/
export async function createMapview(params = {}) {
  const target = document.createElement('div');

  target.style.width = '800px';
  target.style.height = '600px';

  document.body.append(target);

  const mapview = await mapp.Mapview({
    host: '',
    locale: {
      extent: {
        east: 180,
        north: 85,
        south: -85,
        west: -180,
      },
      layers: {},
      srid: '3857',
      view: {
        lat: 0,
        lng: 0,
        z: 5,
      },
      ...params.locale,
    },
    target,
    ...params,
  });

  mapview.remove = () => {
    mapview.Map.setTarget(null);
    target.remove();
  };

  return mapview;
}

/**
@function renderComplete
@async

@description
Resolves once the OpenLayers Map has completed a render frame. A freshly
constructed Map has not rendered when the constructor returns, so any assertion
about layers, size or extent must wait for this.

@param {Object} mapview The decorated mapview.

@returns {Promise<void>} Resolves on the next `rendercomplete` event.
*/
export function renderComplete(mapview) {
  return new Promise((resolve) => {
    mapview.Map.once('rendercomplete', resolve);
    mapview.Map.renderSync();
  });
}
