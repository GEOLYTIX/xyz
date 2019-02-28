import assignBtn from './assignBtn.mjs';

export default _xyz => params => {

  // Remove existing Leaflet map object.
  if (_xyz.map) _xyz.map.remove();
    
  if (!params.target) return console.log('No target for mapview!');

  // Set XYZ map DOM.
  _xyz.mapview.node = params.target;  
    
  // Load locale if defined in params or if no locale is yet loaded.
  if (params.locale) _xyz.workspace.loadLocale(params);
                
  // Assign params to locale.
  // This makes it possible to override client side workspace entries.
  Object.assign(_xyz.workspace.locale, params);
    
  // Create Leaflet map object.
  _xyz.map = _xyz.L.map(_xyz.mapview.node, {
    renderer: _xyz.L.svg(),
    scrollWheelZoom: params.scrollWheelZoom || false,
    zoomControl: false,
    attributionControl: false
  });
    
  _xyz.mapview.changeEnd = () => {
           
    // Set view hooks when method is available.
    if (_xyz.hooks) {
      const center = _xyz.map.getCenter();

      _xyz.hooks.set({
        lat: center.lat,
        lng: center.lng,
        z: _xyz.map.getZoom()
      });
    }
          
    // Reload layers.
    // layer.get() will return if reload is not required.
    Object.values(_xyz.layers.list).forEach(layer => layer.get());
          
  };
    
  _xyz.mapview.btn = assignBtn(_xyz, params);
    
  // Create attribution in map DOM.
  _xyz.mapview.attribution.create();
        
  if(_xyz.workspace.locale.showScaleBar) {
    // Add scale bar to map
    L.control.scale().addTo(_xyz.map);
  }
        
  if(_xyz.workspace.locale.maskBounds) {
    // Grey out area outside bbox
    const world = [[90,180], [90,-180], [-90,-180], [-90,180]];
    const bbox = [
      [_xyz.workspace.locale.bounds.north, _xyz.workspace.locale.bounds.east],
      [_xyz.workspace.locale.bounds.north, _xyz.workspace.locale.bounds.west],
      [_xyz.workspace.locale.bounds.south, _xyz.workspace.locale.bounds.west],
      [_xyz.workspace.locale.bounds.south, _xyz.workspace.locale.bounds.east]
    ];
    const greyoutOptions = {
      pane: 'markerPane',  // polygon would be hidden under basemap (and thus pointless) if added to any lower pane
      stroke: false,
      fill: true,
      fillColor: '#ccc',  // grey
      fillOpacity: 0.8  // slightly transparent
    };
    _xyz.L.polygon([world, bbox], greyoutOptions).addTo(_xyz.map);  // Add polygon that covers the world but has a hole where bbox is
  }
        
  // Set min, max zoom and bounds.
  _xyz.map.setMinZoom(_xyz.workspace.locale.minZoom);
  _xyz.map.setMaxZoom(_xyz.workspace.locale.maxZoom);
  _xyz.map.setMaxBounds([[
    _xyz.workspace.locale.bounds.south,
    _xyz.workspace.locale.bounds.west
  ], [
    _xyz.workspace.locale.bounds.north,
    _xyz.workspace.locale.bounds.east
  ]]);
          
  // Set view if defined in workspace.
  _xyz.map.setView(
    [
      _xyz.workspace.locale.view.lat || 0,
      _xyz.workspace.locale.view.lng || 0
    ],
    _xyz.workspace.locale.view.z || 5);
          
  // Fire viewChangeEnd after map move and zoomend
  _xyz.map.on('moveend', () => viewChangeEndTimer());
  _xyz.map.on('zoomend', () => viewChangeEndTimer());
          
  // Use timeout to prevent the viewChangeEvent to be executed multiple times.
  let timer;
  function viewChangeEndTimer() {
    clearTimeout(timer);
    timer = setTimeout(_xyz.mapview.changeEnd, 500);
  }

  _xyz.mapview.popup = params => {

    if (!params || !params.latlng || !params.content) return;

    _xyz.L.popup({ closeButton: false })
      .setLatLng(params.latlng)
      .setContent(params.content)
      .openOn(_xyz.map);

  };
         
  const panes = {
    next: 500,
    list: []
  };
    
  Object.values(_xyz.layers.list).forEach(layer => {
    
    panes.list.push(_xyz.map.createPane(layer.key));
    _xyz.map.getPane(layer.key).style.zIndex = panes.next++;
    layer.loaded = false;
    layer.get();
      
  });
        
  panes.list.push(_xyz.map.createPane('gazetteer'));
  _xyz.map.getPane('gazetteer').style.zIndex = panes.next++;
    
  panes.list.push(_xyz.map.createPane('select_display'));
  _xyz.map.getPane('select_display').style.zIndex = panes.next++;
    
  panes.list.push(_xyz.map.createPane('select'));
  _xyz.map.getPane('select').style.zIndex = panes.next++;
    
  panes.list.push(_xyz.map.createPane('select_marker'));
  _xyz.map.getPane('select_marker').style.zIndex = panes.next++;
    
  panes.list.push(_xyz.map.createPane('select_circle'));
  _xyz.map.getPane('select_circle').style.zIndex = panes.next++;
    
  panes.list.push(_xyz.map.createPane('drawing'));
  _xyz.map.getPane('drawing').style.zIndex = panes.next++;
    
  panes.list.push(_xyz.map.createPane('default'));
  _xyz.map.getPane('default').style.zIndex = panes.next++;
    
};