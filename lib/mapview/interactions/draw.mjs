export default function(params){

  const mapview = this;

  // Finish the current interaction.
  mapview.interaction?.finish()

  // Assign params onto the defaults as mapview.interaction.
  mapview.interaction = Object.assign({

    // Interactions are bound to the mapview as this.
    mapview: this,

    type: 'draw',

    finish,

    getFeature,
  
    format: new ol.format.GeoJSON(),

    source: new ol.source.Vector(),
  
    // The Layer is required for generated features such as isolines.
    Layer: new ol.layer.Vector(),

    // Bind context menu from mapp ui elements.
    drawend: mapp.ui?.elements.contextMenu.draw.bind(this),

    vertices: [],

    // Whether the draw interaction event should be handled.
    condition: e => {

      // Right click
      if (e.originalEvent.buttons === 2) {

        // Remove last vertex.
        mapview.interaction.interaction.removeLastPoint()
        mapview.interaction.vertices.pop()

        const moveEvent = new ol.MapBrowserEvent('pointermove', mapview.Map, e.originalEvent)
        mapview.interaction.interaction.handleEvent(moveEvent)
        mapview.interaction.interaction.handleEvent(moveEvent)
        return false;
      }

      // Left click.
      if (e.originalEvent.buttons === 1) {

        mapview.interaction.vertices.push(e.coordinate);
        mapview.popup(null);
        
        mapview.interaction.conditions?.forEach(fn => typeof fn === 'function' && fn(e))
        return true;
      }
    },
  
    // OL Style for sketch feature.
    style: [
      new ol.style.Style({
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

  // Set mapview.interaction to be the current mapview interaction.
  mapview.interaction = mapview.interaction  
  
  // Change cursor style over mapview element.
  mapview.Map.getTargetElement().style.cursor = 'crosshair'

  // Set mapview.interaction.Layer source.
  mapview.interaction.Layer.setSource(mapview.interaction.source)
  
  // Add mapview.interaction.Layer to mapview.
  mapview.Map.addLayer(mapview.interaction.Layer)
  
  // Create OL draw interaction.
  mapview.interaction.interaction = new ol.interaction.Draw(mapview.interaction)

  // Set drawstart event method.
  mapview.interaction.interaction.on('drawstart', e => {

    // Get the draw feature geometry.
    const geometry = e.feature.getGeometry()

    async function onChange() {
      mapview.popup({
        content: mapp.utils.html.node`
          <div style="padding: 5px">
          ${await mapp.utils.convert(
              // Get the geometry metric figure.
              mapview.metrics[mapview.interaction.tooltip.metric](geometry),

              // Options argument for conversion.
              mapview.interaction.tooltip)}`
      })
    }

    // Assign an onchange method to the geometry for the tooltip.
    mapview.interaction.tooltip && geometry.on('change', mapview.interaction.tooltip.onChange || onChange)

    // Clear the source
    mapview.interaction.source.clear()

    // Remove the popup.
    mapview.popup(null)
  })
  
  if (typeof mapview.interaction.drawend === 'function') {

    mapview.interaction.interaction.on('drawend', mapview.interaction.drawend)
  }
  
  // Add OL interaction to mapview.Map
  mapview.Map.addInteraction(mapview.interaction.interaction)

  // Assign snap interaction.
  mapview.interactions.snap(mapview)
 
  // Get first feature from mapview.interaction.source as GeoJSON.
  function getFeature() {
      
    // Return feature as geojson.
    return JSON.parse(
      mapview.interaction.format.writeFeature(
        // Get first OL feature from source.
        mapview.interaction.source.getFeatures()[0],
        { 
          // Use mapview.interaction.srid as dataProjection if defined in params.
          dataProjection: 'EPSG:' + mapview.interaction.layer?.srid || mapview.interaction.srid || mapview.srid,
          featureProjection: 'EPSG:' + mapview.srid
        })
    )
  }
  
  function finish(feature) {

    // Remove snap interaction from mapview.
    if (mapview.interaction.snap) {

      mapview.Map.removeInteraction(mapview.interaction.snap.interaction)

      // Remove loadend event MVT layer snapSource.
      if (mapview.interaction.layer.snapSource) {
        mapview.interaction.layer.snapSource.un('tileloadend', mapview.interaction.snap.tileloadend);
        mapview.Map.removeLayer(mapview.interaction.snap.vectorTileLayer)
      }
    }

    // Execute callback if defined as function.
    if (typeof mapview.interaction.callback === 'function') {

      // Must be run delayed to prevent a callback
      const callback = mapview.interaction.callback
      setTimeout(()=>callback(feature), 400)
    }

    // Reset the cursor style.
    mapview.Map.getTargetElement().style.cursor = 'default'
    
    // Remove popup from mapview.
    mapview.popup(null)
    
    // Remove interaction from mapview.Map.
    mapview.Map.removeInteraction(mapview.interaction.interaction)
  
    // Remove draw Layer from mapview.Map.
    mapview.Map.removeLayer(mapview.interaction.Layer)

    delete mapview.interaction
  }
}