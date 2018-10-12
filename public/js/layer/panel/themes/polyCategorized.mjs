//import _xyz from '../../../_xyz.mjs';

import d3_selection from 'd3-selection';

export default layer => {

  let width = layer.drawer.clientWidth;
      
  let svg = d3_selection
      .select(layer.legend)
      .append('svg')
      .attr('width', width),
    y = 10;
      
  Object.keys(layer.style.theme.cat).forEach(item => {
      
    // Attach box for the style category.
    svg.append('rect')
      .attr('x', 4)
      .attr('y', y + 3)
      .attr('width', 14)
      .attr('height', 14)
      .style('fill', layer.style.theme.cat[item].style.fillColor)
      .style('fill-opacity', layer.style.theme.cat[item].style.fillOpacity)
      .style('stroke', layer.style.theme.cat[item].style.color);
      
    // Attach label with filter on click for the style category.
    svg.append('text')
      .attr('x', 25)
      .attr('y', y + 11)
      .style('font-size', '12px')
      .style('alignment-baseline', 'central')
      .style('cursor', 'pointer')
      .text(layer.style.theme.cat[item].label || item)
      .on('click', function () {
        if (this.style.opacity == 0.5) {
          this.style.opacity = 1;
          //if(layer.style.theme.cat[item].style.stroke) {
          layer.style.theme.cat[item].style.stroke = true;
          //}
          layer.style.theme.cat[item].style.fill = true;
        } else {
          this.style.opacity = 0.5;
          layer.style.theme.cat[item].style.stroke = false;
          layer.style.theme.cat[item].style.fill = false;
        }
        layer.get();
      });
      
    y += 20;
  });
      
  // Attach box for other/default categories.
  if (layer.style.theme.other) {
    svg.append('rect')
      .attr('x', 4)
      .attr('y', y + 3)
      .attr('width', 14)
      .attr('height', 14)
      .style('fill', layer.style.default.fillColor)
      .style('fill-opacity', layer.style.default.fillOpacity)
      .style('stroke', layer.style.default.color);
      
    // Attach text with filter on click for the other/default category.
    svg.append('text')
      .attr('x', 25)
      .attr('y', y + 11)
      .style('font-size', '12px')
      .style('alignment-baseline', 'central')
      .text('other')
      .on('click', function () {
        if (this.style.opacity == 0.5) {
          this.style.opacity = 1;
          layer.style.default.stroke = true;
          layer.style.default.fill = true;
        } else {
          this.style.opacity = 0.5;
          layer.style.default.stroke = false;
          layer.style.default.fill = false;
        }
      
        layer.get();
      });
      
    y += 20;
  }
      
  // Set height of the svg element.
  svg.attr('height', y);
};