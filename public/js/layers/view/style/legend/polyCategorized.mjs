export default _xyz => layer => {

  const legend = _xyz.utils.wire()`<svg>`;

  layer.style.legend = legend;
  
  let y = 10;

  // Create / empty legend filter when theme is applied.
  layer.filter.legend = {};

  // Create array for NI (not in) value filter.
  layer.filter.legend[layer.style.theme.field] = {
    ni: []
  };

  Object.entries(layer.style.theme.cat).forEach(cat => {

    let cat_style = Object.assign({}, layer.style.default, cat[1].style);

    if(cat_style.fillOpacity === undefined) {

      let line = _xyz.utils.wire(null, 'svg')`
      <line
        x1=4
        x2=18
        stroke=${cat_style.color}
        stroke-width=${cat_style.weight || 1}>`;

      line.setAttribute("y1", y + 10);
      line.setAttribute("y2", y + 10);

      legend.appendChild(line);
  
    } else {

      let rect = _xyz.utils.wire(null, 'svg')`
      <rect
        x=4
        width=14
        height=14
        fill=${cat_style.fillColor || '#FFF'}
        fill-opacity=${cat_style.fillOpacity}
        stroke=${cat_style.strokeColor}
        stroke-width=${cat_style.weight || 1}>`;

      rect.setAttribute("y", y + 3);

      legend.appendChild(rect);
      
    } 

    let text = _xyz.utils.wire(null, 'svg')`
    <text
      style='font-size:12px; alignment-baseline:central; cursor:pointer;'
      x=25>${cat[1].label || cat[0]}</text>`;

    text.setAttribute("y", y + 11);

    text.addEventListener('click', e => {
      if (e.target.style.textDecoration === 'line-through') {
          e.target.style.textDecoration = 'none';
          e.target.style.opacity = 1;
          e.target.style.fillOpacity = 1;

          // Splice value out of the NI (not in) legend filter.
          layer.filter.legend[layer.style.theme.field].ni.splice(layer.filter.legend[layer.style.theme.field].ni.indexOf(cat[0]), 1);

        } else {
          e.target.style.textDecoration = 'line-through';
          e.target.style.opacity = 0.8;
          e.target.style.fillOpacity = 0.8;
          
          // Push value into the NI (not in) legend filter.
          layer.filter.legend[layer.style.theme.field].ni.push(cat[0]);
        }
        layer.reload();
    });

    legend.appendChild(text);
      
    y += 20;
  });
      
  // Attach box for other/default categories.
  if (layer.style.theme.other) {

    if(layer.style.default.fillOpacity === undefined) {

      let line = _xyz.utils.wire(null, 'svg')`
      <line
        x1=4
        x2=18
        stroke=${layer.style.default.color}
        stroke-width=${layer.style.default.weight || 1}>`;

      line.setAttribute("y1", y + 10);
      line.setAttribute("y2", y + 10);
      legend.appendChild(line);
  
    } else {

      let rect = _xyz.utils.wire(null, 'svg')`
      <rect
        x=4
        width=14
        height=14
        fill=${layer.style.default.fillColor || '#FFF'}
        fill-opacity=${layer.style.default.fillOpacity}
        stroke=${layer.style.default.strokeColor}
        stroke-width=${layer.style.default.weight || 1}>`;

      rect.setAttribute("y", y + 3);
      legend.appendChild(rect);
    }

    // Attach text with filter on click for the other/default category.
    let text = _xyz.utils.wire(null, 'svg')`
    <text
      style='font-size:12px; alignment-baseline:central; cursor:pointer;'
      x=25>other</text>`;

    text.setAttribute("y", y + 11);

    text.addEventListener('click', e => {
      if (e.target.style.textDecoration === 'line-through') {
        e.target.style.textDecoration = 'none';
        e.target.style.opacity = 1;
        e.target.style.fillOpacity = 1;

        // Empty IN values filter array.
        layer.filter.legend[layer.style.theme.field].in = [];

      } else {
        e.target.style.textDecoration = 'line-through';
        e.target.style.opacity = 0.8;
        e.target.style.fillOpacity = 0.8;

        // Assign all cat keys to IN filter.
        layer.filter.legend[layer.style.theme.field].in = Object.keys(layer.style.theme.cat);
      }

      layer.reload();

    });

    legend.appendChild(text);
      
    y += 20;
  }

  // Set height of the svg element.
  legend.style.height = `${y}px`;

  return legend;
};