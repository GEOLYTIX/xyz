export default _xyz => layer => {

  const legend = _xyz.utils.wire()`<div style="margin-top: 5px; display: grid; grid-template-columns: 30px auto;">`;

  layer.style.legend = legend;

  Object.entries(layer.style.theme.cat).forEach(cat => {

    let image_container = _xyz.utils.wire()`<div style="height: 24px; width: 24px;">`;

    let image = _xyz.utils.wire()`<img height=20 width=20>`;

    image.setAttribute('src', _xyz.utils.svg_symbols(Object.assign({}, layer.style.marker, cat[1].style || cat[1])));

    image_container.appendChild(image);

    legend.appendChild(image_container);

    legend.appendChild(_xyz.utils.wire()`
    <div
      style="font-size:12px; alignment-baseline:central; cursor:pointer;"
      class="switch"
      onclick=${e => {

        e.stopPropagation();
        
        if(e.target.style.textDecoration === 'line-through'){
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

    let image = _xyz.utils.wire(null, 'svg')`
    <image x=0 y=0 width=20 height=20>`;

    image.setAttribute('href', _xyz.utils.svg_symbols(layer.style.marker));

    svg.appendChild(image);

    image_container.appendChild(svg);

    legend.appendChild(image_container);

    legend.appendChild(_xyz.utils.wire()`
    <div
      style="font-size:12px; alignment-baseline:central; cursor:pointer;"
      class="switch"
      onclick=${e => {

        e.stopPropagation();
  
        if(e.target.style.textDecoration === 'line-through'){
  
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

  let imageMulti_container = _xyz.utils.wire()`<div style="height: 40px; width: 40px;">`;

  let imageMulti = _xyz.utils.wire()`<img height=40 width=40>`;

  imageMulti.setAttribute('src', _xyz.utils.svg_symbols(layer.style.markerMulti));

  imageMulti_container.appendChild(imageMulti);

  legend.appendChild(imageMulti_container);

  let textMulti = _xyz.utils.wire()`<div style="font-size:12px; alignment-baseline:central; cursor:default; margin-left: 20px; margin-top: 10px;">Multiple Locations`;

  legend.appendChild(textMulti);

  return legend;
};