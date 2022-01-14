export default _xyz => function () {

  const location = this

  location.Layer = _xyz.mapview.geoJSON({
    geometry: location.geometry,
    zIndex: 1999,
    style: _xyz.utils.style([{
        strokeColor: '#000',
        strokeOpacity: 0.1,
        strokeWidth: 8
      },
      {
        strokeColor: '#000',
        strokeOpacity: 0.1,
        strokeWidth: 6
      },
      {
        strokeColor: '#000',
        strokeOpacity: 0.1,
        strokeWidth: 4
      },
      {
        strokeColor: location.style.strokeColor || '#000',
        strokeWidth: 2,
        fillColor: location.style.fillColor || location.style.strokeColor || '#fff',
        fillOpacity: location.style.fillOpacity || 0.2
      }
    ]),
    dataProjection: location.layer.srid,
    featureProjection: _xyz.mapview.srid
  })

}