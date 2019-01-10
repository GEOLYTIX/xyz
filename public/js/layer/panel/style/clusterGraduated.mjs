import d3_selection from 'd3-selection';

export default (_xyz, layer) => {

  let width = layer.drawer.clientWidth;
      
  const svg = d3_selection
    .select(layer.style.legend)
    .append('svg')
    .attr('width', width);

  let y = 10;

  // Create ordered array for the categories.
  const cat_arr = Object.entries(layer.style.theme.cat).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
     
  cat_arr.forEach(cat => {
           
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
      .text(cat[1].label || cat[0]);
      
    y += 20;
  });
      
  // Set height of the svg element.
  svg.attr('height', y);
};

