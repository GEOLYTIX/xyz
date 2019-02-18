import drawIsoline from './drawIsoline.mjs';

export default (_xyz, layer) => {

  if(layer.edit.properties && Object.keys(layer.edit).length === 1) return;

  if(layer.edit.properties && layer.edit.delete && Object.keys(layer.edit).length === 2) return;

  // Create cluster panel and add to layer dashboard.
  layer.edit.panel = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'panel expandable'
    },
    appendTo: layer.dashboard
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
          scrolly: _xyz.desktop && _xyz.desktop.listviews,
        });
      }
    }
  });


  if(layer.edit.point) _xyz.utils.createStateButton(_xyz, {
    text: 'Point',
    appendTo: layer.edit.panel,
    layer: layer,
    activate: _xyz.mapview.draw.point,
    finish: _xyz.mapview.draw.finish
  });

  
  if(layer.edit.polygon) _xyz.utils.createStateButton(_xyz, {
    text: 'Polygon',
    appendTo: layer.edit.panel,
    layer: layer,
    activate: _xyz.mapview.draw.polygon,
    finish: _xyz.mapview.draw.finish
  });

  
  if(layer.edit.rectangle) _xyz.utils.createStateButton(_xyz, {
    text: 'Rectangle',
    appendTo: layer.edit.panel,
    layer: layer,
    activate: _xyz.mapview.draw.rectangle,
    finish: _xyz.mapview.draw.finish
  });


  if(layer.edit.circle) _xyz.utils.createStateButton(_xyz, {
    text: 'Circle',
    appendTo: layer.edit.panel,
    layer: layer,
    activate: _xyz.mapview.draw.circle,
    finish: _xyz.mapview.draw.finish
  });


  if(layer.edit.line) _xyz.utils.createStateButton(_xyz, {
    text: 'Linestring',
    appendTo: layer.edit.panel,
    layer: layer,
    activate: _xyz.mapview.draw.line,
    finish: _xyz.mapview.draw.finish
  });

  
  if(layer.edit.catchment){

    layer.edit.catchment = {};

    // add minute slider // add mode of transport
    let block = _xyz.utils.createElement({
      tag: 'div',
      options: {
        classList: 'block'
      },
      appendTo: layer.edit.panel
    });

    _xyz.utils.slider({
      title: 'Travel time in minutes: ',
      default: layer.edit.catchment.minutes || 5,
      min: 5,
      max: 60,
      value: 5,
      appendTo: block,
      oninput: e => {
        layer.edit.catchment.minutes = parseInt(e.target.value);
        e.target.parentNode.previousSibling.textContent = layer.edit.catchment.minutes;
      }
    });

    _xyz.utils.createStateButton(_xyz, {
      text: 'Catchment',
      appendTo: layer.edit.panel,
      layer: layer,
      activate: _xyz.mapview.draw.catchment,
      finish: _xyz.mapview.draw.finish
    });

  }


  if(layer.edit.isoline) {
    
    drawIsoline(_xyz, layer);

    _xyz.utils.createStateButton(_xyz, {
      text: 'Isoline',
      appendTo: layer.edit.panel,
      layer: layer,
      activate: _xyz.mapview.draw.isoline,
      finish: _xyz.mapview.draw.finish
    });
  
  }

};