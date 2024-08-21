/**
### mapp.layer.featureFormats{}

@module /layer/featureFormats
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
The wkt featureFormat method processes an array of wkt features and returns a Openlayer features to be added to the layer source.

@param {layer} layer A decorated mapp layer object.
@param {array} features An array of WKT features.

@returns {array} Array of openlayers features.
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
