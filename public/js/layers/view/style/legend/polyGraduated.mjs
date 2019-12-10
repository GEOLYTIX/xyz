export default _xyz => layer => {

  if(!layer.style.theme.cat_arr) return;

  const legend = _xyz.utils.wire()`<div style="margin-top: 5px; display: grid; grid-template-columns: 30px auto;">`;

  layer.style.legend = legend;

  layer.style.theme.cat_arr.forEach(cat => {

    let image_container = _xyz.utils.wire()`<div style="height: 24px; width: 24px;">`;

    let svg = _xyz.utils.wire()`<svg>`;

    image_container.appendChild(svg);
           
    let cat_style = Object.assign({}, layer.style.default, cat.style || cat);

    svg.appendChild(_xyz.utils.wire(null, 'svg')`
      <rect
        x=4
        y=2
        width=14
        height=14
        fill=${cat_style.fillColor}
        fill-opacity=${cat_style.fillOpacity}
        stroke=${cat_style.strokeColor}/>`);

    legend.appendChild(image_container);

    let text = _xyz.utils.wire()`<div style="font-size:12px; alignment-baseline:central; cursor:default;">${cat.label || cat.value}`;

    legend.appendChild(text);

  });

  return legend;
};