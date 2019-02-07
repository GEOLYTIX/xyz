import attribution from './attribution.mjs';

import locate from './locate.mjs';

import draw from './draw/_draw.mjs';

import assignBtn from './assignBtn.mjs';

export default _xyz => {

  _xyz.mapview.attribution = attribution(_xyz);

  _xyz.mapview.locate = locate(_xyz);

  draw(_xyz);

  _xyz.mapview.create = params => {

    // Remove existing Leaflet map object.
    if (_xyz.map) _xyz.map.remove();

    if (!params.target) return console.error('No target for mapview!');

    // Load locale first if not defined.
    if (!_xyz.workspace.locale) _xyz.workspace.loadLocale(params);
            
    // Assign params to locale.
    // This makes it possible to override client side workspace entries.
    Object.assign(_xyz.workspace.locale, params);

    // Set XYZ map DOM.
    _xyz.mapview.node = params.target;
    
    // Create Leaflet map object.
    _xyz.map = _xyz.L.map(_xyz.mapview.node, {
      renderer: _xyz.L.svg(),
      scrollWheelZoom: params.scrollWheelZoom || false,
      zoomControl: false,
      attributionControl: false
    });

    _xyz.mapview.changeEnd = () => {
       
      // Set view hooks when method is available.
      if (_xyz.hooks.setView) _xyz.hooks.setView(_xyz.map.getCenter(), _xyz.map.getZoom());
      
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
        _xyz.hooks.current.lat
            || _xyz.workspace.locale.view.lat
            || 0,
        _xyz.hooks.current.lng
            || _xyz.workspace.locale.view.lng
            || 0
      ],
      _xyz.hooks.current.z
          || _xyz.workspace.locale.view.z
          || 5);
      
    // Fire viewChangeEnd after map move and zoomend
    _xyz.map.on('moveend', () => viewChangeEndTimer());
    _xyz.map.on('zoomend', () => viewChangeEndTimer());
      
    // Use timeout to prevent the viewChangeEvent to be executed multiple times.
    let timer;
    function viewChangeEndTimer() {
      clearTimeout(timer);
      timer = setTimeout(_xyz.mapview.changeEnd, 500);
    }
     
    _xyz.panes.next = 500;

    _xyz.panes.list = [];

    Object.values(_xyz.layers.list).forEach(layer => {

      _xyz.panes.list.push(_xyz.map.createPane(layer.key));
      _xyz.map.getPane(layer.key).style.zIndex = _xyz.panes.next++;
      layer.loaded = false;
      layer.get();
  
    });
    
    _xyz.panes.list.push(_xyz.map.createPane('gazetteer'));
    _xyz.map.getPane('gazetteer').style.zIndex = _xyz.panes.next++;

    _xyz.panes.list.push(_xyz.map.createPane('select_display'));
    _xyz.map.getPane('select_display').style.zIndex = _xyz.panes.next++;

    _xyz.panes.list.push(_xyz.map.createPane('select'));
    _xyz.map.getPane('select').style.zIndex = _xyz.panes.next++;

    _xyz.panes.list.push(_xyz.map.createPane('select_marker'));
    _xyz.map.getPane('select_marker').style.zIndex = _xyz.panes.next++;

    _xyz.panes.list.push(_xyz.map.createPane('select_circle'));
    _xyz.map.getPane('select_circle').style.zIndex = _xyz.panes.next++;

    _xyz.panes.list.push(_xyz.map.createPane('drawing'));
    _xyz.map.getPane('drawing').style.zIndex = _xyz.panes.next++;

    _xyz.panes.list.push(_xyz.map.createPane('default'));
    _xyz.map.getPane('default').style.zIndex = _xyz.panes.next++;

  };

};