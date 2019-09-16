export default _xyz => layer => {

  if(!layer.style.theme.cat_arr) return;

  const legend = _xyz.utils.wire()`<svg>`;

  layer.style.legend.appendChild(legend);

  let y = 10;

  layer.style.theme.cat_arr.forEach(cat => {
           
    let cat_style = Object.assign({}, layer.style.default, cat.style);

    legend.appendChild(
      _xyz.utils.wire(null, 'svg')`
      <rect
        x=4
        y=${y+3}
        width=14
        height=14
        fill=${cat_style.fillColor}
        fill-opacity=${cat_style.fillOpacity}
        stroke=${cat_style.color}/>`
    );

    legend.appendChild(
      _xyz.utils.wire(null, 'svg')`
      <text
        x=25
        y=${y+11}
        style="font-size: 12px; dominant-baseline: central">
          ${cat.label || cat.value}`
    );

    y += 20;
  });
      
  // Set height of the svg element.
  //legend.setAttribute('height', y);

};