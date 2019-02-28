import d3_selection from 'd3-selection';

export default (_xyz, layer) => {

  const legend = d3_selection.select(layer.style.legend).append('svg');
    
  // Create SVG grid legend
  let
    yTrack = 35,
    n = layer.style.range.length,
    w = 100 / n;

  for (let i = 0; i < n; i++) {

    let
      r = (i + 2) * 10 / n,
      x = i * w;

    legend.append('circle')
      .attr('cx', x + w / 2 + 1 + '%')
      .attr('cy', yTrack + 1)
      .attr('r', r)
      .style('fill', '#333');

    legend.append('circle')
      .attr('cx', x + w / 2 + '%')
      .attr('cy', yTrack)
      .attr('r', r)
      .style('fill', '#999');

    if (i === 0) {
      layer.style.legend.size_min = legend.append('text').attr('x', x  + '%')
        .attr('y', yTrack - 20)
        .style('font-size', 13)
        .attr('text-anchor', 'start')
        .style('font-family', '"PT Mono", monospace')
        .text('min')
        ._groups[0][0];
    }

    if (i === (n / 2 % 1 != 0 && Math.round(n / 2) - 1)) {
      layer.style.legend.size_avg = legend.append('text')
        .attr('x', x + w / 2 + '%')
        .attr('y', yTrack - 20)
        .style('font-size', 13)
        .attr('text-anchor', 'middle')
        .style('font-family', '"PT Mono", monospace')
        .text('avg')
        ._groups[0][0];
    }

    if (i === n - 1) {
      layer.style.legend.size_max = legend.append('text')
        .attr('x', x + w + '%')
        .attr('y', yTrack - 20)
        .style('font-size', 13)
        .attr('text-anchor', 'end')
        .style('font-family', '"PT Mono", monospace')
        .text('max')
        ._groups[0][0];
    }

  }

  yTrack += 20;

  for (let i = 0; i < n; i++) {

    let x = i * w;

    legend.append('rect')
      .attr('x', x  + '%')
      .attr('y', yTrack)
      .attr('width', w + '%')
      .attr('height', 20)
      .style('fill', layer.style.range[i]);

    if (i === 0) {
      layer.style.legend.color_min = legend.append('text')
        .attr('x', x  + '%')
        .attr('y', yTrack + 40)
        .style('font-size', 13)
        .attr('text-anchor', 'start')
        .style('font-family', '"PT Mono", monospace')
        .text('min')
        ._groups[0][0];
    }

    if (i === (n / 2 % 1 != 0 && Math.round(n / 2) - 1)) {
      layer.style.legend.color_avg = legend.append('text')
        .attr('x', x + w / 2 + '%')
        .attr('y', yTrack + 40)
        .style('font-size', 13)
        .attr('text-anchor', 'middle')
        .style('font-family', '"PT Mono", monospace')
        .attr('id', 'grid_legend_color__avg')
        .text('avg')
        ._groups[0][0];
    }

    if (i === n - 1) {
      layer.style.legend.color_max = legend.append('text')
        .attr('x', x + w + '%')
        .attr('y', yTrack + 40)
        .style('font-size', 13)
        .attr('text-anchor', 'end')
        .style('font-family', '"PT Mono", monospace')
        .attr('id', 'grid_legend_color__max')
        .text('max')
        ._groups[0][0];
    }

  }

  legend.attr('height', yTrack + 43);

};