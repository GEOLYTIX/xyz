import _xyz from '../../../_xyz.mjs';

import rectangle from './rectangle.mjs';

import circle from './circle.mjs';

// import line from './line.mjs';

import point from './point.mjs';

import catchment from './catchment.mjs';

import isoline from './isoline.mjs';

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

  if(layer.edit.isolines){

    // set defaults
    layer.edit.isolines = {
      type: 'fastest',
      rangetype: 'time'
    };

    let block = _xyz.utils.createElement({
      tag: 'div',
      options: {
        classList: 'block',
        padding: '5px'
      },
      appendTo: layer.edit.panel
    });

    _xyz.utils.dropdown({
      title: 'Transport mode',
      entries: {
        'Driving': 'car',
        'Walking': 'pedestrian',
        'Public transport': 'publicTransport',
        'Public transport live': 'publicTransportTimetable',
        'Cargo': 'truck',
        'High occupancy vehicle lane': 'carHOV',
        'Cycling': 'bicycle'
      },
      onchange: e => {
        layer.edit.isolines.mode = e.target.value;
      },
      appendTo: block
    });
    
    _xyz.utils.dropdown({
      title: 'Routing type',
      entries: {
        'Fastest': 'fastest',
        'Shortest': 'shortest'
      },
      onchange: e => {
        layer.edit.isolines.type = e.target.value;
      },
      appendTo: block
    });

    _xyz.utils.dropdown({
      title: 'Range type',
      entries: {
        'Time (min)': 'time',
        'Distance (km)': 'distance',
        'Consumption': 'consumption'
      },
      onchange: e => {
        layer.edit.isolines.rangetype = e.target.value;
      },
      appendTo: block
    });

    _xyz.utils.checkbox({
      label: 'Use live traffic data',
      onChange: e => {
        layer.edit.isolines.traffic = e.target.checked;
        console.log('if this is checked select departure time');
      },
      appendTo: block
    });

    _xyz.utils.slider({
      title: 'Range of isoline: ',
      min: 0, // 3 mins or 3 km
      max: 60, // 60 mins or 60 km
      value: 10,
      appendTo: block,
      oninput: e => {
        layer.edit.isolines.range = parseInt(e.target.value);
        e.target.parentNode.previousSibling.textContent = layer.edit.isolines.range;
      }
    });

    _xyz.utils.createStateButton({
      text: 'Isoline',
      appendTo: layer.edit.panel,
      layer: layer,
      activate: isoline,
      finish: finish
    });
    
  }

};