export default function(params){

  const mapview = this

  mapview.interaction?.finish()

  const zoom = {

    finish: finish,

    Layer: new ol.layer.Vector({
      source: new ol.source.Vector()
    })
  }

  mapview.interaction = zoom

  zoom.callback = params.callback

  zoom.Layer.getSource().clear()

  mapview.Map.addLayer(zoom.Layer);

  mapview.Map.getTargetElement().style.cursor = 'zoom-in';

  zoom.interaction = new ol.interaction.Draw({
    source: zoom.Layer.getSource(),
    type: 'Circle',
    geometryFunction: ol.interaction.Draw.createBox(),
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#ddd',
        width: 1
      }),
      fill: new ol.style.Stroke({
        color: '#fff9'
      })
    })
  })

  zoom.interaction.on('drawend', e => {

    mapview.fitView(e.feature.getGeometry().getExtent())

    finish()
  })

  mapview.Map.addInteraction(zoom.interaction)

  function finish() {

    delete mapview.interaction

    if (zoom.callback) {
      zoom.callback()
      delete zoom.callback
    }

    mapview.Map.getTargetElement().style.cursor = 'auto';

    mapview.Map.removeInteraction(zoom.interaction)

    mapview.Map.removeLayer(zoom.Layer)

    zoom.Layer.getSource().clear()
  }
}