export default (_xyz, layer) => {

  if (!layer.edit) return;

  if(layer.edit.properties && Object.keys(layer.edit).length === 1) return;

  if(layer.edit.properties && layer.edit.delete && Object.keys(layer.edit).length === 2) return;

  // Create cluster panel and add to layer dashboard.
  layer.edit.panel = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'panel expandable'
    },
    appendTo: layer.view.dashboard
  });

  // Panel title / expander.
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_text cursor noselect',
      textContent: 'Add new features'
    },
    appendTo: layer.edit.panel,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent({
          expandable: layer.edit.panel,
          accordeon: true,
          scrolly: _xyz.desktop && _xyz.desktop.listviews
        });
      }
    }
  });


  if(layer.edit.point) _xyz.utils.createStateButton(_xyz, {
    text: 'Point',
    appendTo: layer.edit.panel,
    layer: layer,
    activate: _xyz.geom.point,
    finish: _xyz.geom.finish
  });

  
  if(layer.edit.polygon) _xyz.utils.createStateButton(_xyz, {
    text: 'Polygon',
    appendTo: layer.edit.panel,
    layer: layer,
    activate: _xyz.geom.polygon,
    finish: _xyz.geom.finish
  });

  
  if(layer.edit.rectangle) _xyz.utils.createStateButton(_xyz, {
    text: 'Rectangle',
    appendTo: layer.edit.panel,
    layer: layer,
    activate: _xyz.geom.rectangle,
    finish: _xyz.geom.finish
  });


  if(layer.edit.circle) _xyz.utils.createStateButton(_xyz, {
    text: 'Circle',
    appendTo: layer.edit.panel,
    layer: layer,
    activate: _xyz.geom.circle,
    finish: _xyz.geom.finish
  });


  if(layer.edit.line) _xyz.utils.createStateButton(_xyz, {
    text: 'Linestring',
    appendTo: layer.edit.panel,
    layer: layer,
    activate: _xyz.geom.line,
    finish: _xyz.geom.finish
  });

  
  if(layer.edit.isoline_mapbox){

    if (typeof(layer.edit.isoline_mapbox) !== 'object') layer.edit.isoline_mapbox = {};   

    let block = _xyz.utils.createElement({
      tag: 'div',
      options: {
        classList: 'block'
      },
      appendTo: layer.edit.panel
    });

    _xyz.geom.isoline_mapbox_control({
      entry: layer,
      container: block
    });

    _xyz.utils.createStateButton(_xyz, {
      text: 'Isoline Mapbox',
      appendTo: layer.edit.panel,
      layer: layer,
      activate: _xyz.geom.isoline_mapbox,
      finish: _xyz.geom.finish
    });

  }


  if(layer.edit.isoline_here) {
    
    if (typeof(layer.edit.isoline_here) !== 'object') layer.edit.isoline_here = {};

    let block = _xyz.utils.createElement({
      tag: 'div',
      options: {
        classList: 'block'
      },
      appendTo: layer.edit.panel
    });

    _xyz.geom.isoline_here_control({entry: layer, container: block});

    _xyz.utils.createStateButton(_xyz, {
      text: 'Isoline Here',
      appendTo: layer.edit.panel,
      layer: layer,
      activate: _xyz.geom.isoline_here,
      finish: _xyz.geom.finish
    });
  
  }

};