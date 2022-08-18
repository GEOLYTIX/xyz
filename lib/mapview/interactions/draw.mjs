export default function(params){

  // Assign params to the interaction object.
  const draw = Object.assign({

    // Interaction methods are bound to the mapview.
    mapview: this,

    srid: this.srid,

    type: 'draw',

    finish,

    getFeature,
  
    format: new ol.format.GeoJSON(),
  
    Layer: new ol.layer.Vector({
      source: new ol.source.Vector()
    }),

    // Bind context menu from mapp ui elements.
    contextMenu: mapp.ui?.elements.contextMenu.draw.bind(this),

    vertices: [],
  
    style: [
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

  // Finish the current interaction.
  draw.mapview.interaction?.finish()
  
  // Change cursor style for mapview element.
  draw.mapview.Map.getTargetElement().style.cursor = 'crosshair'
  
  // Add draw layer to mapview.
  draw.mapview.Map.addLayer(draw.Layer)
  
  // Create OL draw interaction.
  draw.interaction = new ol.interaction.Draw({
    source: draw.Layer.getSource(),
    geometryFunction: draw.geometryFunction,
    freehand: draw.freehand,
    type: draw.type,
    style: draw.style,
    condition: e => {

      // A vertice may not be set if kinks were detected on the geometry.
      if (draw.kinks) return false;

      if (e.originalEvent.buttons === 1) {
        draw.vertices.push(e.coordinate);
        draw.mapview.popup(null);
        
        draw.conditions?.forEach(fn => typeof fn === 'function' && fn(e))
        typeof draw.condition === 'function' && draw.condition(e)
        return true;
      }
    }
  })

  // Set drawstart event method.
  draw.interaction.on('drawstart', e => {

    const geometry = e.feature.getGeometry()

    async function onChange() {
      draw.mapview.popup({
        content: mapp.utils.html.node`
          <div style="padding: 5px">${await mapp.utils.convert(draw.mapview.metrics[draw.tooltip.metric](geometry), draw.tooltip)}`
      })
    }

    draw.tooltip && geometry.on('change', draw.tooltip.onChange || onChange)

    e.feature.setStyle(draw.style)

    draw.Layer.getSource().clear()

    draw.mapview.popup(null)
  })
  
  draw.interaction.on('drawend', e => {

    //draw.freehand && draw.vertices.push(e.target.sketchCoords_.pop());

    if (draw.drawend) return draw.drawend(e);

    typeof draw.contextMenu === 'function' && setTimeout(draw.contextMenu, 400);
  })

  // Assign draw as current interaction to mapview.
  draw.mapview.interaction = draw
  
  // Add OL interaction to mapview.Map
  draw.mapview.Map.addInteraction(draw.interaction)

  // Set snapSource.
  draw.mapview.snapSource(draw)

  typeof draw.contextMenu === 'function' && draw.mapview.Map.getTargetElement().addEventListener('contextmenu', draw.contextMenu)
 
  function getFeature() {
  
    // Get OL feature from draw.Layer source.
    const features = draw.Layer.getSource().getFeatures()
    
    // Return feature as geojson.
    return JSON.parse(
      draw.format.writeFeature(
        features[0],
        { 
          dataProjection: 'EPSG:' + draw.srid,
          featureProjection: 'EPSG:' + draw.mapview.srid
        })
    )
  }
  
  // Finish initeraction.
  function finish(feature) {

    // Remove interaction as current from mapview.
    delete draw.mapview.interaction
  
    // Execute callback if defined as function.
    typeof draw.callback === 'function' && draw.callback(feature)
  
    // Remove popup from mapview.
    draw.mapview.popup(null)
  
    // Remove context menu from mapview.
    typeof draw.contextMenu === 'function' && draw.mapview.Map.getTargetElement().removeEventListener('contextmenu', draw.contextMenu)

    // Remove snap source reference.
    draw.mapview.snapSource(null)
  
    // Remove interaction from OL Map.
    draw.mapview.Map.removeInteraction(draw.interaction)
  
    // Remove draw layer from mapview.
    draw.mapview.Map.removeLayer(draw.Layer)
  
    // Clear draw layer source.
    draw.Layer.getSource().clear()
  
    // Reset the cursor style.
    draw.mapview.Map.getTargetElement().style.cursor = 'default'
  }

}