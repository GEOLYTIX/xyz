import _xyz from '../../../_xyz.mjs';

export default (layer, style, title) => {

  if (title) {

    _xyz.utils.createElement({
      tag: 'div',
      options: {
        textContent: title,
        classList: 'block-title'
      },
      appendTo: layer.style.legend
    });
    
  }

  const block = {};

  block._ = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'block'
    },
    appendTo: layer.style.legend
  });

  block.stroke_colour = _xyz.utils.createElement({
    tag: 'div',
    options: {
      textContent: 'Stroke Colour: ',
      classList: 'title'
    },
    appendTo: block._
  });

  block.color = _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: style.color,
      classList: 'cursor colour-label'
    },
    appendTo: block.stroke_colour,
    eventListener: {
      event: 'click',
      funct: () => {

        block.colorSelect = 'color';
        
        block.colour_swatch.style.display = 'table';
        
      }
    }
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

  block.sample_poly = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'sample-poly'
    },
    style: {
      'backgroundColor': _xyz.utils.hexToRGBA(style.fillColor, style.fillOpacity),
      'border': style.weight + 'px solid ' + style.color
    },
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

          block.sample_poly.style.backgroundColor = _xyz.utils.hexToRGBA(style.fillColor, style.fillOpacity);

          block.sample_poly.style.border = style.weight + 'px solid ' + style.color;

          block.colour_swatch.style.display = 'none';

          layer.get();
          
        }
      }
    });
    
  });


  _xyz.utils.createElement({
    tag: 'div',
    options: {
      textContent: 'Stroke Weight:',
      classList: 'title'
    },
    appendTo: block._
  });


  let timeout;

  block.stroke_slider = _xyz.utils.slider({
    min: 1,
    max: 5,
    appendTo: block._,
    oninput: e => {

      style.weight = e.target.value;

      // Set input value and apply filter.
      block.sample_poly.style.border = style.weight + 'px solid ' + style.color;

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;

        // Reload layer.
        layer.get();

      }, 500);

    }
  });
  block.stroke_slider.value = style.weight;


  _xyz.utils.createElement({
    tag: 'div',
    options: {
      textContent: 'Fill Opacity:',
      classList: 'title'
    },
    appendTo: block._
  });

  block.opacity_slider = _xyz.utils.slider({
    min: 0,
    max: 1,
    step: 0.1,
    appendTo: block._,
    oninput: e => {

      style.fillOpacity = e.target.value;

      // Set input value and apply filter.
      block.sample_poly.style.backgroundColor = _xyz.utils.hexToRGBA(style.fillColor, style.fillOpacity);

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;

        // Reload layer.
        layer.get();

      }, 500);

    }
  });
  block.opacity_slider.value = style.fillOpacity;

};