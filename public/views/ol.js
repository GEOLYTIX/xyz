const layerBase = new ol.layer.Tile({
  source: new ol.source.OSM({
    url: 'https://api.mapbox.com/styles/v1/dbauszus/ciozrimi3002bdsm8bjtn2v1y/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGJhdXN6dXMiLCJhIjoiY2pnZGsyaDhwMmpjaDMzbnBiNzJiaHR5NyJ9.C6zuLjG4Q3dmflE-LQZY4g',
    opaque: false,
    attributions: []
  })
});
  
const layerMVT = new ol.layer.VectorTile({
  source: new ol.source.VectorTile({
    format: new ol.format.MVT(),
    url: 'http://localhost:3000/dev/api/layer/mvt/{z}/{x}/{y}?locale=GB&layer=Scratch&table=dev.scratch'
  }),
  style: function(feature) {
    var selected = !!selection[feature.getProperties().id];
    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: selected ? '#cf9' : '#090',
        width: 2
      }),
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 0, 0)'
      }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: 'rgba(0, 0, 0, 0.01)'
        }),
        stroke: new ol.style.Stroke({
          color: selected ? '#cf9' : '#090',
          width: 2
        })
      })
    });
  }
});


// var vectorSource = new VectorSource({
//     features: (new GeoJSON()).readFeatures(geojsonObject)
//   });

//   vectorSource.addFeature(new Feature(new Circle([5e6, 7e6], 1e6)));


var source = new ol.source.Vector();
var vector = new ol.layer.Vector({
  source: source,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
      color: '#ffcc33',
      width: 2
    })
  })
});

const drawInteraction = new ol.interaction.Draw({
  source: source,
  type: 'Polygon'
});

const geoJSON = new ol.format.GeoJSON();

drawInteraction.on('drawend', e => {

  const feature = JSON.parse(geoJSON.writeFeature(e.feature));

  const xhr = new XMLHttpRequest();
      
  xhr.open('POST', 'http://localhost:3000/dev/api/location/edit/draw?locale=GB&layer=Scratch&table=dev.scratch&srid=3857');

  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = e => {

    if (e.target.status !== 200) return;

    layerMVT.getSource().changed(); 



    // layer.loaded = false;
    // layer.get();
          
    // // Select polygon when post request returned 200.
    // _xyz.locations.select({
    //   locale: _xyz.workspace.locale.key,
    //   layer: layer.key,
    //   table: layer.table,
    //   id: e.target.response,
    //   marker: marker,
    //   edit: layer.edit
    // });

  };

  console.log(feature.geometry);
  
  xhr.send(JSON.stringify({
    geometry: feature.geometry
  }));

});
 
  
const map = new ol.Map({
  target: 'map',
  controls: [],
  interactions: [
    new ol.interaction.MouseWheelZoom(),
    new ol.interaction.DragPan(),
    new ol.interaction.Modify({source: source}),
    drawInteraction
  ],
  layers: [layerBase, layerMVT, vector],
  view: new ol.View({
    center: ol.proj.fromLonLat([-3, 55]),
    zoom: 6
  })
});
  
  
var selection = {};
  
// map.on('click', e => select(e));
  
map.on('pointermove', e => select(e));
  
function select(e) {
  
  const features = map.getFeaturesAtPixel(e.pixel);
  
  if (!features) {
    selection = {};
    return layerMVT.setStyle(layerMVT.getStyle());
  }
  
  selection[features[0].getProperties().id] = features[0];
  
  layerMVT.setStyle(layerMVT.getStyle());
}