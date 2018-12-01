import _xyz from '../../../_xyz.mjs';

import d3_selection from 'd3-selection';

export default layer => {

  let width = layer.drawer.clientWidth;
      
  const svg = d3_selection
    .select(layer.style.legend)
    .append('svg')
    .attr('width', width);
  
  let y = 10;

  // Create array for NI (not in) value filter.
  layer.filter.legend[layer.style.theme.field] = {
    ni: []
  };

  Object.entries(layer.style.theme.cat).forEach(cat => {
           
    svg.append('image')
      .attr('x', 0)
      .attr('y', y)
      .attr('width', 20)
      .attr('height', 20)
      .attr('xlink:href', _xyz.utils.svg_symbols(Object.assign({}, layer.style.marker, cat[1])));
      
    svg.append('text')
      .attr('x', 25)
      .attr('y', y + 11)
      .style('font-size', '12px')
      .style('alignment-baseline', 'central')
      .style('cursor', 'pointer')
      .text(cat[1].label || '')
      .on('click', function () {
        if (this.style.opacity == 0.5) {
          this.style.opacity = 1;

          // Splice value out of the NI (not in) legend filter.
          layer.filter.legend[layer.style.theme.field].ni.splice(layer.filter.legend[layer.style.theme.field].ni.indexOf(cat[0]), 1);

        } else {
          this.style.opacity = 0.5;
          
          // Push value into the NI (not in) legend filter.
          layer.filter.legend[layer.style.theme.field].ni.push(cat[0]);
        }
      
        layer.get();
      });
      
    y += 20;
  });
      
  // Attach box for other/default categories.
  if (layer.style.theme.other) {
    svg.append('image')
      .attr('x', 0)
      .attr('y', y)
      .attr('width', 20)
      .attr('height', 20)
      .attr('xlink:href', _xyz.utils.svg_symbols(layer.style.marker));
      
    // Attach text with filter on click for the other/default category.
    svg.append('text')
      .attr('x', 25)
      .attr('y', y + 11)
      .style('font-size', '12px')
      .style('alignment-baseline', 'central')
      .style('cursor', 'pointer')
      .text('other')
      .on('click', function () {
        if (this.style.opacity == 0.5) {
          this.style.opacity = 1;

          // Empty IN values filter array.
          layer.filter.legend[layer.style.theme.field].in = [];
          
        } else {
          this.style.opacity = 0.5;
          
          // Assign all cat keys to IN filter.
          layer.filter.legend[layer.style.theme.field].in = Object.keys(layer.style.theme.cat);
        }
      
        layer.get();
      });
      
    y += 20;
  }
          
  // Add multi marker.
  svg.append('image')
    .attr('x', 0)
    .attr('y', y + 5)
    .attr('width', 40)
    .attr('height', 40)
    .attr('xlink:href', _xyz.utils.svg_symbols(layer.style.markerMulti));    
      
  svg.append('text')
    .attr('x', 44)
    .attr('y', y + 27)
    .style('font-size', '12px')
    .style('alignment-baseline', 'central')
    .style('cursor', 'pointer')
    .text('Multiple Locations');

  // Set height of the svg element.
  svg.attr('height', y + 50);    
      
};