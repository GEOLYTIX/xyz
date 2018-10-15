import _xyz from '../../../_xyz.mjs';

import d3_selection from 'd3-selection';

export default layer => {

  let width = layer.drawer.clientWidth;
      
  let
    svg = d3_selection
      .select(layer.style.panel)
      .append('svg')
      .attr('width', width),
    y = 10;
      
  if (!layer.style.theme.field) return;
      
  let _field = layer.style.theme.field;
      
  if (!layer.filter[_field]) layer.filter[_field] = {};
  if (!layer.filter[_field].in) layer.filter[_field].in = [];
  if (!layer.filter[_field].ni) layer.filter[_field].ni = [];
      
  Object.keys(layer.style.theme.cat).forEach(item => {
      
    // two columns
    /*for (let i = 0; i < keys.length; i++) {
                  y = i % 2 ? y : y += 25;
                  x = i % 2 ? w / 2 + 15 : 15;
              }*/
      
    // Attach box for the style category.
    svg.append('image')
      .attr('x', 0)
      .attr('y', y)
      .attr('width', 20)
      .attr('height', 20)
      .attr('xlink:href', _xyz.utils.svg_symbols(layer.style.theme.cat[item].marker));
      
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
          layer.filter[_field].ni.splice(layer.filter[_field].ni.indexOf(item), 1);
        } else {
          this.style.opacity = 0.5;
          //if(!layer.filter[_field]) layer.filter[_field] = {};
          //if(!layer.filter[_field].ni) layer.filter[_field].ni = [];
          layer.filter[_field].ni.push(item);
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
          //if(!layer.filter[_field]) layer.filter[_field] = {};
          layer.filter[_field].in = [];
        } else {
          this.style.opacity = 0.5;
          layer.filter[_field].in = Object.keys(layer.style.theme.cat);
        }
      
        layer.get();
      });
      
    y += 20;
  }
      
  y += 25;
      
  // Add markerMulti default colour if not set.
  if (!layer.style.markerMulti) layer.style.markerMulti = {type: 'target', style: [400, '#333']};
      
  // Add section for clusters and competitors title
      
  svg.append('circle')
    .attr('cx', 20)
    .attr('cy', y)
    .attr('r', 18)
    .attr('fill', layer.style.markerMulti.style[1]);
      
      
  svg.append('text')
    .attr('x', 44)
    .attr('y', y)
    .style('font-size', '12px')
    .style('alignment-baseline', 'central')
    .style('cursor', 'pointer')
    .text('Multiple Locations');
      
  if (layer.style.theme.competitors) {
      
    let competitors = Object.keys(layer.style.theme.competitors),
      n = competitors.length,
      i = 0;
      
    competitors.reverse().forEach(comp => {
      
      svg.append('circle')
        .attr('cx', 20)
        .attr('cy', y)
        .attr('r', 20 - (i + 1) * 20 / (n + 1))
        .style('fill', layer.style.theme.competitors[comp].colour);
      
      i++;
    });
      
    i = 0;
      
    competitors.reverse().forEach(comp => {
      
      svg.append('circle')
        .attr('cx', 20)
        .attr('cy', y + 35 + (i * 20))
        .attr('r', 8)
        .style('fill', layer.style.theme.competitors[comp].colour);
      
      svg.append('text')
        .attr('x', 45)
        .attr('y', y + 35 + (i * 20))
        .attr('alignment-baseline', 'central')
        .style('font-size', '12px')
        .text(layer.style.theme.competitors[comp].label);
      
      i++;
    });
      
    y += 15 + (n * 20);
      
  } else { y += 15; }
      
  // Set height of the svg element.
  svg.attr('height', y += 10);
};