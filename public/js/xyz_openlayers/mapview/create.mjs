export default _xyz => params => {

  // Remove existing Leaflet map object.
  if (_xyz.map) {
    _xyz.map.setTarget(null);
    _xyz.map = null;
  }

  // Load locale if defined in params or if no locale is yet loaded.
  if (!_xyz.workspace.locale || params.locale) _xyz.workspace.loadLocale(params);
    
  // Return if no target has been defined for the leaflet map control.
  if (!params.target) return console.log('No target for mapview!');

  _xyz.mapview.node = params.target;

  _xyz.mapview.srid = params.srid || '3857';

  const z = (params.view && params.view.z) || _xyz.workspace.locale.view.z || _xyz.workspace.locale.minZoom || 0;

  const center = _xyz.mapview.lib.proj.fromLonLat([
    parseFloat((params.view && params.view.lng) || _xyz.workspace.locale.view.lng || 0),
    parseFloat((params.view && params.view.lat) || _xyz.workspace.locale.view.lat || 0),
  ]);

     
  // Create Leaflet map object.
  _xyz.map = new _xyz.mapview.lib.Map({
    target: _xyz.mapview.node,
    interactions: _xyz.mapview.lib.interaction.defaults({ 
      mouseWheelZoom: params.scrollWheelZoom || false 
    }),
    controls: [],
    view: new _xyz.mapview.lib.View({ 
      projection: 'EPSG:'+_xyz.mapview.srid,
      zoom: z,
      minZoom: _xyz.workspace.locale.minZoom,
      maxZoom: _xyz.workspace.locale.maxZoom,
      center: center,
      extent: _xyz.mapview.lib.proj.transformExtent(
        [
          parseFloat((params.bounds && params.bounds.west) || _xyz.workspace.locale.bounds.west),
          parseFloat((params.bounds && params.bounds.south) || _xyz.workspace.locale.bounds.south),
          parseFloat((params.bounds && params.bounds.east) || _xyz.workspace.locale.bounds.east),
          parseFloat((params.bounds && params.bounds.north) || _xyz.workspace.locale.bounds.north),
        ],
        'EPSG:4326',
        'EPSG:' + _xyz.mapview.srid),
    })
  });

  _xyz.mapview.node.addEventListener('updatesize', ()=>_xyz.map.updateSize());


  _xyz.mapview.interaction.highlight.begin();

  // Add scalebar.
  if (params.zoomControl !== 'never' && (params.zoomControl || _xyz.workspace.locale.zoomControl)) {
    _xyz.map.addControl(new _xyz.mapview.lib.control.Zoom());
  }


  // Add scalebar.
  if (params.showScaleBar !== 'never' && (params.showScaleBar || _xyz.workspace.locale.showScaleBar)) {
    _xyz.map.addControl(new _xyz.mapview.lib.control.ScaleLine());
  }

  // Create attribution in map DOM.
  _xyz.mapview.attribution.create(params.attribution);


  if(params.maskBounds || _xyz.workspace.locale.maskBounds) {

    const world = [[180, 90], [180, -90], [-180, -90], [-180, 90], [180, 90]];

    const bounds = [
      [_xyz.workspace.locale.bounds.east, _xyz.workspace.locale.bounds.north],
      [_xyz.workspace.locale.bounds.east, _xyz.workspace.locale.bounds.south],
      [_xyz.workspace.locale.bounds.west, _xyz.workspace.locale.bounds.south],
      [_xyz.workspace.locale.bounds.west, _xyz.workspace.locale.bounds.north],
      [_xyz.workspace.locale.bounds.east, _xyz.workspace.locale.bounds.north],
    ];

    var maskFeature = new _xyz.mapview.lib.Feature({
      geometry: new _xyz.mapview.lib.geom
        .Polygon([world, bounds])
        .transform('EPSG:4326', 'EPSG:'+_xyz.mapview.srid)
    });
  
    var maskLayer = new _xyz.mapview.lib.layer.Vector({
      source: new _xyz.mapview.lib.source.Vector({
        features: [maskFeature]
      }),
      style: new _xyz.mapview.lib.style.Style({
        fill: new _xyz.mapview.lib.style.Fill({
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
    timer = setTimeout(()=>_xyz.mapview.node.dispatchEvent(_xyz.mapview.changeEndEvent), 500);
  }
  
  // Set hooks on changeevent.
  if (_xyz.hooks) {

    if (_xyz.hooks.current.layers.length > 0) {

      Object.values(_xyz.layers.list).forEach(layer => {

        layer.display = !!~_xyz.hooks.current.layers.indexOf(layer.key);
        layer.display && layer.show();
  
      });

    } else {

      Object.values(_xyz.layers.list).forEach(layer => layer.display && layer.show());

    }
    
    _xyz.mapview.node.addEventListener('changeEnd', ()=>{

      const center = _xyz.mapview.lib.proj.transform(
        _xyz.map.getView().getCenter(),
        'EPSG:' + _xyz.mapview.srid,
        'EPSG:4326');
  
      _xyz.hooks.set({
        lat: center[1],
        lng: center[0],
        z: _xyz.map.getView().getZoom()
      });
    });

  } else {

    Object.values(_xyz.layers.list).forEach(layer => {

      if (layer.display) layer.show();

    });
  
  }

  // Wire buttons to params targets.
  if (params.btn) {

    if (params.btn.ZoomIn) _xyz.mapview.btn._ZoomIn(params.btn.ZoomIn, z);
  
    if (params.btn.ZoomOut) _xyz.mapview.btn._ZoomOut(params.btn.ZoomOut, z);
  
    if (params.btn.Locate) _xyz.mapview.btn._Locate(params.btn.Locate);
  }
    
};