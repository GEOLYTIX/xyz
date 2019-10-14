_xyz({
  host: document.head.dataset.dir || new String(''),
  callback: init,
  hooks: true,
  locale: 'Drawful'
});

function init(_xyz) {

  _xyz.locations.select = location => {
    _xyz.locations.decorate(location);
    location.trash();
  };

  _xyz.mapview.create({
    target: document.getElementById('Map'),
    view: {
      lat: _xyz.hooks.current.lat,
      lng: _xyz.hooks.current.lng,
      z: _xyz.hooks.current.z || 2
    },
    scrollWheelZoom: true,
    showScaleBar: 'never'
  });

  _xyz.layers.list['Mapbox Base'].show();
  _xyz.layers.list['Draw'].show();

  const magicBtn = document.getElementById('Magic');

  const Hint = document.getElementById('Hint');

  function stopDrawing(){

    magicBtn.classList.remove('active');

    magicBtn.style.backgroundColor = '#FFFFFF';

    _xyz.mapview.interaction.draw.finish();

    _xyz.map.addInteraction(new _xyz.mapview.lib.interaction.DragPan());

    _xyz.map.addInteraction(new _xyz.mapview.lib.interaction.PinchZoom());

    _xyz.map.addInteraction(new _xyz.mapview.lib.interaction.PinchRotate());

    Hint.style.display = 'block';

  }

  magicBtn.onclick = () => {

    if (magicBtn.classList.contains('active')) return stopDrawing();

    Hint.style.display = 'none';

    _xyz.map.getInteractions().forEach(function (interaction) {
      if (interaction instanceof _xyz.mapview.lib.interaction.DragPan || interaction instanceof _xyz.mapview.lib.interaction.PinchZoom || interaction instanceof _xyz.mapview.lib.interaction.PinchRotate) {
        _xyz.map.removeInteraction(interaction);
      }
    }, this);
  
    magicBtn.classList.add('active');

    const cArr = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f']

    const color = cArr[Math.floor(Math.random() * cArr.length)];

    magicBtn.style.backgroundColor = color;

    _xyz.mapview.interaction.draw.begin({
      layer: _xyz.layers.list['Draw'],
      type: 'LineString',
      freehand: true,
      style: {
        strokeColor: color,
        strokeWidth: 2,
      },
      drawend: e => {

        const geoJSON = new _xyz.mapview.lib.format.GeoJSON();
      
        const feature = JSON.parse(
          geoJSON.writeFeature(
            e.feature,
            { 
              dataProjection: 'EPSG:' + _xyz.mapview.interaction.draw.layer.srid,
              featureProjection: 'EPSG:' + _xyz.mapview.srid
            })
        );
      
        const xhr = new XMLHttpRequest();
      
        xhr.open(
          'POST', 
          _xyz.host + 
                '/api/location/edit/draw?' +
                _xyz.utils.paramString({
                  locale: _xyz.workspace.locale.key,
                  layer: _xyz.mapview.interaction.draw.layer.key,
                  table: _xyz.mapview.interaction.draw.layer.table,
                  token: _xyz.token
                }));
        
        xhr.setRequestHeader('Content-Type', 'application/json');
                
        xhr.onload = e => {
            
          if (e.target.status !== 200) return;
                          
          _xyz.mapview.interaction.draw.layer.reload();
          
        };

        // Send path geometry to endpoint.
        xhr.send(JSON.stringify({
          geometry: feature.geometry,
          properties: {
            strokeColor: color
          }
        }));

        stopDrawing();

      }
    });

  }

}