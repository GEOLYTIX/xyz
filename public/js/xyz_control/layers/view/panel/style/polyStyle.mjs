export default (_xyz, layer, style, title) => {

  title && layer.style.legend.appendChild(_xyz.utils.wire()`
  <div class="title">${title}`);

  const block = {};

  block._ = _xyz.utils.wire()`<div class="block" style="font-size:13px;">`;

  layer.style.legend.appendChild(block._);


  block.stroke_color = _xyz.utils.wire()`<div style="padding-bottom: 10px;">Stroke Colour `;

  block._.appendChild(block.stroke_color);

  block.strokeColor = _xyz.utils.wire()`
  <span class="cursor colour-label"
  onclick=${e=>{
    block.colorSelect = 'strokeColor';  
    block.colour_swatch.style.display = 'table';
  }}>${style.strokeColor || '#ffffff'}`;

  block.stroke_color.appendChild(block.strokeColor);
  
  
  block.fill_colour = _xyz.utils.wire()`<div style="padding-bottom: 10px;">Fill Colour `;

  block._.appendChild(block.fill_colour);

  block.fillColor = _xyz.utils.wire()`
  <span class="cursor colour-label"
  onclick=${e=>{
    block.colorSelect = 'fillColor';  
    block.colour_swatch.style.display = 'table';
  }}>${style.fillColor || '#ffffff'}`;

  block.fill_colour.appendChild(block.fillColor);


  block.sample_poly = _xyz.utils.wire()`
  <div class="sample-poly"
  style="${'border:' + (style.strokeWidth || 1) + 'px solid ' + (style.strokeColor || '#ffffff')}">`;

  block.sample_poly.style.backgroundColor = style.fillColor;

  block._.appendChild(block.sample_poly);


  block.colour_swatch = _xyz.utils.wire()`<tr class="colour-swatch" style="display: none">`;

  block._.appendChild(block.colour_swatch);
  
  _xyz.defaults.colours.forEach(colour => {

    block.colour_swatch.appendChild(_xyz.utils.wire()`
    <td class="colour-td" title=${colour.name} style="${'background-color:'+colour.hex}"
    onclick=${e=>{
    block[block.colorSelect].textContent = colour.hex;

    style[block.colorSelect] = colour.hex;

    block.sample_poly.style.backgroundColor = style.fillColor;

    block.sample_poly.style.border = (style.strokeWidth || 1) + 'px solid ' + style.strokeColor;

    block.colour_swatch.style.display = 'none';

    layer.reload();

  }}>`);
    
  });


  let timeout;

  block._.appendChild(_xyz.utils.wire()`<div style="display: inline-block; width: 35%;">Stroke Weight`);

  block._.appendChild(_xyz.utils.wire()`
  <div class="range" style="display: inline-block; width: 65%;">
  <input
    type="range"
    min=1
    value=${style.strokeWidth || 1}
    max=5
    oninput=${e=>{

    style.strokeWidth = parseInt(e.target.value);

    // Set input value and apply filter.
    block.sample_poly.style.border = style.strokeWidth + 'px solid ' + style.strokeColor;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;

      // Reload layer.
      layer.reload();

    }, 500);

  }}>`);


  block._.appendChild(_xyz.utils.wire()`<div style="display: inline-block; width: 35%;">Fill Opacity `);

  block._.appendChild(_xyz.utils.wire()`
  <div class="range" style="display: inline-block; width: 65%;">
  <input
    type="range"
    min=0.1
    value=${style.fillOpacity || 1}
    max=1
    step=0.1
    oninput=${e=>{

    style.fillOpacity = e.target.value;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;

      // Reload layer.
      layer.reload();

    }, 500);

  }}>`);

};