/**
## Mapview.geometry()
The mapview.geometry method creates and adds a vector layer with a geometry feature to the mapview.Map.

@module /mapview/geometry
*/

/**
@function geometry
@this mapview

@description
The geometry method reads a geometry as feature with an Openlayers format and adds a vector layer with the feature to the mapview.Map.

The format is created for each call. GeoJSON is the default format if the params.format is not an Openlayers format.

@param {Object} params The params object argument.
@property {string} [params.format='GeoJSON'] The Openlayers format, eg. `GeoJSON`.
@property {Object} [params.geometry] The geometry.
@property {Object|string} [params.value] The geometry or a JSON string of the geometry if params.geometry is not provided.
@property {string} [params.dataProjection] The SRID of the geometry. Defaults to the params.srid or the mapview.srid.
@property {string} [params.srid] The SRID of the geometry.
@property {Object} [params.style] The style config for the mapp.utils.style method.
@property {Object} [params.Style] The Openlayers style for the vector layer, created from params.style if not provided.
@property {number} [params.zIndex] The zIndex of the vector layer.
@returns {ol.layer.Vector} The vector layer added to the mapview.Map.
*/
export default function geometry(params) {
  const format = new ol.format[
    Object.hasOwn(ol.format, params.format) ? params.format : 'GeoJSON'
  ]();

  let feature;

  // Parse geometry from string value if not provided.
  const geometry =
    params.geometry ||
    (typeof params.value === 'string'
      ? JSON.parse(params.value)
      : params.value);

  // Create OL style object from params.style if not provided.
  params.Style ??= mapp.utils.style(params.style);
  if (!geometry) return;

  try {
    feature = format.readFeature(
      {
        geometry,
        type: 'Feature',
      },
      {
        dataProjection: `EPSG:${params.dataProjection || params.srid || this.srid}`,
        featureProjection: `EPSG:${this.srid}`,
      },
    );
  } catch (err) {
    console.error(err);
    return;
  }

  if (!feature) return;

  const layerVector = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [feature],
    }),
    style: params.Style,
    zIndex: params.zIndex,
  });

  this.Map.addLayer(layerVector);

  return layerVector;
}
