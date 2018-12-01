import _xyz from '../../../_xyz.mjs';

import rectangle from './rectangle.mjs';

import circle from './circle.mjs';

// import line from './line.mjs';

import point from './point.mjs';

import catchment from './catchment.mjs';

import polygon from './polygon.mjs';

import finish from './finish.mjs';

export default layer => {

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
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
      }
    }
  });


  if(layer.edit.point) _xyz.utils.createStateButton({
    text: 'Point',
    appendTo: layer.edit.panel,
    layer: layer,
    activate: point,
    finish: finish
  });

  
  if(layer.edit.polygon) _xyz.utils.createStateButton({
    text: 'Polygon',
    appendTo: layer.edit.panel,
    layer: layer,
    activate: polygon,
    finish: finish
  });

  
  if(layer.edit.rectangle) _xyz.utils.createStateButton({
    text: 'Rectangle',
    appendTo: layer.edit.panel,
    layer: layer,
    activate: rectangle,
    finish: finish
  });


  if(layer.edit.circle) _xyz.utils.createStateButton({
    text: 'Circle',
    appendTo: layer.edit.panel,
    layer: layer,
    activate: circle,
    finish: finish
  });


  // if(layer.edit.line) _xyz.utils.createStateButton({
  //   text: 'Linestring',
  //   appendTo: layer.edit.panel,
  //   layer: layer,
  //   activate: line,
  //   finish: finish
  // });

  
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

    _xyz.utils.createStateButton({
      text: 'Catchment',
      appendTo: layer.edit.panel,
      layer: layer,
      activate: catchment,
      finish: finish
    });
  }

};