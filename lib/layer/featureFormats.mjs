/**
## /layer/featureFormats

The featureFormats module exports utility methods to process the response data from layer queries into Openlayers features.

@module /layer/featureFormats
*/

/**
@function geojson

@description
The geojson featureFormats method processes an array of wkt features and returns Openlayers features to be added to the layer source.

The geometry of the features will be projected from the layer.srid data projection to the layer.mapview.srid projection for display in the mapview.Map.

The layer.params.fields[] property values will be added to the layer.featureFields field values arrays to be processed by the featureFields.process() method.

@param {layer} layer A decorated mapp layer object.
@param {array} features An array of WKT features.
@property {string} layer.srid Feature data projection.
@property {Object} layer.params
@property {Array} params.fields Array of field names for feature properties.

@returns {array} Array of Openlayers features.
*/
export function geojson(layer, features) {

  const formatGeojson = new ol.format.GeoJSON

  mapp.layer.featureFields.reset(layer);

  return features.map((feature) => {

    // Populate featureFields values array with feature property values.
    layer.params.fields?.forEach(field => {

      layer.featureFields[field].values.push(feature.properties[field]);
    })

    return new ol.Feature({
      id: feature.id,
      geometry: formatGeojson.readGeometry(feature.geometry, {
        dataProjection: 'EPSG:' + layer.srid,
        featureProjection: 'EPSG:' + layer.mapview.srid,
      }),
      properties: feature.properties
    })

  })
}

/**
@function wkt

@description
The wkt featureFormats method processes an array of wkt features and returns Openlayers features to be added to the layer source.

The geometry of the features will be projected from the layer.srid data projection to the layer.mapview.srid projection for display in the mapview.Map.

The layer.params.fields[] property values will be added to the layer.featureFields field values arrays to be processed by the featureFields.process() method.

@param {layer} layer A decorated mapp layer object.
@param {array} features An array of WKT features.
@property {string} layer.srid Feature data projection.
@property {Object} layer.params
@property {Array} params.fields Array of field names for feature properties.

@returns {array} Array of Openlayers features.
*/
export function wkt(layer, features) {

  if (!Array.isArray(features)) return;
  
  const formatWKT = new ol.format.WKT

  mapp.layer.featureFields.reset(layer);

  const olFeatures = features.map((feature) => {

    const properties = {}

    // Populate featureFields values array with feature property values.
    layer.params.fields?.forEach((field, i) => {

      layer.featureFields[field].values.push(feature[i + 2]);

      properties[field] = feature[i + 2]
    })

    // Return feature from geometry with properties.
    return new ol.Feature({
      id: feature.shift(),
      geometry: formatWKT.readGeometry(feature.shift(), {
        dataProjection: 'EPSG:' + layer.srid,
        featureProjection: 'EPSG:' + layer.mapview.srid,
      }),
      properties
    })

  })

  // Process featureFields for dynamic theming.
  mapp.layer.featureFields.process(layer);

  return olFeatures
}

/**
@function wkt_properties

@description
In order to process featureFields for tiled datasets it is required to request the feature properties separate from the vector tile geometries.

The property features do not have a geometry property and the wkt_properties method does not return an array of Openlayers features.

The feature properties are assigned to the layer.featuresObject{} with the feature ID as property key for lookup of the properties in the featureStyle method.

The layer.params.fields[] property values will be added to the layer.featureFields field values arrays to be processed by the featureFields.process() method.

@param {layer} layer A decorated mapp layer object.
@param {array} features An array of WKT features.
@property {Object} layer.featuresObject Store feature properties with the feature ID as property key for lookup in the featureStyle method.
@property {Object} layer.params
@property {Array} params.fields Array of field names for feature properties.
*/
export function wkt_properties(layer, features) {

  mapp.layer.featureFields.reset(layer);

  for (const feature of features) {

    const properties = {
      id: feature[0]
    }

    // Assign field key and value to properties object
    layer.params.fields?.forEach((field, i) => {

      layer.featureFields[field].values.push(feature[i + 1]);

      properties[field] = feature[i + 1]
    })

    layer.featuresObject[feature.shift()] = properties
  }

  mapp.layer.featureFields.process(layer);
}

export function cluster(layer, features) {

  layer.max_size = 1

  return features.map((vals, i) => {

    const geometry = new ol.geom.Point(vals.shift())

    const count = vals.shift()

    layer.max_size = layer.max_size > count ? layer.max_size : count;

    const id = vals.shift()

    const properties = { count }

    layer.params.fields.forEach((field, i) => {
      properties[field] = vals[i]
    })

    return new ol.Feature({
      id,
      geometry,
      ...properties
    })

  })
}
