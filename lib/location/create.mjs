/**
### /location/create

@module /location/create
*/

/**
@function createLocation

@description
The createLocation method creates a location from a JSON feature and stores the new Location in the layer data at rest.

The layer will be reloaded to show the new location in the mapview.

Dynamic tile generation for MVT layer may lag and not represent recently inserted rows. The feature will be checked for inclusion and the tile generation will be attempted at a 1 second interval until the feature is included in the generated tiles.

The method will attempt to get the location from the layer data at rest.

@param {Object} feature JSON feature. 
@param {Object} interaction Mapview drawing interaction.
@param {layer} layer Decorated Mapp Layer.

@property {Object} feature.geometry GeoJSON geometry for new location.
*/

export default async function createLocation(feature, interaction, layer) {

  // If the feature is null, return.
  if (!feature) return;

  // Get the current table and set new to true.
  const location = {
    layer,
    table: layer.tableCurrent(),
    new: true
  };

  // Store location in database.
  // The id must be returned from a serial ID field.
  location.id = await mapp.utils.xhr({
    method: 'POST',
    url: `${layer.mapview.host}/api/query?` +
      mapp.utils.paramString({
        template: 'location_new',
        locale: layer.mapview.locale.key,
        layer: layer.key,
        table: location.table
      }),
    body: JSON.stringify({
      [layer.geom]: feature.geometry,

      // Spread in defaults.
      ...interaction?.defaults,
      ...layer.draw?.defaults
    })
  });

  // Check whether feature is loaded on MVT update.
  if (layer.format === 'mvt') {
    layer.features = [];
    layer.source.on('tileloadend', concatFeatures);

    function concatFeatures(e) {
      layer.features = layer.features.concat(e.tile.getFeatures());
    }

    setTimeout(checkFeature, 1000);

    function checkFeature() {
      let found = layer.features?.find(F => F.properties?.id === location.id);
      if (found) {
        layer.source.un('tileloadend', concatFeatures);
      } else {
        layer.reload();
      }
    }
  }

  // Layer must be reloaded to reflect geometry changes.
  layer.reload();

  // Get the newly created location.
  mapp.location.get(location);
}
