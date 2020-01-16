export default _xyz => layer => {

  if(!layer.style.theme.cat_arr) return;

  const legend = _xyz.utils.wire()`<div style="margin-top: 5px; display: grid; grid-template-columns: 30px auto;">`;

  layer.style.legend = legend;

  layer.style.theme.cat_arr.forEach(cat => {

    let image_container = _xyz.utils.wire()`<div style="height: 24px; width: 24px;">`;

    let image = _xyz.utils.wire()`<img width=20 height=20>`;

    image.setAttribute('src', _xyz.utils.svg_symbols(Object.assign({}, layer.style.marker, cat.style)));

    image_container.appendChild(image);

    legend.appendChild(image_container);

    let text = _xyz.utils.wire()`<div style="font-size:12px; alignment-baseline:central; cursor:default;">${cat.label || cat.style}`;

    legend.appendChild(text);

  });

  return legend;
};