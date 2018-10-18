import _xyz from '../../_xyz.mjs';
import { polygon } from './draw/_draw.mjs';
import { rect } from './draw/_draw.mjs';
import { circle } from './draw/_draw.mjs';
import { line } from './draw/_draw.mjs';
import { point } from './draw/_draw.mjs';

export default layer => {

  // Create cluster panel and add to layer dashboard.
  const panel = _xyz.utils.createElement({
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
    appendTo: panel,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent({
          expandable: panel,
          accordeon: true,
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
      }
    }
  });

  function someFunction(word){
    console.log(word);
  }

  if(layer.editing && layer.editing.point){
    _xyz.utils.createStateButton({
      text: 'Point',
      appendTo: panel,
      layer: layer,
      fx: point
    });
  }
  
  if(layer.editing && layer.editing.polygon){
    _xyz.utils.createStateButton({
      text: 'Polygon',
      appendTo: panel,
      layer: layer,
      fx: polygon
    });
  }
  
  if(layer.editing && layer.editing.rectangle){
    _xyz.utils.createStateButton({
      text: 'Rectangle',
      appendTo: panel,
      layer: layer,
      fx: rect
    });
  }
  
  if(layer.editing && layer.editing.circle){
    _xyz.utils.createStateButton({
      text: 'Circle',
      appendTo: panel,
      layer: layer,
      fx: circle
    });
  }

  if(layer.editing && layer.editing.line){
    _xyz.utils.createStateButton({
      text: 'Line',
      appendTo: panel,
      layer: layer,
      fx: line
    });
  }
  
  if(layer.editing && layer.editing.catchment){
    _xyz.utils.createStateButton({
      text: 'Catchment',
      appendTo: panel,
      fx: someFunction
    });
  }

};