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
      textContent: 'Editing'
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

    layer.edit.isoline_mapbox.profile = layer.edit.isoline_mapbox.profile || 'driving';

    _xyz.utils.dropdown({
      title: 'Mode',
      label: 'label',
      val: 'val',
      selected: layer.edit.isoline_mapbox.profile,
      entries: [
        {
          label: 'Driving',
          val: 'driving'
        },
        {
          label: 'Walking',
          val: 'walking'
        },
        {
          label: 'Cycling',
          val: 'cycling'
        }
      ],
      onchange: e => {
        layer.edit.isoline_mapbox.profile = e.target.value;
      },
      appendTo: block
    });


    layer.edit.isoline_mapbox.minutes = layer.edit.isoline_mapbox.minutes || 10;

    _xyz.utils.slider({
      title: 'Travel time in minutes: ',
      default: layer.edit.isoline_mapbox.minutes,
      min: 5,
      max: 60,
      value: layer.edit.isoline_mapbox.minutes,
      appendTo: block,
      oninput: e => {
        layer.edit.isoline_mapbox.minutes = parseInt(e.target.value);
        e.target.parentNode.previousSibling.textContent = layer.edit.isoline_mapbox.minutes;
      }
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