import _xyz from '../../../_xyz.mjs';

export default (layer, style, title) => {

  if (title) _xyz.utils.createElement({
    tag: 'div',
    options: {
      textContent: title,
      classList: 'block-title'
    },
    appendTo: layer.style.legend
  });

  const block = {};

  block._ = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'block'
    },
    appendTo: layer.style.legend
  });

  block.fill_colour = _xyz.utils.createElement({
    tag: 'div',
    options: {
      textContent: 'Fill Colour: ',
      classList: 'title'
    },
    appendTo: block._
  });

  block.fillColor = _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: style.fillColor,
      classList: 'cursor colour-label'
    },
    appendTo: block.fill_colour,
    eventListener: {
      event: 'click',
      funct: () => {

        block.colorSelect = 'fillColor';

        block.colour_swatch.style.display = 'table';
        
      }
    }
  });

  block.sample = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'sample-circle'
    },
    style: {
      'backgroundColor': _xyz.utils.hexToRGBA(style.fillColor, 1)
    },
    appendTo: block._
  });

  _xyz.utils.createElement({
    tag: 'br',
    appendTo: block._
  });

  block.colour_swatch = _xyz.utils.createElement({
    tag: 'tr',
    options: {
      classList: 'colour-swatch'
    },
    style: {
      display: 'none'
    },
    appendTo: block._
  });

  _xyz.style.defaults.colours.forEach(colour => {

    _xyz.utils.createElement({
      tag: 'td',
      options: {
        classList: 'colour-td',
        title: colour.name
      },
      style: {
        'backgroundColor': colour.hex
      },
      appendTo: block.colour_swatch,
      eventListener: {
        event: 'click',
        funct: () => {

          block[block.colorSelect].textContent = colour.hex;

          style[block.colorSelect] = colour.hex;

          block.sample.style.backgroundColor = _xyz.utils.hexToRGBA(style.fillColor, 1);

          block.colour_swatch.style.display = 'none';

          layer.get();
          
        }
      }
    });
    
  });

};