export default _xyz => (layer, style, title) => {

  title && layer.style.legend.appendChild(_xyz.utils.wire()`
  <div class="title bold off-black secondary-colour-bb">${title}`);

  const block = {};

  block.node = _xyz.utils.wire()`<div class="block">`;

  layer.style.legend.appendChild(block.node);

  block.fill_colour = _xyz.utils.wire()`<div style="display: inline-block; width: 85%;">Fill Colour `;

  block.node.appendChild(block.fill_colour);

  block.fillColor = _xyz.utils.wire()`
  <span
    class="cursor primary-colour"
    onclick=${e => {
        block.colorSelect = 'fillColor';
        block.colour_swatch.style.display = 'table';
    }}>${style.fillColor}`;

  block.fill_colour.appendChild(block.fillColor);

  block.sample_wrapper = _xyz.utils.wire()`<div style="display: inline-block; padding-bottom: 5px;">`;

  block.node.appendChild(block.sample_wrapper);

  block.sample = _xyz.utils.wire()`<div class="sample-circle">`;

  block.sample.style.backgroundColor = style.fillColor && _xyz.utils.Chroma(style.fillColor).alpha(1).hex();

  block.sample_wrapper.appendChild(block.sample);

  //block.node.appendChild(block.sample);
  block.node.appendChild(block.sample_wrapper);

  block.node.appendChild(_xyz.utils.wire()`<br>`);

  block.colour_swatch = _xyz.utils.wire()`
  <tr
    style="width: 100%; margin-bottom: 10px; display: none;">`;

  block.node.appendChild(block.colour_swatch);

  _xyz.defaults.colours.forEach(colour => {

    block.colour_swatch.appendChild(_xyz.utils.wire()`
    <td
      title="${colour.name}"
      style="${'height: 20px; background-color:'+colour.hex}"
      onclick=${e => {

        block[block.colorSelect].textContent = colour.hex;

        style[block.colorSelect] = colour.hex;

        block.sample.style.backgroundColor = _xyz.utils.Chroma(style.fillColor).alpha(1).hex();

        block.colour_swatch.style.display = 'none';

        layer.reload();

      }}>`);
    
  });

};