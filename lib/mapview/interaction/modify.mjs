export default _xyz => {

  const Modify = {

    begin: begin,

    //finish: finish,

    Source: new ol.source.Vector(),

    Style: new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        stroke: new ol.style.Stroke({
          color: '#3399CC',
          width: 2
        })
      })
    })

  }

  Modify.Layer = new ol.layer.Vector({
    source: Modify.Source,
    zIndex: 20,
    style: [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#3399CC',
          width: 1
        }),
      }),
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 6,
          stroke: new ol.style.Stroke({
            color: '#3399CC',
            width: 2
          })
        }),
        geometry: feature => {

          const geometry = feature.getGeometry()

          if (geometry.getType() === 'Point') return new ol.geom.Point(geometry.getCoordinates())

          if (geometry.getType() === 'LineString') return new ol.geom.MultiPoint(geometry.getCoordinates())

          // return the coordinates of the first ring of the polygon
          return new ol.geom.MultiPoint(geometry.getCoordinates()[0])
        }
      })
    ]
  })

  return Modify


  function begin(params) {

    if (!params.feature) return

    // Finish the current interaction.
    _xyz.mapview.interaction.current.finish && _xyz.mapview.interaction.current.finish();

    // Make modify the current interaction.
    _xyz.mapview.interaction.current = Modify

    Modify.finish = finish

    Modify.callback = params.callback;

    _xyz.mapview.node.style.cursor = 'crosshair';

    Modify.Source.addFeatures([params.feature])

    _xyz.map.addLayer(Modify.Layer);

    Modify.interaction = new ol.interaction.Modify({
      source: Modify.Source,
      style: Modify.Style
      // condition: e => {

      //   return !(Modify.trail && (_xyz.utils.turf.kinks(_xyz.utils.turf.flatten(Modify.trail).features[0]).features.length > 0));
      
      // }
    })
    
    _xyz.map.addInteraction(Modify.interaction);

  }

  function finish() {

    delete Modify.finish

    Modify.Source.clear()
      
    _xyz.map.removeLayer(Modify.Layer)
  
    _xyz.map.removeInteraction(Modify.interaction)
  
    Modify.callback && Modify.callback()

    _xyz.mapview.interaction.highlight.begin()

  }

}