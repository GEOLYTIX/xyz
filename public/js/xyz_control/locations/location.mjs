import remove from './remove.mjs';

import draw from './draw.mjs';

import flyTo from './flyTo.mjs';

import update from './update.mjs';

import view from './view/_view.mjs';

export default _xyz => location => {

  location.remove = remove(_xyz);

  location.draw = draw(_xyz);
  
  location.flyTo = flyTo(_xyz);
  
  location.update = update(_xyz);

  location.view = view(_xyz);
    
  location.geometries = [];
  
  location.tables = [];
  
  location.style = Object.assign({
    color: '#090',
    stroke: true,
    fill: true,
    fillOpacity: 0,
    icon: {
      url: _xyz.utils.svg_symbols({
        type: 'circle',
        style: {
          color: '#090'
        }
      }),
      size: 40
    }
  }, location.style || {});

  return location;

};