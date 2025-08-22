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
  const formatGeojson = new ol.format.GeoJSON();

  mapp.layer.featureFields.reset(layer);

  return features.map((feature) => {
    // Populate featureFields values array with feature property values.
    layer.params.fields?.forEach((field) => {
      layer.featureFields[field].values.push(feature.properties[field]);
    });

    return new ol.Feature({
      geometry: formatGeojson.readGeometry(feature.geometry, {
        dataProjection: 'EPSG:' + layer.srid,
        featureProjection: 'EPSG:' + layer.mapview.srid,
      }),
      id: feature.id,
      ...feature.properties,
    });
  });
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

  const formatWKT = new ol.format.WKT();

  mapp.layer.featureFields.reset(layer);

  const olFeatures = features.map((feature) => {
    const properties = {};

    // Append params.fields to an array of id, and wkt_geometry which are the first and second entries in a wkt feature record.
    const wkt_fields = Array.from(
      new Set(['id', 'wkt_geometry', ...layer.params.fields]),
    );

    // Populate featureFields values array with feature property values.
    wkt_fields?.forEach((field, i) => {
      layer.featureFields[field]?.values?.push(feature[i]);

      properties[field] = feature[i];
    });

    const geometry = formatWKT.readGeometry(properties.wkt_geometry, {
      dataProjection: 'EPSG:' + layer.srid,
      featureProjection: 'EPSG:' + layer.mapview.srid,
    });

    // Return feature from geometry with properties.
    return new ol.Feature({
      geometry,
      ...properties,
    });
  });

  // Process featureFields for dynamic theming.
  mapp.layer.featureFields.process(layer);

  return olFeatures;
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
      id: feature[0],
    };

    // Assign field key and value to properties object
    layer.params.fields?.forEach((field, i) => {
      layer.featureFields[field].values.push(feature[i + 1]);

      properties[field] = feature[i + 1];
    });

    layer.featuresObject[feature.shift()] = properties;
  }

  mapp.layer.featureFields.process(layer);
}

/**
@function cluster

@description
The cluster function processes an array of feature data and returns an array of OpenLayers features to be added to the layer source.

It creates Point geometries from coordinate pairs, extracts count and ID information, and assigns additional properties based on the layer's field definitions.

The function also tracks the maximum count across all features in the layer.cluster.max_size property.

@param {layer} layer A layer object, likely an OpenLayers layer.
@param {Array} features An array of feature data, where each feature is represented as an array.
@property {layer-cluster} layer.cluster The vector layer cluster configuration.
@property {integer} cluster.max_size The length of features in the largest cluster feature.
@property {Object} layer.params
@property {Array} layer.params.fields Array of field names for additional feature properties.
@returns {Array} Array of OpenLayers Feature objects.
*/
export function cluster(layer, features) {
  layer.cluster.max_size = 1;

  return features.map((vals, i) => {
    const geometry = new ol.geom.Point(vals.shift());

    const count = vals.shift();

    layer.cluster.max_size =
      layer.cluster.max_size > count ? layer.cluster.max_size : count;

    const id = vals.shift();

    const properties = { count };

    layer.params.fields.forEach((field, i) => {
      properties[field] = vals[i];
    });

    return new ol.Feature({
      geometry,
      id,
      ...properties,
    });
  });
}
