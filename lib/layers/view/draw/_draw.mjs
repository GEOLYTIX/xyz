import point from './point.mjs';

import polygon from './polygon.mjs';

import rectangle from './rectangle.mjs';

import circle from './circle.mjs';

import line from './line.mjs';

import freehand from './freehand.mjs';

import isoline_mapbox from './isoline_mapbox.mjs';

import isoline_here from './isoline_here.mjs';

export default _xyz => {

const draw = {

    panel: panel,

    polygon: polygon(_xyz),

    point: point(_xyz),

    rectangle: rectangle(_xyz),

    circle: circle(_xyz),

    line: line(_xyz),

    freehand: freehand(_xyz),

    isoline_mapbox: isoline_mapbox(_xyz),

    isoline_here: isoline_here(_xyz),

};

return draw;

function panel(layer) {

    if (!layer.edit) return;
   
    const panel = _xyz.utils.html.node`
    <div class="drawer panel expandable">`;
  
    // Panel header
    panel.appendChild(_xyz.utils.html.node`
    <div
      class="header primary-colour"
      onclick=${e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent(e.target, true);
      }}><span>${_xyz.language.layer_add_new_location}</span><button
      class="btn-header xyz-icon icon-expander primary-colour-filter">`);
  
  
    layer.edit.point && panel.appendChild(draw.point(layer));
    
  
    layer.edit.polygon && panel.appendChild(draw.polygon(layer));
    
  
    layer.edit.rectangle && panel.appendChild(draw.rectangle(layer));
    
  
    layer.edit.circle && panel.appendChild(draw.circle(layer));
  
  
    layer.edit.line && panel.appendChild(draw.line(layer));
  
  
    layer.edit.freehand && panel.appendChild(draw.freehand(layer));  
  

    layer.edit.isoline_mapbox && panel.appendChild(draw.isoline_mapbox(layer));

    layer.edit.isoline_here && panel.appendChild(draw.isoline_here(layer));

    if (panel.children.length < 2) return;
  
    return panel;
  
  };

}