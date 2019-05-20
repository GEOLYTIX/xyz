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

    layer.edit.isoline_here.mode = layer.edit.isoline_here.mode || 'car';

    _xyz.utils.dropdown({
      title: 'Mode',
      label: 'label',
      val: 'val',
      selected: layer.edit.isoline_here.mode,
      entries: [
        {
          label: 'Driving',
          val: 'car'
        },
        {
          label: 'Walking',
          val: 'pedestrian'
        },
        {
          label: 'Cargo',
          val: 'truck'
        },
        {
          label: 'HOV lane',
          val: 'carHOV'
        },
      ],
      onchange: e => {
        layer.edit.isoline_here.mode = e.target.value;
      },
      appendTo: block
    });



    _xyz.utils.dropdown({
      title: 'Range',
      label: 'label',
      val: 'val',
      selected: layer.edit.isoline_here.rangetype || 'time',
      entries: [
        {
          label: 'Time (min)',
          val: 'time'
        },
        {
          label: 'Distance (km)',
          val: 'distance'
        }
      ],
      onchange: e => {

        layer.edit.isoline_here.rangetype = e.target.value;

        if (e.target.value === 'time') {

          slider_here_minutes.style.display = 'block';
          slider_here_distance.style.display = 'none';

        }

        if (e.target.value === 'distance') {

          slider_here_minutes.style.display = 'none';
          slider_here_distance.style.display = 'block';

        }

      },
      appendTo: block
    });


    layer.edit.isoline_here.minutes = layer.edit.isoline_here.minutes || 10;

    const slider_here_minutes = _xyz.utils.createElement({
      tag: 'div',
      appendTo: block
    });

    _xyz.utils.slider({
      title: 'Travel time in minutes: ',
      default: layer.edit.isoline_here.minutes,
      min: 5,
      max: 60,
      value: layer.edit.isoline_here.minutes,
      appendTo: slider_here_minutes,
      oninput: e => {
        layer.edit.isoline_here.minutes = parseInt(e.target.value);
        e.target.parentNode.previousSibling.textContent = layer.edit.isoline_here.minutes;
      }
    });


    layer.edit.isoline_here.distance = layer.edit.isoline_here.distance || 10;

    const slider_here_distance = _xyz.utils.createElement({
      tag: 'div',
      style: {
        display: 'none'
      },
      appendTo: block
    });

    _xyz.utils.slider({
      title: 'Travel distance in kilometer: ',
      default: layer.edit.isoline_here.distance,
      min: 5,
      max: 60,
      value: layer.edit.isoline_here.distance,
      appendTo: slider_here_distance,
      oninput: e => {
        layer.edit.isoline_here.distance = parseInt(e.target.value);
        e.target.parentNode.previousSibling.textContent = layer.edit.isoline_here.distance;
      }
    });

    _xyz.utils.createStateButton(_xyz, {
      text: 'Isoline Here',
      appendTo: layer.edit.panel,
      layer: layer,
      activate: _xyz.geom.isoline_here,
      finish: _xyz.geom.finish
    });
  
  }

};