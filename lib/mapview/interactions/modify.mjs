let _this;

export default function(params){
  
  // Finish the current interaction.
  this.interaction?.finish()

  _this = Object.assign({

    mapview: this,

    type: 'modify',

    finish,
  
    format: new ol.format.GeoJSON(),

    source: new ol.source.Vector(),

    Layer: new ol.layer.Vector({
      zIndex: Infinity
    }),
  
    vertices: [],

    modifyend: mapp.ui?.elements.contextMenu.modify.bind(this),
  
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
    ],

    deleteCondition: e => {

      if (e.type === 'singleclick') {

        const geom = _this.Feature.getGeometry()

        const geomType = geom.getType()

        if (geomType === 'Point') return;

        const coords = geom.getCoordinates()

        // Return on point or line with 2 vertices.
        if (geomType === 'LineString' && coords.length < 3) return;

        // Return on polygon with less than 3 vertices.
        if (geomType === 'Polygon' && coords[0].length <= 4) return;
     
        // Set popup to remove vertex.
        _this.mapview.popup({
          coords: geom.getClosestPoint(e.coordinate),
          content: mapp.utils.html.node`<ul>
            <li
              onclick=${() => {
              _this.interaction.removePoint()
              _this.vertices.push(_this.Feature.getGeometry().getClosestPoint(e.coordinate))
            }}>${mapp.dictionary.delete_vertex}`
        })
      }
    }

  }, params)

  // Set _this to be the current mapview interaction.
  _this.mapview.interaction = _this

  _this.mapview.Map.getTargetElement().style.cursor = 'crosshair'

  _this.source.addFeature(_this.Feature)
   
  // Set _this.Layer source.
  _this.Layer.setSource(_this.source)

  // Set _this.Layer style
  _this.Layer.setStyle(_this.Style)
  
  // Add _this.Layer to mapview.
  _this.mapview.Map.addLayer(_this.Layer)
   
  _this.interaction = new ol.interaction.Modify(_this)

  // Will clear remove vertex popup.
  _this.interaction.on('modifystart', e => {
    _this.mapview.popup(null)
  })

  if (typeof _this.modifyend === 'function') {

    _this.interaction.on('modifyend', _this.modifyend)
  }

  // Add OL interaction to mapview.Map
  _this.mapview.Map.addInteraction(_this.interaction)

  _this.snap && _this.mapview.interactions.snap(_this)
 
  function getFeature() {
     
    return JSON.parse(
      _this.format.writeFeature(
        _this.Feature,
        { 
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

    // Clear the modify source.
    _this.source.clear()
  
    // Remove draw Layer from mapview.Map.
    _this.mapview.Map.removeLayer(_this.Layer)
  }
}