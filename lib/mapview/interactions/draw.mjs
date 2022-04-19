export default function(params){

  const mapview = this

  mapview.interaction?.finish()

  const draw = Object.assign({

    type: 'draw',

    finish: finish,
  
    format: new ol.format.GeoJSON(),
  
    Layer: new ol.layer.Vector({
      source: new ol.source.Vector()
    }),

    contextMenu: mapp.ui?.elements.contextMenu.draw.bind(mapview),

    metricFunction,

    vertices: [],

    srid: mapview.srid,
  
    getFeature,

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
  
  mapview.Map.getTargetElement().style.cursor = 'crosshair'
   
  //delete draw.kinks
  
  mapview.Map.addLayer(draw.Layer)
  
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
        mapview.popup(null);
        
        typeof draw.condition === 'function' && draw.condition(e)
        return true;
      }
    }
  })

  draw.interaction.on('drawstart', e => {

    draw.tooltip && draw.metricFunction(e.feature.getGeometry(), draw.tooltip)

    e.feature.setStyle(draw.style)

    draw.Layer.getSource().clear()
    mapview.popup(null)
  })
  
  draw.interaction.on('drawend', e => {
    //draw.freehand && draw.vertices.push(e.target.sketchCoords_.pop());
    if (draw.drawend) return draw.drawend(e);
    typeof draw.contextMenu === 'function' && setTimeout(draw.contextMenu, 400);
  })

  // Set draw interaction on mapview
  mapview.interaction = draw
  
  mapview.Map.addInteraction(draw.interaction)



  if (draw.snap) {

    draw.snapSource = new ol.source.Vector()

    mapview.Map.on('pointermove', addToSnapSource);

    draw.snapInteraction = new ol.interaction.Snap({
      source: draw.snapSource
    })

    mapview.Map.addInteraction(draw.snapInteraction)
  }

  typeof draw.contextMenu === 'function' && mapview.Map.getTargetElement().addEventListener('contextmenu', draw.contextMenu)

  function addToSnapSource(e) {

    const geomSet = new Set()

    mapview.Map.forEachFeatureAtPixel(
      e.pixel,
      feature => {
        
        const geom = feature.getGeometry();

        if (geomSet.has(geom)) return;

        geomSet.add(geom)

        draw.snapSource.addFeature(new ol.Feature(geom))
      },
      {
        hitTolerance: 2,
      }
    );
  }

  function metricFunction(geometry, metric) {

    const metrics = {
      distance: () => ol.sphere.getLength(new ol.geom
          .LineString([geometry.getInteriorPoint().getCoordinates(), _xyz.mapview.position])),
      area: () => ol.sphere.getArea(geometry),
      length: () => ol.sphere.getLength(geometry),
    }
  
    if (!metrics[metric]) return;
  
    geometry.on('change', () => {
      mapview.popup({
        content: mapp.utils.html.node`
          <div style="padding: 5px">${parseInt(metrics[metric]()).toLocaleString('en-GB') + (metric === 'area' ? 'sqm' : 'm')}`
      })
    })
  }
  
  function getFeature() {
  
    const features = draw.Layer.getSource().getFeatures()
    
    return JSON.parse(
      draw.format.writeFeature(
        features[0],
        { 
          dataProjection: 'EPSG:' + draw.srid,
          featureProjection: 'EPSG:' + mapview.srid
        })
    )
  }
  
  function finish(feature) {

    delete mapview.interaction
  
    draw.callback && draw.callback(feature)
  
    mapview.popup(null)
  
    typeof draw.contextMenu === 'function' && mapview.Map.getTargetElement().removeEventListener('contextmenu', draw.contextMenu)

    if (draw.snapInteraction) {
      mapview.Map.un('pointermove', addToSnapSource);
      mapview.Map.removeInteraction(draw.snapInteraction)
      delete draw.snapInteraction
    }
  
    mapview.Map.removeInteraction(draw.interaction)
  
    mapview.Map.removeLayer(draw.Layer)
  
    draw.Layer.getSource().clear()
  
    mapview.Map.getTargetElement().style.cursor = 'default'
  }

}