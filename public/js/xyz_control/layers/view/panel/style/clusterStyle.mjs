export default (_xyz, layer, style, title) => {

  if(title) layer.style.legend.appendChild(_xyz.utils.wire()`<div class="title">${title}`);

  const block = {};

  block._ = _xyz.utils.wire()`<div class="block" style="font-size:13px;">`;

  layer.style.legend.appendChild(block._);

  block.fill_colour = _xyz.utils.wire()`<div style="padding-bottom: 10px;">Fill Colour `;

  block._.appendChild(block.fill_colour);

  block.fillColor = _xyz.utils.wire()`
  <span class="cursor colour-label"
  onclick=${
    e => {
      block.colorSelect = 'fillColor';
      block.colour_swatch.style.display = 'table';
    }
  }
  >${style.fillColor}`;

  block.fill_colour.appendChild(block.fillColor);

  block.sample = _xyz.utils.wire()`<div class="sample-circle">`;

  block.sample.style.backgroundColor = style.fillColor && _xyz.utils.Chroma(style.fillColor).alpha(1).hex();

  block._.appendChild(block.sample);

  block._.appendChild(_xyz.utils.wire()`<br>`);

  block.colour_swatch = _xyz.utils.wire()`
  <tr class="colour-swatch"
  style="display: none;"
  >`;

  block._.appendChild(block.colour_swatch);

  _xyz.defaults.colours.forEach(colour => {

    let _colour = _xyz.utils.wire()`
      <td class="colour-td"
      title="${colour.name};"
      onclick=${
        e => {

          block[block.colorSelect].textContent = colour.hex;

          style[block.colorSelect] = colour.hex;

          block.sample.style.backgroundColor = _xyz.utils.Chroma(style.fillColor).alpha(1).hex();

          block.colour_swatch.style.display = 'none';

          layer.reload();
        }
      }
      >`;

    _colour.style.backgroundColor = colour.hex;

    block.colour_swatch.appendChild(_colour);
    
  });

};