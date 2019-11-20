export default _xyz => (layer, style, title) => {

  title && layer.style.legend.appendChild(_xyz.utils.wire()`
  <div class="title bold off-black secondary-colour-bb">${title}`);

  const block = {};

  block.node = _xyz.utils.wire()`<div class="block">`;

  layer.style.legend.appendChild(block.node);

  block.wrapper = _xyz.utils.wire()`<div style="display: inline-block; width: 65%;">`;

  block.node.appendChild(block.wrapper);

  block.stroke_color = _xyz.utils.wire()`<div>Stroke Colour `;

  //block.node.appendChild(block.stroke_color);
  block.wrapper.appendChild(block.stroke_color);

  block.strokeColor = _xyz.utils.wire()`
  <span
    class="cursor primary-colour"
    onclick=${e=>{
      block.colorSelect = 'strokeColor';  
      block.colour_swatch.style.display = 'table';
    }}>${style.strokeColor || '#ffffff'}`;

  block.stroke_color.appendChild(block.strokeColor);
    
  block.fill_colour = _xyz.utils.wire()`<div>Fill Colour `;

  //block.node.appendChild(block.fill_colour);
  block.wrapper.appendChild(block.fill_colour);

  block.fillColor = _xyz.utils.wire()`
  <span
    class="cursor primary-colour"
    onclick=${e=>{
      block.colorSelect = 'fillColor';  
      block.colour_swatch.style.display = 'table';
    }}>${style.fillColor || '#ffffff'}`;

  block.fill_colour.appendChild(block.fillColor);

  block.sample_poly = _xyz.utils.wire()`
  <div
    class="sample-poly"
    style="display: inline-block; ${'border:' + (style.strokeWidth || 1) + 'px solid ' + (style.strokeColor || '#ffffff')}">`;

  block.sample_poly.style.backgroundColor = style.fillColor;

  block.node.appendChild(block.sample_poly);


  block.colour_swatch = _xyz.utils.wire()`
  <tr
    style="width: 100%; margin-bottom: 10px; display: none">`;

  block.node.appendChild(block.colour_swatch);
  
  _xyz.defaults.colours.forEach(colour => {

    block.colour_swatch.appendChild(_xyz.utils.wire()`
    <td
      title=${colour.name}
      style="${'height: 20px; background-color:'+colour.hex}"
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

  block.node.appendChild(_xyz.utils.wire()`
  <div style="display: inline-block; width: 35%;">Stroke Weight`);

  block.node.appendChild(_xyz.utils.wire()`
  <div
    class="input-range"
    style="display: inline-block; width: 65%; padding-top:10px; padding-bottom:6px;">
    <input
      type="range"
      class="secondary-colour-bg"
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
          layer.reload();
        }, 500);

      }}>`);


  block.node.appendChild(_xyz.utils.wire()`
  <div style="display: inline-block; width: 35%;">Fill Opacity `);

  block.node.appendChild(_xyz.utils.wire()`
  <div
    class="input-range"
    style="display: inline-block; width: 65%; padding-top:10px; padding-bottom:6px;">
    <input
      type="range"
      class="secondary-colour-bg"
      min=0.1
      value=${style.fillOpacity || 1}
      max=1
      step=0.1
      oninput=${e=>{

        style.fillOpacity = e.target.value;

        clearTimeout(timeout);
        timeout = setTimeout(() => {
          timeout = null;
          layer.reload();
        }, 500);

      }}>`);

};