const layerBase = new ol.layer.Tile({
  source: new ol.source.OSM({
    url: 'https://api.mapbox.com/styles/v1/dbauszus/ciozrimi3002bdsm8bjtn2v1y/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGJhdXN6dXMiLCJhIjoiY2pnZGsyaDhwMmpjaDMzbnBiNzJiaHR5NyJ9.C6zuLjG4Q3dmflE-LQZY4g',
    opaque: false,
    attributions: []
  })
});

const sourceMVT = new ol.source.VectorTile({
  cacheSize: 0,
  format: new ol.format.MVT(),
  url: 'http://localhost:3000/dev/api/layer/mvt/{z}/{x}/{y}?locale=GB&layer=Scratch&table=dev.scratch'
});
  
const layerMVT = new ol.layer.VectorTile({
  preload: 0,
  source: sourceMVT,
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

function clearTileCache() {
  //sourceMVT.tileCache.expireCache({});
  sourceMVT.clear();
  sourceMVT.tileCache.clear();
  sourceMVT.refresh();
}

const sourceVector = new ol.source.Vector();

const layerVector = new ol.layer.Vector({
  source: sourceVector,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#EE266D',
      width: 2
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 0, 0.01)'
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 0, 0.01)'
      }),
      stroke: new ol.style.Stroke({
        color: '#EE266D',
        width: 2
      })
    })
  })
});


const geoJSON = new ol.format.GeoJSON();

const map = new ol.Map({
  target: 'map',
  controls: [],
  interactions: [
    new ol.interaction.MouseWheelZoom(),
    new ol.interaction.DragPan()
  ],
  layers: [layerBase, layerMVT, layerVector],
  view: new ol.View({
    center: ol.proj.fromLonLat([-3, 55]),
    zoom: 6
  })
});


const modifyInteraction = new ol.interaction.Modify({
  source: sourceVector
});

modifyInteraction.on('modifyend', e => {

  const feature = JSON.parse(geoJSON.writeFeature(e.features.getArray()[0]));

  const xhr = new XMLHttpRequest();
      
  xhr.open('POST', 'http://localhost:3000/dev/api/location/edit/geom/update?locale=GB&layer=Scratch&table=dev.scratch&srid=3857&id=' + feature.properties.id);

  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = e => {

    if (e.target.status !== 200) return;
    
    clearTileCache();
  };
  
  xhr.send(JSON.stringify(feature.geometry));

});



let drawInteraction;

function drawEnd(e) {

  activeButton.classList.remove('active');

  const feature = JSON.parse(geoJSON.writeFeature(e.feature));

  currentFeature = e.feature;

  const xhr = new XMLHttpRequest();
      
  xhr.open('POST', 'http://localhost:3000/dev/api/location/edit/draw?locale=GB&layer=Scratch&table=dev.scratch&srid=3857');

  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = e => {

    if (e.target.status !== 200) return;

    currentFeature.set('id', e.target.response);

    map.removeInteraction(drawInteraction);

    clearTileCache();

    map.on('click', select);

    map.addInteraction(modifyInteraction);

    btnDelete.classList.add('active');

  };
  
  xhr.send(JSON.stringify({
    geometry: feature.geometry
  }));

}

let activeButton;

const btnPoly = document.getElementById('btnPoly');

btnPoly.onclick = () => drawMethod(btnPoly, 'Polygon');

const btnLine = document.getElementById('btnLine');

btnLine.onclick = () => drawMethod(btnLine, 'LineString');

const btnPoint = document.getElementById('btnPoint');

btnPoint.onclick = () => drawMethod(btnPoint, 'Point');

function drawMethod(btn, geometry) {

  if (activeButton) {
    activeButton.classList.remove('active');
    map.removeInteraction(drawInteraction);
  }

  btn.classList.add('active');

  activeButton = btn;

  map.removeInteraction(modifyInteraction);

  btnDelete.classList.remove('active');

  map.un('click', select);

  drawInteraction = new ol.interaction.Draw({
    source: sourceVector,
    type: geometry
  });

  drawInteraction.on('drawend', drawEnd);

  map.addInteraction(drawInteraction);

}

const btnDelete = document.getElementById('btnDelete');

btnDelete.onclick = function () {

  btnDelete.classList.remove('active');

  if (!currentFeature) return;

  const xhr = new XMLHttpRequest();

  xhr.open('GET', 'http://localhost:3000/dev/api/location/edit/delete?locale=GB&layer=Scratch&table=dev.scratch&id=' + currentFeature.getProperties().id);

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onload = e => {

    if (e.target.status !== 200) return;

    sourceVector.clear();

    clearTileCache();
  };

  xhr.send();
};
  
  


let currentFeature;
  
map.on('click', select);

function select(e) {

  sourceVector.clear();

  map.removeInteraction(drawInteraction);

  map.removeInteraction(modifyInteraction);

  btnDelete.classList.remove('active');
  
  const features = map.getFeaturesAtPixel(e.pixel);

  if (!features) return;

  currentFeature = features[0];

  const location = {
    id: features[0].getProperties().id
  };

  const xhr = new XMLHttpRequest();

  xhr.open('GET', 'http://localhost:3000/dev/api/location/select/id?locale=GB&layer=Scratch&table=dev.scratch&id=' + location.id);

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onload = e => {

    if (e.target.status !== 200) return;

    location.type = 'Feature';

    location.geometry = e.target.response.geomj;

    let feature = geoJSON.readFeature(location);

    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

    feature.set('id', location.id);

    sourceVector.addFeature(feature);

    map.addInteraction(modifyInteraction);

    btnDelete.classList.add('active');
   
  };

  xhr.send();
  
}
  


//map.on('pointermove', highlight);

var selection = {};
  
function highlight(e) {
  
  const features = map.getFeaturesAtPixel(e.pixel);
  
  if (!features) {
    selection = {};
    return layerMVT.setStyle(layerMVT.getStyle());
  }
  
  selection[features[0].getProperties().id] = features[0];
  
  layerMVT.setStyle(layerMVT.getStyle());
}