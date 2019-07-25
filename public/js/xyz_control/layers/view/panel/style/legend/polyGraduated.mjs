import d3_selection from 'd3-selection';

export default _xyz => layer => {

  const legend = d3_selection.select(layer.style.legend).append('svg');

  let y = 10;

  layer.style.theme.cat_arr.forEach(cat => {
           
    let cat_style = Object.assign({}, layer.style.default, cat.style);

    legend.append('rect')
      .attr('x', 4)
      .attr('y', y + 3)
      .attr('width', 14)
      .attr('height', 14)
      .style('fill', cat_style.fillColor)
      .style('fill-opacity', cat_style.fillOpacity)
      .style('stroke', cat_style.color);
              
    legend.append('text')
      .attr('x', 25)
      .attr('y', y + 11)
      .style('font-size', '12px')
      .style('alignment-baseline', 'central')
      .text(cat.label || cat.value);
      
    y += 20;
  });
      
  // Set height of the svg element.
  legend.attr('height', y);

};