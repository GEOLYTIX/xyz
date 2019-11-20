export default _xyz => layer => {

  const legend = _xyz.utils.wire()`<svg>`;

  layer.style.legend = legend;
       
  let y = 10;

  // Create / empty legend filter when theme is applied.
  layer.filter.legend = {};

  Object.entries(layer.style.theme.cat).forEach(cat => {

    let image = _xyz.utils.wire(null, 'svg')`
    <image x=0 width=20 height=20>`;

    image.setAttribute('y', y);
    image.setAttribute('href', _xyz.utils.svg_symbols(Object.assign({}, layer.style.marker, cat[1].style || cat[1])));

    legend.appendChild(image);

    let text = _xyz.utils.wire(null, 'svg')`
    <text
      style='font-size:12px; alignment-baseline:central; cursor:pointer;'
      x=25 >${cat[1].label || cat[0]}`;

    text.setAttribute('y', y + 13);

    text.addEventListener('click', e => {
      
      if(e.target.style.textDecoration === 'line-through'){
        e.target.style.textDecoration = 'none';
        e.target.style.opacity = 1;
        e.target.style.fillOpacity = 1;

        // Splice value out of the NI (not in) legend filter.
        layer.filter.legend[layer.style.theme.field].ni.splice(layer.filter.legend[layer.style.theme.field].ni.indexOf(cat[0]), 1);
      
      } else {
        e.target.style.textDecoration = 'line-through';
        e.target.style.opacity = 0.8;
        e.target.style.fillOpacity = 0.8;

        if(!layer.filter.legend[layer.style.theme.field]) {
          layer.filter.legend[layer.style.theme.field] = {};
          layer.filter.legend[layer.style.theme.field].ni = [];
        }
        
        // Push value into the NI (not in) legend filter.
        layer.filter.legend[layer.style.theme.field].ni.push(cat[0]);
      }

      layer.reload();
    
    });

    legend.appendChild(text);

    y += 23;
  });
      
  // Attach box for other/default categories.
  if (layer.style.theme.other) {

    let image = _xyz.utils.wire(null, 'svg')`
    <image x=0 width=20 height=20 />`;

    image.setAttribute('y', y);
    image.setAttribute('href', _xyz.utils.svg_symbols(layer.style.marker));

    legend.appendChild(image);

    let text = _xyz.utils.wire(null, 'svg')`
    <text
      style='font-size:12px; alignment-baseline:central; cursor:pointer;'
      x=25>other</text>`;

    text.setAttribute('y', y + 13);

    text.addEventListener('click', e => {

      if(e.target.style.textDecoration === 'line-through'){

        e.target.style.textDecoration = 'none';
        e.target.style.opacity = 1;
        e.target.style.fillOpacity = 1;

        // Empty IN values filter array.
        layer.filter.legend[layer.style.theme.field].in = [];
      
      } else {

        e.target.style.textDecoration = 'line-through';
        e.target.style.opacity = 0.8;
        e.target.style.fillOpacity = 0.8;

        if(!layer.filter.legend[layer.style.theme.field]) {
          layer.filter.legend[layer.style.theme.field] = {};
          layer.filter.legend[layer.style.theme.field].ni = [];
        }

        // Assign all cat keys to IN filter.
        layer.filter.legend[layer.style.theme.field].in = Object.keys(layer.style.theme.cat);
      }

      layer.reload();

    });

    y += 20;

    legend.appendChild(text);

  }

  let imageMulti = _xyz.utils.wire(null, 'svg')`
  <image x=0 width=40 height=40 />`;

  imageMulti.setAttribute('y', y + 5);
  imageMulti.setAttribute('href', _xyz.utils.svg_symbols(layer.style.markerMulti));

  legend.appendChild(imageMulti);

  let textMulti = _xyz.utils.wire(null, 'svg')`
  <text
    style='font-size:12px; alignment-baseline:central; cursor:pointer;'
    x=44>Multiple Locations</text>`;

  textMulti.setAttribute('y', y + 27);
  legend.appendChild(textMulti);
      
  legend.style.height = `${y + 50}px`;

  return legend;
};