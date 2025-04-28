/**
### mapp.layer.formats.tiles()
This module defines the tiles format for map layers.

@module /layer/formats/tiles
*/

/**
The function takes a layer object as input and performs the following steps:

1. It sets default values for `layer.source` and `layer.projection` if they are not already defined.
2. It creates a parameter string (`layer.paramString`) using the `mapp.utils.paramString` function, passing `layer.params` as an argument.
3. It creates a new `ol.layer.Tile` object and assigns it to `layer.L`. The tile layer is configured with the following properties:
   - `source`: A new instance of the tile source based on layer.source. The source is created using `ol.source[layer.source]` and is configured with the projection, url, and transition properties.
   - `layer`: The layer object itself, allowing access to layer properties within the tile layer.
   - `zIndex`: The z-index of the layer.
@function tiles
@param {Object} layer - The layer object.
@param {string} [layer.source='OSM'] - The source of the tile layer (e.g., 'OSM', 'XYZ').
@param {string} [layer.projection='EPSG:3857'] - The projection of the tile layer.
@param {string} [layer.paramString] - The parameter string for the tile layer URL.
@param {Object} [layer.params] - Additional parameters for the tile layer.
@param {string} layer.URI - The base URI for the tile layer.
@param {Object} [layer.style] - The style configuration for the layer.
@param {number} [layer.zIndex=0] - The z-index of the layer.
@param {ol.layer.Tile} layer.L - The OpenLayers tile layer object.
*/
export default (layer) => {
  layer.source ??= 'OSM';

  layer.projection ??= 'EPSG:3857';

  layer.paramString ??= mapp.utils.paramString(layer.params);

  layer.L = new ol.layer.Tile({
    className: `mapp-layer-${layer.key}`,
    key: layer.key,
    source: new ol.source[layer.source]({
      projection: layer.projection,
      transition: 0,
      url: layer.URI + layer.paramString,
    }),
    zIndex: layer.zIndex,
  });

  if (layer.style?.contextFilter) {
    layer.L.on('prerender', (evt) => {
      if (evt.context) {
        evt.context.filter = layer.style.contextFilter;
        evt.context.globalCompositeOperation = 'source-over';
      }
    });

    layer.L.on('postrender', (evt) => {
      if (evt.context) {
        evt.context.filter = 'none';
      }
    });
  }
};
