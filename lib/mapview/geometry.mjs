/**
## Mapview.geoJSON()
The mapview.geojson method creates and adds a geoJSON layer/source to the mapview.Map.

@module /mapview/geometry

@param {Object} params
The params object argument.
*/

let format;

export default function (params) {
  if (
    typeof params.format === 'string' &&
    Object.hasOwn(ol.format, params.format)
  ) {
    format = new ol.format[params.format]();
  }

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
