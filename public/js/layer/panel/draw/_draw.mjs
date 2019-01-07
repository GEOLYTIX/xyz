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

  if(layer.edit.isoline){

    // set defaults
    layer.edit.isoline = {
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

    var row = _xyz.utils.createElement({
      tag: 'div',
      options: {
        classList: 'block'
      },
      appendTo: block
    });

    _xyz.utils.createElement({
      tag: 'div',
      options: {
        textContent: 'Transport mode'
      },
      style: {
        display: 'inline-block',
        width: '48%'
      },
      appendTo: row
    });

    _xyz.utils.dropdown({
      style: {
        width: '50%',
        display: 'inline-block'
      },
      label: 'label',
      val: 'val',
      entries: [
        {
          label: 'Driving',
          val: 'car'
        },
        {
          label: 'Walking',
          val: 'pedestrian'
        }/*,
        {
          label: 'Public transport',
          val: 'publicTransport'
        },
        {
          label: 'Public transport live',
          val: 'publicTransportTimetable'
        }*/,
        {
          label: 'Cargo',
          val: 'truck'
        },
        {
          label: 'HOV lane',
          val: 'carHOV'
        }/*,
        {
          label: "Cycling",
          val: 'bicycle'
        }*/
      ],
      onchange: e => {
        layer.edit.isoline.mode = e.target.value;
      },
      appendTo: row
    });

    row = _xyz.utils.createElement({
      tag: 'div',
      options: {
        classList: 'block'
      },
      appendTo: block
    });

    _xyz.utils.createElement({
      tag: 'div',
      options: {
        textContent: 'Routing type'
      },
      style: {
        display: 'inline-block',
        width: '48%'
      },
      appendTo: row
    });
    
    _xyz.utils.dropdown({
      //title: 'Routing type',
      style: {
        width: '50%',
        display: 'inline-block'
      },
      label: 'label',
      val: 'val',
      entries: [
        {
          label: 'Fastest',
          val: 'fastest'
        },
        {
          label: 'Shortest',
          val: 'shortest'
        }
      ],
      onchange: e => {
        layer.edit.isoline.type = e.target.value;
      },
      appendTo: row
    });

    row = _xyz.utils.createElement({
      tag: 'div',
      options: {
        classList: 'block'
      },
      appendTo: block
    });

    _xyz.utils.createElement({
      tag: 'div',
      options: {
        textContent: 'Range type'
      },
      style: {
        display: 'inline-block',
        width: '48%'
      },
      appendTo: row
    });

    _xyz.utils.dropdown({
      //title: 'Range type',
      style: {
        width: '50%',
        display: 'inline-block'
      },
      label: 'label',
      val: 'val',
      entries: [
        {
          label: 'Time (min)',
          val: 'time'
        },
        {
          label: 'Distance (km)',
          val: 'distance'
        }/*,
        {
          label: 'Consumption',
          val: 'consumption'
        }*/
      ],
      onchange: e => {
        layer.edit.isoline.rangetype = e.target.value;
      },
      appendTo: row
    });

    /*_xyz.utils.checkbox({
      label: 'Use live traffic data',
      onChange: e => {
        layer.edit.isoline.traffic = e.target.checked;
        console.log('if this is checked select departure time');
      },
      appendTo: block
    });*/

    _xyz.utils.slider({
      title: 'Range of isoline: ',
      min: 1, // 3 mins or 3 km
      max: 60, // 60 mins or 60 km
      default: 5,
      value: 10,
      appendTo: block,
      oninput: e => {
        layer.edit.isoline.range = parseInt(e.target.value);
        e.target.parentNode.previousSibling.textContent = layer.edit.isoline.range;
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