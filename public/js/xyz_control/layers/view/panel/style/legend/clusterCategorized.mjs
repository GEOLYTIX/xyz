export default _xyz => layer => {

  const _legend = layer.style.legend.appendChild(_xyz.utils.wire()
    `<svg 
    xmlns='http://www.w3.org/2000/svg'
    >`);
       
  let y = 10;

  // Create / empty legend filter when theme is applied.
  layer.filter.legend = {};

  // Create array for NI (not in) value filter.
  layer.filter.legend[layer.style.theme.field] = {
    ni: []
  };

  Object.entries(layer.style.theme.cat).forEach(cat => {

    let _image = _xyz.utils.wire(null, 'svg')
    `<image
      x=0
      width=20
      height=20
    >`;

    _image.setAttribute('y', y);
    _image.setAttribute('href', _xyz.utils.svg_symbols(Object.assign({}, layer.style.marker, cat[1].style)));

    _legend.appendChild(_image);

    let _text = _xyz.utils.wire(null, 'svg')
    `<text
    x=25
    style='font-size:12px; alignment-baseline:central; cursor:pointer;'
    >${cat[1].label || cat[0]}
    </text>`;

    _text.setAttribute('y', y + 13);

    _text.addEventListener('click', e => {
      
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

        // Push value into the NI (not in) legend filter.
        layer.filter.legend[layer.style.theme.field].ni.push(cat[0]);
      }

      layer.reload();
    
    });

    _legend.appendChild(_text);

    y += 23;
  });
      
  // Attach box for other/default categories.
  if (layer.style.theme.other) {

    let _image = _xyz.utils.wire(null, 'svg')
    `<image
      x=0
      width=20
      height=20
      />`;

    _image.setAttribute("y", y);
    _image.setAttribute('href', _xyz.utils.svg_symbols(layer.style.marker));

    _legend.appendChild(_image);

    let _text = _xyz.utils.wire(null, 'svg')
    `<text
    x=25
    style='font-size:12px; alignment-baseline:central; cursor:pointer;'
    >other
    </text>`;

    _text.setAttribute('y', y + 13);

    _text.addEventListener('click', e => {

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

        // Assign all cat keys to IN filter.
        layer.filter.legend[layer.style.theme.field].in = Object.keys(layer.style.theme.cat);
      }

      layer.reload();

    });

    y += 20;

    _legend.appendChild(_text);

  }

  let _imageMulti = _xyz.utils.wire(null, 'svg')
  `<image
  x=0
  width=40
  height=40
  />`;

  _imageMulti.setAttribute('y', y + 5);
  _imageMulti.setAttribute('href', _xyz.utils.svg_symbols(layer.style.markerMulti));

  _legend.appendChild(_imageMulti);

  let _textMulti = _xyz.utils.wire(null, 'svg')
    `<text
    x=44
    style='font-size:12px; alignment-baseline:central; cursor:pointer;'
    >Multiple Locations
    </text>`;

  _textMulti.setAttribute('y', y + 27);
  _legend.appendChild(_textMulti);
      
  _legend.style.height = `${y + 50}px`;

}
