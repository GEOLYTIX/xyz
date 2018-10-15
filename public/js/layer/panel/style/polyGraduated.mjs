//import _xyz from '../../../_xyz.mjs';

import d3_selection from 'd3-selection';

export default layer => {

  let width = layer.drawer.clientWidth;
  
  let
    svg = d3_selection
      .select(layer.style.panel)
      .append('svg')
      .attr('width', width),
    y = 10;
  
  layer.style.theme.cat.forEach(cat => {
  
    // two columns
    /*for (let i = 0; i < keys.length; i++) {
              y = i % 2 ? y : y += 25;
              x = i % 2 ? w / 2 + 15 : 15;
          }*/
  
    // Attach box for the style category.
    svg.append('rect')
      .attr('x', 4)
      .attr('y', y + 3)
      .attr('width', 14)
      .attr('height', 14)
      .style('fill', cat.style.fillColor)
      .style('fill-opacity', cat.style.fillOpacity)
      .style('stroke', cat.style.color);
  
    // Attach label with filter on click for the style category.
    svg.append('text')
      .attr('x', 25)
      .attr('y', y + 11)
      .style('font-size', '12px')
      .style('alignment-baseline', 'central')
      .style('cursor', 'pointer')
      .text(cat.label || '');
  
    y += 20;
  });
  
  // Set height of the svg element.
  svg.attr('height', y);
};