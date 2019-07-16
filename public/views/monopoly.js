_xyz({
  host: document.head.dataset.dir,
  hooks: true,
  callback: _xyz => {
  
    _xyz.mapview.create({
      target: document.getElementById('Map'),
      scrollWheelZoom: true,
      view: {
        lat: _xyz.hooks.current.lat,
        lng: _xyz.hooks.current.lng,
        z: _xyz.hooks.current.z
      },
      btn: {
        Locate: document.getElementById('btnLocate'),
      }
    });

    // Select locations from hooks.
    _xyz.hooks.current.locations.forEach(hook => {
  
      let
        params = hook.split('!'),
        layer = _xyz.layers.list[decodeURIComponent(params[0])];
      
      _xyz.locations.select({
        locale: _xyz.workspace.locale.key,
        layer: layer.key,
        table: params[1],
        id: params[2],
        edit: layer.edit
      });
            
    });
  
    //_xyz.locations.select = location => gla_select(_xyz, location);
  
    
  }
});