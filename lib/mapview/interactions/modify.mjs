export default function(params){

  const mapview = this

  mapview.interaction?.finish()

  mapview.interaction?.type === 'highlight' && mapview.interaction.finish()

  const modify = Object.assign({

    type: 'modify',

    finish,
  
    format: new ol.format.GeoJSON(),

    Source: new ol.source.Vector(),
  
    vertices: [],

    srid: mapview.srid,

    contextMenu: mapp.ui?.elements.contextMenu.modify.bind(mapview),
  
    getFeature,

    Style: [
      new ol.style.Style({
        image: new ol.style.Circle({
          stroke: new ol.style.Stroke({
            color: '#3399CC',
            width: 1.25
          }),
          radius: 5
        }),
        stroke: new ol.style.Stroke({
          color: '#3399CC',
          width: 1.25
        })
      }),
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({
            color: '#eee',
          }),
          stroke: new ol.style.Stroke({
            color: '#3399CC',
            width: 1.25
          })
        }),
        geometry: mapp.utils.verticeGeoms
      })
    ]

  }, params)

  mapview.Map.getTargetElement().style.cursor = 'crosshair'

  modify.Feature && modify.Source.addFeature(modify.Feature)

  modify.Layer = new ol.layer.Vector({
    source: modify.Source,
    zIndex: 9999,
    style: modify.Style,
  })
   
  mapview.Map.addLayer(modify.Layer)
   
  modify.interaction = new ol.interaction.Modify({
    source: modify.Source,
    deleteCondition: e => {

      if (e.type === 'singleclick') {

        const geom = modify.Feature.getGeometry()

        const geomType = geom.getType()

        if (geomType === 'Point') return;

        const coords = geom.getCoordinates()

        // Return on point or line with 2 vertices.
        if (geomType === 'LineString' && coords.length < 3) return;

        // Return on polygon with less than 3 vertices.
        if (coords[0].length <= 4) return;
     
        // Set popup to remove vertex.
        mapview.popup({
          coords: modify.Feature.getGeometry().getClosestPoint(e.coordinate),
          content: mapp.utils.html.node`<ul>
            <li
              onclick=${() => {
              modify.interaction.removePoint()
              modify.vertices.push(modify.Feature.getGeometry().getClosestPoint(e.coordinate))
            }}>${mapp.dictionary.delete_vertex}`
        })
      }
    }
  })

  // Will clear remove vertex popup.
  modify.interaction.on('modifystart', e => {
    mapview.popup(null)
  })
  
  modify.interaction.on('modifyend', e => {

    modify.vertices.push(e.mapBrowserEvent.coordinate);

    // Execute custom modifyend method.
    if (modify.modifyend) return modify.modifyend(e, modify);

    typeof modify.contextMenu === 'function' && setTimeout(modify.contextMenu, 400)
  })

  // Set draw interaction on mapview
  mapview.interaction = modify
  
  mapview.Map.addInteraction(modify.interaction)

  // if (modify.snapSource) {
  //   modify.snapInteraction = new ol.interaction.Snap({
  //     source: modify.snapSource
  //   })

  //   mapview.Map.addInteraction(modify.snapInteraction)
  // }

  //typeof modify.contextMenu === 'function' && mapview.Map.getTargetElement().addEventListener('contextMenu', contextmenu)
 
  function getFeature() {
     
    return JSON.parse(
      modify.format.writeFeature(
        modify.Feature,
        { 
          dataProjection: 'EPSG:' + modify.srid,
          featureProjection: 'EPSG:' + mapview.srid
        })
    )
  }
  
  function finish(feature) {

    delete mapview.interaction
  
    modify.callback && modify.callback(feature)
  
    mapview.popup(null)
  
    //typeof modify.contextMenu === 'function' && mapview.Map.getTargetElement().removeEventListener('contextmenu', contextmenu)

    // if (modify.snapInteraction) {
    //   mapview.Map.removeInteraction(modify.snapInteraction)
    //   delete modify.snapInteraction
    // }
  
    mapview.Map.removeInteraction(modify.interaction)
  
    mapview.Map.removeLayer(modify.Layer)
  
    modify.Source.clear()
  
    mapview.Map.getTargetElement().style.cursor = 'default'
  }

}