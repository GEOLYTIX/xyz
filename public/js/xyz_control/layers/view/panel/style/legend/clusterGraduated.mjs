import d3_selection from 'd3-selection';

export default _xyz => layer => {

  const legend = d3_selection.select(layer.style.legend).append('svg');

  let y = 10;

  layer.style.theme.cat_arr.forEach(cat => {
           
    legend.append('image')
      .attr('x', 0)
      .attr('y', y)
      .attr('width', 20)
      .attr('height', 20)
      .attr('xlink:href', _xyz.utils.svg_symbols(Object.assign({}, layer.style.marker, cat.style)));
              
    legend.append('text')
      .attr('x', 25)
      .attr('y', y + 13)
      .style('font-size', '12px')
      .style('alignment-baseline', 'central')
      .text(cat.label || cat.style);
      
    y += 20;
  });
      
  // Set height of the svg element.
  legend.attr('height', y);
};

