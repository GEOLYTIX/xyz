let _this;

export default function(params){

  // Finish the current interaction.
  this.interaction?.finish()

  // The callback method from the previous call might have assigned another interaction.
  this.interaction?.finish()

  // Assign params onto the defaults as _this.
  _this = Object.assign({

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
    contextMenu: mapp.ui?.elements.contextMenu.draw.bind(this),

    vertices: [],

    // Whether the draw interaction event should be handled.
    condition: e => {

      // Right click
      if (e.originalEvent.buttons === 2) {

        // Remove last vertex.
        _this.interaction.removeLastPoint()
        _this.vertices.pop()

        const moveEvent = new ol.MapBrowserEvent('pointermove', _this.mapview.Map, e.originalEvent)
        _this.interaction.handleEvent(moveEvent)
        _this.interaction.handleEvent(moveEvent)
        return false;
      }

      // Left click.
      if (e.originalEvent.buttons === 1) {

        _this.vertices.push(e.coordinate);
        _this.mapview.popup(null);
        
        _this.conditions?.forEach(fn => typeof fn === 'function' && fn(e))
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

  // Set _this to be the current mapview interaction.
  _this.mapview.interaction = _this  
  
  // Change cursor style over mapview element.
  _this.mapview.Map.getTargetElement().style.cursor = 'crosshair'

  // Set _this.Layer source.
  _this.Layer.setSource(_this.source)
  
  // Add _this.Layer to mapview.
  _this.mapview.Map.addLayer(_this.Layer)
  
  // Create OL draw interaction.
  _this.interaction = new ol.interaction.Draw(_this)

  // Set drawstart event method.
  _this.interaction.on('drawstart', e => {

    // Get the draw feature geometry.
    const geometry = e.feature.getGeometry()

    async function onChange() {
      _this.mapview.popup({
        content: mapp.utils.html.node`
          <div style="padding: 5px">${await mapp.utils.convert(_this.mapview.metrics[_this.tooltip.metric](geometry), _this.tooltip)}`
      })
    }

    // Assign an onchange method to the geometry for the tooltip.
    _this.tooltip && geometry.on('change', _this.tooltip.onChange || onChange)

    // Clear the source
    _this.source.clear()

    // Remove the popup.
    _this.mapview.popup(null)
  })
  
  _this.interaction.on('drawend', () => {

    // Return with custom drawend function.
    if (typeof _this.drawend === 'function') {

      // A drawend method can be assigned to prevent the contextMenu.
      _this.drawend()
      return;
    }

    // Call contextMenu if defined as function.
    if (typeof _this.contextMenu === 'function') {
      _this.contextMenu()
    }
  })
  
  // Add OL interaction to mapview.Map
  _this.mapview.Map.addInteraction(_this.interaction)

  // Initiate snap for _this interaction.
  _this.snap && _this.mapview.interactions.snap(_this)
 
  // Get first feature from _this.source as GeoJSON.
  function getFeature() {
      
    // Return feature as geojson.
    return JSON.parse(
      _this.format.writeFeature(
        // Get first OL feature from source.
        _this.source.getFeatures()[0],
        { 
          // Use _this.srid as dataProjection if defined in params.
          dataProjection: 'EPSG:' + _this.srid || _this.mapview.srid,
          featureProjection: 'EPSG:' + _this.mapview.srid
        })
    )
  }
  
  function finish(feature) {

    // Set the current interaction to null.
    _this.mapview.interaction = null

    // Reset the cursor style.
    _this.mapview.Map.getTargetElement().style.cursor = 'default'    

    // Remove snap interaction from mapview.
    _this.snap && _this.mapview.interactions.snap(null)
  
    // Execute callback if defined as function.
    typeof _this.callback === 'function' && _this.callback(feature)
  
    // Remove popup from mapview.
    _this.mapview.popup(null)
    
    // Remove interaction from mapview.Map.
    _this.mapview.Map.removeInteraction(_this.interaction)
  
    // Remove draw Layer from mapview.Map.
    _this.mapview.Map.removeLayer(_this.Layer)
  }
}