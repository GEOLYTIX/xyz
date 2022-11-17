export default (coordinates, layer, params) => {

  const geometry = new ol.geom.Circle(coordinates, params.minutes * 1000)

  const origin = ol.proj.transform(coordinates, `EPSG:${layer.mapview.srid}`, 'EPSG:4326')

  mapp.utils
    .xhr(`https://api.mapbox.com/isochrone/v1/mapbox/${params.profile}/${origin.join(',')}?${mapp.utils.paramString({
        contours_minutes: params.minutes,
        //generalize: params.minutes,
        polygons: true,
        access_token: params.access_token
      })}`)
    .then(response => {

      if (!response.features) return;

      const feature = layer.mapview.interaction.format.readFeature({
        type: 'Feature',
        geometry: response.features[0].geometry
      }, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:' + layer.mapview.srid
      })

      layer.mapview.interaction.source.clear();

      layer.mapview.interaction.source.addFeature(feature);

    })

  return geometry

}