export default _xyz => layer => {

  if(!layer.style.theme.cat_arr) return;

  const legend = layer.style.legend.appendChild(_xyz.utils.wire()
    `<svg 
    xmlns='http://www.w3.org/2000/svg'
    >`);

  let y = 10;

  layer.style.theme.cat_arr.forEach(cat => {

    let image = _xyz.utils.wire(null, 'svg')
    `<image
      x=0
      width=20
      height=20
    >`;

    image.setAttribute('y', y);
    image.setAttribute('href', _xyz.utils.svg_symbols(Object.assign({}, layer.style.marker, cat.style)));

    legend.appendChild(image);

    let text = _xyz.utils.wire(null, 'svg')
    `<text
    x=25
    style='font-size:12px; alignment-baseline:central;'
    >${cat.label || cat.style}
    </text>`;

    text.setAttribute('y', y + 13);

    legend.appendChild(text);
              
    y += 20;

  });
      
  // Set height of the svg element.
  legend.styleheight = y;
};

