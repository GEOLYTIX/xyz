export default _xyz => params => {

  // Remove existing Leaflet map object.
  if (_xyz.map) _xyz.map.remove();

  // Load locale if defined in params or if no locale is yet loaded.
  if (!_xyz.workspace.locale || params.locale) _xyz.workspace.loadLocale(params);
    
  // Return if no target has been defined for the leaflet map control.
  if (!params.target) return console.log('No target for mapview!');

  _xyz.mapview.node = params.target;

  const z = (params.view && params.view.z) || _xyz.workspace.locale.view.z || 5;
    
  // Create Leaflet map object.
  _xyz.map = _xyz.mapview.lib.map(_xyz.mapview.node, {
    renderer: _xyz.mapview.lib.svg(),
    scrollWheelZoom: params.scrollWheelZoom || false,
    zoomControl: params.zoomControl || false,
    attributionControl: false,
    zoom: z,
    minZoom: _xyz.workspace.locale.minZoom,
    maxZoom: _xyz.workspace.locale.maxZoom,
    center: [
      (params.view && params.view.lat) || _xyz.workspace.locale.view.lat || 0,
      (params.view && params.view.lng) || _xyz.workspace.locale.view.lng || 0
    ],
    maxBounds: [[
      (params.bounds && params.bounds.south) || _xyz.workspace.locale.bounds.south,
      (params.bounds && params.bounds.west) || _xyz.workspace.locale.bounds.west
    ], [
      (params.bounds && params.bounds.north) || _xyz.workspace.locale.bounds.north,
      (params.bounds && params.bounds.east) || _xyz.workspace.locale.bounds.east
    ]]
  });

  // Create leaflet panes.
  _xyz.mapview.panes.create();

  // Create attribution in map DOM.
  _xyz.mapview.attribution.create(params.attribution);

  // Reload layers on change event.
  Object.values(_xyz.layers.list).forEach(layer => {
    _xyz.mapview.node.addEventListener('changeEnd', layer.get);
  });

  // Set the default state.
  _xyz.mapview.state = 'select';


  if(params.showScaleBar || _xyz.workspace.locale.showScaleBar) L.control.scale().addTo(_xyz.map);
  
  if(params.maskBounds || _xyz.workspace.locale.maskBounds) {

    // Grey out area outside bbox
    const world = [[90,180], [90,-180], [-90,-180], [-90,180]];

    const bbox = [
      [_xyz.workspace.locale.bounds.north, _xyz.workspace.locale.bounds.east],
      [_xyz.workspace.locale.bounds.north, _xyz.workspace.locale.bounds.west],
      [_xyz.workspace.locale.bounds.south, _xyz.workspace.locale.bounds.west],
      [_xyz.workspace.locale.bounds.south, _xyz.workspace.locale.bounds.east]
    ];

    const greyoutOptions = {
      pane: 'markerPane',
      stroke: false,
      fill: true,
      fillColor: '#ccc',
      fillOpacity: 0.8
    };

    _xyz.mapview.lib.polygon([world, bbox], greyoutOptions).addTo(_xyz.map);
  }

  // Event binding.
  // Fire viewChangeEnd after map move and zoomend
  _xyz.map.on('moveend', () => viewChangeEndTimer());
  _xyz.map.on('zoomend', () => viewChangeEndTimer());
         
  // Use timeout to prevent the viewChangeEvent to be executed multiple times.
  let timer;
  function viewChangeEndTimer() {
    clearTimeout(timer);
    timer = setTimeout(()=>_xyz.mapview.node.dispatchEvent(_xyz.mapview.changeEndEvent), 500);
  }
  
  // Set hooks on changeevent.
  if (_xyz.hooks) _xyz.mapview.node.addEventListener('changeEnd', ()=>{
    const center = _xyz.map.getCenter();
  
    _xyz.hooks.set({
      lat: center.lat,
      lng: center.lng,
      z: _xyz.map.getZoom()
    });
  });

  // Wire buttons to params targets.
  if (params.btn) {

    if (params.btn.ZoomIn) _xyz.mapview.btn._ZoomIn(params.btn.ZoomIn, z);
  
    if (params.btn.ZoomOut) _xyz.mapview.btn._ZoomOut(params.btn.ZoomOut, z);
  
    if (params.btn.Locate) _xyz.mapview.btn._Locate(params.btn.Locate);
  }
    
};