export default _xyz => params => {
   
  if (!params.target) return console.log('No target for mapview!');

  _xyz.mapview.node = params.target;

  _xyz.mapview.srid = params.srid || '3857';

  const z = (params.view && params.view.z)
    || (_xyz.locale.view && _xyz.locale.view.z)
    || _xyz.locale.minZoom
    || 0;

  const center = ol.proj.fromLonLat([
    parseFloat((params.view && params.view.lng) || (_xyz.locale.view && _xyz.locale.view.lng) || 0),
    parseFloat((params.view && params.view.lat) || (_xyz.locale.view && _xyz.locale.view.lat) || 0),
  ]);

  const extent = params.bounds || _xyz.locale.bounds && ol.proj.transformExtent(
    [
      parseFloat((params.bounds && params.bounds.west) || _xyz.locale.bounds.west),
      parseFloat((params.bounds && params.bounds.south) || _xyz.locale.bounds.south),
      parseFloat((params.bounds && params.bounds.east) || _xyz.locale.bounds.east),
      parseFloat((params.bounds && params.bounds.north) || _xyz.locale.bounds.north),
    ],
    'EPSG:4326',
    'EPSG:' + _xyz.mapview.srid);

  _xyz.map = new ol.Map({
    target: _xyz.mapview.node,
    interactions: ol.interaction.defaults({ 
      mouseWheelZoom: params.scrollWheelZoom || false 
    }),
    controls: [],
    view: new ol.View({ 
      projection: 'EPSG:'+_xyz.mapview.srid,
      zoom: z,
      minZoom: _xyz.locale.minZoom,
      maxZoom: _xyz.locale.maxZoom,
      center: center,
      extent: extent
    })
  });

  // Set interaction break when map move starts.
  _xyz.map.on('movestart', () => _xyz.mapview.interaction.break = true);

  //_xyz.map.on('movestart', setTimeout(()=>_xyz.mapview.interaction.break = true, 500));

  _xyz.mapview.node.addEventListener('changeEnd', () => {

    Object.values(_xyz.layers.list).forEach(layer => {
      layer.display && layer._dataviews.forEach(dataview => dataview.update())
      if (layer.view && layer.tables) {
        layer.tableCurrent() === null ? layer.view.classList.add('disabled') : layer.view.classList.remove('disabled');
      }
    })

    if (_xyz.hooks) {
      const center = ol.proj.transform(
        _xyz.map.getView().getCenter(),
        'EPSG:' + _xyz.mapview.srid,
        'EPSG:4326');

      _xyz.hooks.set({
        lat: center[1],
        lng: center[0],
        z: _xyz.map.getView().getZoom()
      });
    }

    setTimeout(()=>delete _xyz.mapview.interaction.break, 500);
  })
   
  _xyz.mapview.interaction.highlight.begin();

  // Add zoomControl.
  if (params.zoomControl !== 'never' && (params.zoomControl || _xyz.locale.zoomControl)) {
    _xyz.map.addControl(new ol.control.Zoom());
  }

  // Create attribution in map DOM.
  params.attribution && _xyz.mapview.attribution.create(params.attribution);

  // Add scalebar.
  if (params.showScaleBar !== 'never' && (params.showScaleBar || _xyz.locale.showScaleBar)) {
      _xyz.map.addControl(new ol.control.ScaleLine({
          target: 'ol-scale'
      }));
  }


  if(params.maskBounds || _xyz.locale.maskBounds) {

    const world = [[180, 90], [180, -90], [-180, -90], [-180, 90], [180, 90]];

    const bounds = [
      [_xyz.locale.bounds.east, _xyz.locale.bounds.north],
      [_xyz.locale.bounds.east, _xyz.locale.bounds.south],
      [_xyz.locale.bounds.west, _xyz.locale.bounds.south],
      [_xyz.locale.bounds.west, _xyz.locale.bounds.north],
      [_xyz.locale.bounds.east, _xyz.locale.bounds.north],
    ];

    var maskFeature = new ol.Feature({
      geometry: new ol.geom
        .Polygon([world, bounds])
        .transform('EPSG:4326', 'EPSG:'+_xyz.mapview.srid)
    });
  
    var maskLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [maskFeature]
      }),
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: _xyz.utils.Chroma('#000').alpha(0.2).rgba()
        })
      }),
      zIndex: 999
    });


    _xyz.map.addLayer(maskLayer);
  }

  // Event binding.
  _xyz.map.on('moveend', viewChangeEndTimer);

  
  // Use timeout to prevent the viewChangeEvent to be executed multiple times.
  let timer;
  function viewChangeEndTimer() {
    clearTimeout(timer);
    timer = setTimeout(()=>{
      _xyz.mapview.node.dispatchEvent(_xyz.mapview.changeEndEvent)
    }, 500);
  }
  
  // Set layer visibility dependent on inclusion in current hooks
  if (_xyz.hooks && _xyz.hooks.current.layers.length) {
    Object.values(_xyz.layers.list).forEach(layer => {
      layer.display = !!~_xyz.hooks.current.layers.indexOf(layer.key);
    });
  }

  // Show visible layers.
  Object.values(_xyz.layers.list).forEach(layer => layer.display && layer.show())

};