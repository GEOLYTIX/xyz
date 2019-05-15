export default _xyz => params => {

  // Remove existing Leaflet map object.
  if (_xyz.map) _xyz.map.remove();

  // Load locale if defined in params or if no locale is yet loaded.
  if (!_xyz.workspace.locale || params.locale) _xyz.workspace.loadLocale(params);
    
  // Return if no target has been defined for the leaflet map control.
  if (!params.target) return console.log('No target for mapview!');

  _xyz.mapview.node = params.target; 
    
  // Create Leaflet map object.
  _xyz.map = _xyz.L.map(_xyz.mapview.node, {
    renderer: _xyz.L.svg(),
    scrollWheelZoom: params.scrollWheelZoom || false,
    zoomControl: false,
    attributionControl: false
  });

  // Set the default state.
  _xyz.mapview.state = 'select';

  // Create attribution in map DOM.
  _xyz.mapview.attribution.create(params.attribution);

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

    _xyz.L.polygon([world, bbox], greyoutOptions).addTo(_xyz.map);
  }

  // Set z (min, max) and bounds.
  _xyz.map.setMinZoom(_xyz.workspace.locale.minZoom);
  _xyz.map.setMaxZoom(_xyz.workspace.locale.maxZoom);
  _xyz.map.setMaxBounds([[
    (params.bounds && params.bounds.south) || _xyz.workspace.locale.bounds.south,
    (params.bounds && params.bounds.west) || _xyz.workspace.locale.bounds.west
  ], [
    (params.bounds && params.bounds.north) || _xyz.workspace.locale.bounds.north,
    (params.bounds && params.bounds.east) || _xyz.workspace.locale.bounds.east
  ]]);

  const z = _xyz.workspace.locale.view.z || 5;
          
  // Set view if defined in workspace.
  _xyz.map.setView(
    [
      (params.view && params.view.lat) || _xyz.workspace.locale.view.lat || 0,
      (params.view && params.view.lng) || _xyz.workspace.locale.view.lng || 0
    ],
    (params.view && params.view.z) || z
  );

  // Event binding.
  // Fire viewChangeEnd after map move and zoomend
  _xyz.map.on('moveend', () => viewChangeEndTimer());
  _xyz.map.on('zoomend', () => viewChangeEndTimer());
          
  // Use timeout to prevent the viewChangeEvent to be executed multiple times.
  let timer;
  function viewChangeEndTimer() {
    clearTimeout(timer);
    timer = setTimeout(_xyz.mapview.changeEnd, 500);
  }

  // Wire buttons to params targets.
  if (params.btn) {

    if (params.btn.ZoomIn) _xyz.mapview.btn._ZoomIn(params.btn.ZoomIn, z);
  
    if (params.btn.ZoomOut) _xyz.mapview.btn._ZoomOut(params.btn.ZoomOut, z);
  
    if (params.btn.Locate) _xyz.mapview.btn._Locate(params.btn.Locate);
  }

  // Create leaflet panes.
  _xyz.mapview.panes.create();
    
};