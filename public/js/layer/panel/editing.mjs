import _xyz from '../../_xyz.mjs';
import { polygon } from './draw/_draw.mjs';
import { rect } from './draw/_draw.mjs';
import { circle } from './draw/_draw.mjs';

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
    //let _style = draw(layer);
    //console.log(_style);
  }


  _xyz.utils.createStateButton({
    text: 'Polygon',
    appendTo: panel,
    layer: layer,
    //fx: someFunction
    fx: polygon
  });

  _xyz.utils.createStateButton({
    text: 'Rectangle',
    appendTo: panel,
    layer: layer,
    //fx: someFunction
    fx: rect
  });


  _xyz.utils.createStateButton({
    text: 'Circle',
    appendTo: panel,
    layer: layer,
    fx: circle
    //fx: someFunction
  });

  _xyz.utils.createStateButton({
    text: 'Catchment',
    appendTo: panel,
    fx: someFunction
  });

};