/**
## /utils/proj4

The proj4 utility module exports methods to manage Openlayers projections.

The proj4 library will be imported through mapp.utils.esmImport('proj4@2.9.0')

@module /utils/proj4
*/

export const proj4 = {
  addProjection,
};

/**
@function addProjection
@async
@description

The proj4 utility method adds a new projection to the ol library.

``` js
mapp.utils.proj4.addProjection({
  name: 'EPSG:27700',
  defs: '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs',
  extent: [0, 0, 700000, 1300000]
});
```

@param {object} params
@property {string} params.name
@property {string} params.defs
@property {array} params.extent
*/
async function addProjection(params) {
  const mod = await mapp.utils.esmImport('proj4@2.9.0');

  mod.default.defs(
    params.name,
    '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs',
  );

  // Create and add the projection to OpenLayers
  const projection = new ol.proj.Projection({
    code: params.name,
    extent: params.extent,
  });

  // Add the projection to the OpenLayers registry
  ol.proj.addProjection(projection);

  // Register transformation functions
  ol.proj.addCoordinateTransforms(
    'EPSG:3857',
    params.name,
    (coord) => mod.default('EPSG:3857', params.name, coord),
    (coord) => mod.default(params.name, 'EPSG:3857', coord),
  );
}
