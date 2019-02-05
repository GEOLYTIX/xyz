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
    if (!_xyz.locale) _xyz.loadLocale(params);
            
    // Assign params to locale.
    // This makes it possible to override client side workspace entries.
    const locale = Object.assign({}, _xyz.ws.locales[_xyz.locale], params);

    // Set XYZ map DOM.
    _xyz.mapview.node = params.target;
    
    // Create Leaflet map object.
    _xyz.map = _xyz.L.map(_xyz.mapview.node, {
      renderer: _xyz.L.svg(),
      scrollWheelZoom: params.scrollWheelZoom || false,
      zoomControl: false,
      attributionControl: false
    });

    _xyz.mapview.btn = assignBtn(_xyz, params);

    // Create attribution in map DOM.
    _xyz.mapview.attribution.create();
    
    if(locale.showScaleBar) {
      // Add scale bar to map
      L.control.scale().addTo(_xyz.map);
    }
    
    if(locale.maskBounds) {
      // Grey out area outside bbox
      const world = [[90,180], [90,-180], [-90,-180], [-90,180]];
      const bbox = [[locale.bounds.north,locale.bounds.east], [locale.bounds.north,locale.bounds.west], [locale.bounds.south,locale.bounds.west], [locale.bounds.south,locale.bounds.east]];
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
    _xyz.map.setMinZoom(locale.minZoom);
    _xyz.map.setMaxZoom(locale.maxZoom);
    _xyz.map.setMaxBounds([[
      locale.bounds.south,
      locale.bounds.west
    ], [
      locale.bounds.north,
      locale.bounds.east
    ]]);
      
    // Set view if defined in workspace.
    _xyz.map.setView(
      [
        _xyz.hooks.current.lat
            || locale.view.lat
            || 0,
        _xyz.hooks.current.lng
            || locale.view.lng
            || 0
      ],
      _xyz.hooks.current.z
          || locale.view.z
          || 5);
      
    // Fire viewChangeEnd after map move and zoomend
    _xyz.map.on('moveend', () => viewChangeEndTimer());
    _xyz.map.on('zoomend', () => viewChangeEndTimer());
      
    // Use timeout to prevent the viewChangeEvent to be executed multiple times.
    let timer;
    function viewChangeEndTimer() {
      clearTimeout(timer);
      timer = setTimeout(_xyz.viewChangeEnd, 500);
    }
      
    _xyz.viewChangeEnd = () => {
    
      // Check whether zoom buttons should be disabled for initial view.
      if (_xyz.view.chkZoomBtn) _xyz.view.chkZoomBtn(_xyz.map.getZoom());
    
      // Set view hooks when method is available.
      if (_xyz.hooks.setView) _xyz.hooks.setView(_xyz.map.getCenter(), _xyz.map.getZoom());
      
      // Reload layers.
      // layer.get() will return if reload is not required.
      Object.values(_xyz.layers.list).forEach(layer => layer.get());
      
    };

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