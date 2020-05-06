export default _xyz => layer => {

  const legend = _xyz.utils.wire()`<div style="margin-top: 5px; display: grid; grid-template-columns: 30px auto;">`;

  layer.style.legend = legend;

  Object.entries(layer.style.theme.cat).forEach(cat => {

    let image_container = _xyz.utils.wire()`<div style="height: 24px; width: 24px;">`;

    let svg = _xyz.utils.wire()`<svg>`;

    image_container.appendChild(svg);

    let cat_style = Object.assign({}, layer.style.default, cat[1].style || cat[1]);

    if(cat_style.fillOpacity === undefined) {

      let line = _xyz.utils.wire(null, 'svg')`
      <line
        x1=4
        x2=18
        y1=10
        y2=10
        stroke=${cat_style.strokeColor}
        stroke-width=${cat_style.strokeWidth || 1}>`;

      svg.appendChild(line);
  
    } else {

      let rect = _xyz.utils.wire(null, 'svg')`
      <rect
        x=4
        y=2
        width=14
        height=14
        fill=${cat_style.fillColor || '#FFF'}
        fill-opacity=${cat_style.fillOpacity}
        stroke=${cat_style.strokeColor}
        stroke-width=${cat_style.strokeWidth || 1}>`;

      svg.appendChild(rect);
    } 

    legend.appendChild(image_container);

    legend.appendChild(_xyz.utils.wire()`
    <div
      style="font-size:12px; alignment-baseline:central; cursor:pointer;"
      class="switch"
      onclick=${e => {

        e.stopPropagation();
  
        if (e.target.style.textDecoration === 'line-through') {
            e.target.style.textDecoration = 'none';
            e.target.style.opacity = 1;
            e.target.style.fillOpacity = 1;
  
            // Splice value out of the NI (not in) legend filter.
            layer.filter.current[layer.style.theme.field].ni.splice(layer.filter.current[layer.style.theme.field].ni.indexOf(cat[0]), 1);
  
          } else {
            e.target.style.textDecoration = 'line-through';
            e.target.style.opacity = 0.8;
            e.target.style.fillOpacity = 0.8;
  
            if(!layer.filter.current[layer.style.theme.field]) {
              layer.filter.current[layer.style.theme.field] = {
                ni: []
              };
            }
            
            // Push value into the NI (not in) legend filter.
            layer.filter.current[layer.style.theme.field].ni.push(cat[0]);
          }
          layer.reload();
      }}>${cat[1].label || cat[0]}`);
      
  });
      
  // Attach box for other/default categories.
  if (layer.style.theme.other) {

    let image_container = _xyz.utils.wire()`<div style="height: 24px; width: 24px;">`;

    let svg = _xyz.utils.wire()`<svg>`;

    image_container.appendChild(svg);

    if(layer.style.default.fillOpacity === undefined) {

      let line = _xyz.utils.wire(null, 'svg')`
      <line
        x1=4
        x2=18
        y1=10
        y2=10
        stroke=${layer.style.default.strokeColor}
        stroke-width=${layer.style.default.strokeWidth || 1}>`;

      svg.appendChild(line);
  
    } else {

      let rect = _xyz.utils.wire(null, 'svg')`
      <rect
        x=4
        y=2
        width=14
        height=14
        fill=${layer.style.default.fillColor || '#FFF'}
        fill-opacity=${layer.style.default.fillOpacity}
        stroke=${layer.style.default.strokeColor}
        stroke-width=${layer.style.default.strokeWidth || 1}>`;

      svg.appendChild(rect);
    }

    legend.appendChild(image_container);

    legend.appendChild(_xyz.utils.wire()`
    <div
      style="font-size:12px; alignment-baseline:central; cursor:pointer;"
      class="switch"
      onclick=${e => {

        e.stopPropagation();
  
        if (e.target.style.textDecoration === 'line-through') {
          
          e.target.style.textDecoration = 'none';
          e.target.style.opacity = 1;
          e.target.style.fillOpacity = 1;
  
          // Empty IN values filter array.
          layer.filter.current[layer.style.theme.field].in = [];
  
        } else {
  
          e.target.style.textDecoration = 'line-through';
          e.target.style.opacity = 0.8;
          e.target.style.fillOpacity = 0.8;
  
          if(!layer.filter.current[layer.style.theme.field]) {
            layer.filter.current[layer.style.theme.field] = {
              ni: []
            };
          }
  
          // Assign all cat keys to IN filter.
          layer.filter.current[layer.style.theme.field].in = Object.keys(layer.style.theme.cat);
        }
  
        layer.reload();
  
      }}>other`);
      
  }

  return legend;
};