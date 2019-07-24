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

  const z = (params.view && params.view.z) || _xyz.workspace.locale.view.z || 5;

  const center = _xyz.mapview.lib.ol.proj.fromLonLat([
    parseFloat((params.view && params.view.lng) || _xyz.workspace.locale.view.lng || 0),
    parseFloat((params.view && params.view.lat) || _xyz.workspace.locale.view.lat || 0),
  ]);

     
  // Create Leaflet map object.
  _xyz.map = new _xyz.mapview.lib.ol.Map({
    target: _xyz.mapview.node,
    interactions: _xyz.mapview.lib.ol.interaction.defaults({ 
      mouseWheelZoom: params.scrollWheelZoom || false 
    }),
    controls: [],
    view: new _xyz.mapview.lib.ol.View({
      zoom: z,
      minZoom: _xyz.workspace.locale.minZoom,
      maxZoom: _xyz.workspace.locale.maxZoom,
      center: center,
      extent: _xyz.mapview.lib.ol.proj.transformExtent(
        [
          parseFloat((params.bounds && params.bounds.west) || _xyz.workspace.locale.bounds.west),
          parseFloat((params.bounds && params.bounds.south) || _xyz.workspace.locale.bounds.south),
          parseFloat((params.bounds && params.bounds.east) || _xyz.workspace.locale.bounds.east),
          parseFloat((params.bounds && params.bounds.north) || _xyz.workspace.locale.bounds.north),
        ],
        'EPSG:4326',
        'EPSG:3857'),
    })
  });

  // Set the default state.
  _xyz.mapview.state = 'select';
  
  _xyz.map.on('click', _xyz.mapview.select);

  _xyz.map.on('pointermove', _xyz.mapview.pointerMove);

  _xyz.mapview.node.addEventListener('mouseout', ()=>{
    _xyz.mapview.pointerLocation = {
      x: null,
      y: null
    };
    _xyz.mapview.clearHighlight();
  }, true);

  // Add scalebar.
  if(params.showScaleBar || _xyz.workspace.locale.showScaleBar) {
    _xyz.map.addControl(new _xyz.mapview.lib.ol.control.ScaleLine());
  }

  // Create attribution in map DOM.
  _xyz.mapview.attribution.create(params.attribution);

  // Reload layers on change event.
  Object.values(_xyz.layers.list).forEach(layer => {
    _xyz.mapview.node.addEventListener('changeEnd', layer.get);
  });


  if(params.maskBounds || _xyz.workspace.locale.maskBounds) {

    // Grey out area outside bbox
    const world = [
      _xyz.mapview.lib.ol.proj.transform([180, 90], 'EPSG:4326', 'EPSG:3857'),
      _xyz.mapview.lib.ol.proj.transform([180, -90], 'EPSG:4326', 'EPSG:3857'),
      _xyz.mapview.lib.ol.proj.transform([-180, -90], 'EPSG:4326', 'EPSG:3857'),
      _xyz.mapview.lib.ol.proj.transform([-180, 90], 'EPSG:4326', 'EPSG:3857'),
      _xyz.mapview.lib.ol.proj.transform([180, 90], 'EPSG:4326', 'EPSG:3857'),
    ];

    const bounds = [
      _xyz.mapview.lib.ol.proj.transform([_xyz.workspace.locale.bounds.east, _xyz.workspace.locale.bounds.north], 'EPSG:4326', 'EPSG:3857'),
      _xyz.mapview.lib.ol.proj.transform([_xyz.workspace.locale.bounds.east, _xyz.workspace.locale.bounds.south], 'EPSG:4326', 'EPSG:3857'),
      _xyz.mapview.lib.ol.proj.transform([_xyz.workspace.locale.bounds.west, _xyz.workspace.locale.bounds.south], 'EPSG:4326', 'EPSG:3857'),
      _xyz.mapview.lib.ol.proj.transform([_xyz.workspace.locale.bounds.west, _xyz.workspace.locale.bounds.north], 'EPSG:4326', 'EPSG:3857'),
      _xyz.mapview.lib.ol.proj.transform([_xyz.workspace.locale.bounds.east, _xyz.workspace.locale.bounds.north], 'EPSG:4326', 'EPSG:3857'),
    ];

    var maskFeature = new _xyz.mapview.lib.ol.Feature({
      geometry: new _xyz.mapview.lib.ol.geom.Polygon([world, bounds])
    });
  
    var maskLayer = new _xyz.mapview.lib.ol.layer.Vector({
      source: new _xyz.mapview.lib.ol.source.Vector({
        features: [maskFeature]
      }),
      style: new _xyz.mapview.lib.ol.style.Style({
        fill: new _xyz.mapview.lib.ol.style.Fill({
          color: _xyz.utils.hexToRGBA('#000000', 0.2, true)
        })
      }),
      zIndex: 999
    });


    _xyz.map.addLayer(maskLayer);
  }

  // Event binding.
  _xyz.map.on('moveend', () => viewChangeEndTimer());

         
  // Use timeout to prevent the viewChangeEvent to be executed multiple times.
  let timer;
  function viewChangeEndTimer() {
    clearTimeout(timer);
    timer = setTimeout(()=>_xyz.mapview.node.dispatchEvent(_xyz.mapview.changeEndEvent), 500);
  }
  
  // Set hooks on changeevent.
  if (_xyz.hooks) _xyz.mapview.node.addEventListener('changeEnd', ()=>{

    const center = _xyz.mapview.lib.ol.proj.transform(_xyz.map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326');
  
    _xyz.hooks.set({
      lat: center[1],
      lng: center[0],
      z: _xyz.map.getView().getZoom()
    });
  });

  // Wire buttons to params targets.
  if (params.btn) {

    if (params.btn.ZoomIn) _xyz.mapview.btn._ZoomIn(params.btn.ZoomIn, z);
  
    if (params.btn.ZoomOut) _xyz.mapview.btn._ZoomOut(params.btn.ZoomOut, z);
  
    if (params.btn.Locate) _xyz.mapview.btn._Locate(params.btn.Locate);
  }
    
};