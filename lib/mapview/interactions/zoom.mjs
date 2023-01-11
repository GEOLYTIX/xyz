export default function(params){

  const mapview = this

  mapview.interaction?.finish()

  mapview.interaction = {

    finish: finish,

    Layer: new ol.layer.Vector({
      source: new ol.source.Vector()
    })
  }

  mapview.interaction.callback = params.callback

  mapview.interaction.Layer.getSource().clear()

  mapview.Map.addLayer(mapview.interaction.Layer);

  mapview.Map.getTargetElement().style.cursor = 'zoom-in';

  mapview.interaction.interaction = new ol.interaction.Draw({
    source: mapview.interaction.Layer.getSource(),
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

  mapview.interaction.interaction.on('drawend', e => {

    mapview.fitView(e.feature.getGeometry().getExtent())

    finish()
  })

  mapview.Map.addInteraction(mapview.interaction.interaction)

  function finish() {

    // Execute callback if defined as function.
    if (typeof mapview.interaction.callback === 'function') {

      // Must be run delayed to prevent a callback
      const callback = mapview.interaction.callback
      setTimeout(()=>callback(), 400)
    }

    mapview.Map.getTargetElement().style.cursor = 'auto';

    mapview.Map.removeInteraction(mapview.interaction.interaction)

    mapview.Map.removeLayer(mapview.interaction.Layer)

    mapview.interaction.Layer.getSource().clear()

    delete mapview.interaction
  }
}