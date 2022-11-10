const _this = {}

export default function(params){

  Object.assign(_this, {

    mapview: this,

    type: 'modify',

    finish,
  
    format: new ol.format.GeoJSON(),

    Source: new ol.source.Vector(),
  
    vertices: [],

    contextMenu: mapp.ui?.elements.contextMenu.modify.bind(this),
  
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

  _this.mapview.interaction?.finish()

  // Set _this to be the current mapview interaction.
  _this.mapview.interaction = _this

  _this.mapview.Map.getTargetElement().style.cursor = 'crosshair'

  _this.Feature && _this.Source.addFeature(_this.Feature)

  _this.Layer = new ol.layer.Vector({
    source: _this.Source,
    zIndex: 9999,
    style: _this.Style,
  })
   
  _this.mapview.Map.addLayer(_this.Layer)
   
  _this.interaction = new ol.interaction.Modify({
    source: _this.Source,
    deleteCondition: e => {

      if (e.type === 'singleclick') {

        const geom = _this.Feature.getGeometry()

        const geomType = geom.getType()

        if (geomType === 'Point') return;

        const coords = geom.getCoordinates()

        // Return on point or line with 2 vertices.
        if (geomType === 'LineString' && coords.length < 3) return;

        // Return on polygon with less than 3 vertices.
        if (coords[0].length <= 4) return;
     
        // Set popup to remove vertex.
        _this.mapview.popup({
          coords: _this.Feature.getGeometry().getClosestPoint(e.coordinate),
          content: mapp.utils.html.node`<ul>
            <li
              onclick=${() => {
              _this.interaction.removePoint()
              _this.vertices.push(_this.Feature.getGeometry().getClosestPoint(e.coordinate))
            }}>${mapp.dictionary.delete_vertex}`
        })
      }
    }
  })

  // Will clear remove vertex popup.
  _this.interaction.on('modifystart', e => {
    _this.mapview.popup(null)
  })
  
  _this.interaction.on('modifyend', e => {

    _this.vertices.push(e.mapBrowserEvent.coordinate);

    // Execute custom modifyend method.
    if (_this.modifyend) return _this.modifyend(e, modify);

    typeof _this.contextMenu === 'function' && setTimeout(_this.contextMenu, 400)
  })
  
  // Add OL interaction to mapview.Map
  _this.mapview.Map.addInteraction(_this.interaction)

  _this.mapview.interactions.snap(_this)
 
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

    delete _this.mapview.interaction
  
    _this.callback && _this.callback(feature)
  
    _this.mapview.popup(null)

    _this.mapview.interactions.snap(null)
    
    _this.mapview.Map.removeInteraction(_this.interaction)
  
    _this.mapview.Map.removeLayer(_this.Layer)
  
    _this.Source.clear()
  
    _this.mapview.Map.getTargetElement().style.cursor = 'default'
  }

}