export default marker => {

  if (typeof (marker) == 'string') return marker;

  if (marker.svg) return marker.svg;

  const markers = {
    dot: dot(marker.style),
    circle: circle(marker.style),
    target: target(marker),
    triangle: triangle(marker),
    square: square(marker),
    semiCircle: semiCircle(marker),
    markerLetter: markerLetter(marker.style),
    markerColor: markerColor(marker.style),
    geo: geolocation()
  };

  if (!marker.type) return dot({color: '#666'});

  return markers[marker.type];
};

import d3_selection from 'd3-selection';
import d3_color from 'd3-color';
import d3_path from 'd3-path';
import d3_shape from 'd3-shape';

const xmlSerializer = new XMLSerializer();

function dot(style) {

  if (!style) return;

  let svg = d3_selection
    .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
    .attr('width', 866)
    .attr('height', 1000)
    .attr('viewBox', '0 0 866 1000')
    .attr('xmlns', 'http://www.w3.org/2000/svg');

  svg
    .append('circle')
    .attr('cx', 466)
    .attr('cy', 532)
    .attr('r', 395)
    .style('fill', d3_color.rgb(style.color).darker(0.5));

  svg
    .append('circle')
    .attr('cx', 400)
    .attr('cy', 468)
    .attr('r', 395)
    .style('fill', d3_color.rgb(style.color));

  return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));
}

function circle(style) {

  if (!style) return;

  let svg = d3_selection
    .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
    .attr('width', 1000)
    .attr('height', 1000)
    .attr('viewBox', '0 0 1000 1000')
    .attr('xmlns', 'http://www.w3.org/2000/svg');

  svg
    .append('circle')
    .attr('cx', 500)
    .attr('cy', 500)
    .attr('r', 350)
    .style('stroke', style.color)
    .style('stroke-width', 250)
    .style('opacity', style.opacity || 0.5)
    .style('fill', 'none');

  return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));
}

function semiCircle(style){

  const r = 400;

  const svg = d3_selection
    .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
    .attr('width', 1000)
    .attr('height', 1000)
    .attr('viewBox', '0 0 1000 1000')
    .attr('xmlns', 'http://www.w3.org/2000/svg');

    makeArc(r, style.fillColor, true);

    if(style.layers){
      Object.entries(style.layers).map(layer => {
        let _outerRadius = parseInt(parseFloat(layer[0])*r), _fillColor = layer[1];
        makeArc(_outerRadius, _fillColor);
      });
    }


    function makeArc(outerRadius, fillColor, shade){

      let options = {
        startAngle: 0,
        endAngle: Math.PI
      };

      if(shade){
        let arc_shade = d3_shape.arc().innerRadius(0).outerRadius(outerRadius);
        svg.append("path").attr("d", arc_shade(options)).attr("fill", '#777').attr("transform", "translate(500, 760) rotate(-90)");
      }


      let arc = d3_shape.arc().innerRadius(0).outerRadius(outerRadius);

      svg.append("path").attr("d", arc(options)).attr("fill", fillColor).attr("transform", "translate(480, 750) rotate(-90)");
    }

    return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));

}

function target(style) {

  const svg = d3_selection
    .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
    .attr('width', 1000)
    .attr('height', 1000)
    .attr('viewBox', '0 0 1000 1000')
    .attr('xmlns', 'http://www.w3.org/2000/svg');

  svg
    .append('circle')
    .attr('cx', 540)
    .attr('cy', 540)
    .attr('r', 400)
    .style('fill', '#333')
    .style('opacity', 0.4);

  svg
    .append('circle')
    .attr('cx', 500)
    .attr('cy', 500)
    .attr('r', 400)
    .style('fill', style.fillColor);

  if (!style.layers) return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));
  
  Object.entries(style.layers).forEach(layer => {

    svg
      .append('circle')
      .attr('cx', 500)
      .attr('cy', 500)
      .attr('r', parseFloat(layer[0]) * 400)
      .style('fill', layer[1]);

  });

  return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));
}

function triangle(style){

  let r = 500, scale = -20;

  const svg = d3_selection
    .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
    .attr('width', 1000)
    .attr('height', 1000)
    .attr('viewBox', '0 0 1000 1000')
    .attr('xmlns', 'http://www.w3.org/2000/svg');

  let t = d3_shape.symbol().type(d3_shape.symbolTriangle).size(r);

  svg.append("path")
    .attr("d", t)
    .attr('fill', '#333')
    .attr('opacity', 0.4)
    .attr("transform", "translate(" + (r+40) + " " + (r+20) +") rotate(180) scale("+scale+", "+scale+")");

  svg.append("path")
    .attr("d", t)
    .attr("fill", style.fillColor)
    .attr("transform", "translate(" + r + "," + r +") rotate(180) scale("+scale+", "+scale+")");

  if (!style.layers) return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));

  Object.entries(style.layers).map(layer => {
    svg.append("path")
    .attr("d", t)
    .attr("fill", layer[1])
    .attr("transform", "translate(" + r + "," + r +") rotate(180) scale("+layer[0]*scale+", "+layer[0]*scale+")");
    });

  return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));
}

function square(style){

  let v = 1000, a = 800, o = 10;

    const svg = d3_selection
    .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
    .attr('width', v)
    .attr('height', v)
    .attr('viewBox', '0 0 1000 1000')
    .attr('xmlns', 'http://www.w3.org/2000/svg');

   svg.append('rect')
   .attr('width', a)
   .attr('height', a)
   .attr("fill", '#333')
   .attr('opacity', 0.3)
   .attr('x', (v-a)/2+o)
   .attr('y', (v-a)/2+o);

    svg.append('rect')
   .attr('width', a)
   .attr('height', a)
   .attr("fill", style.fillColor)
   .attr('x', (v-a)/2)
   .attr('y', (v-a)/2);

   if (!style.layers) return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));

    Object.entries(style.layers).map(layer => {
       let a_ = layer[0]*a;
        svg.append('rect')
           .attr('width', a_)
           .attr('height', a_)
           .attr('fill', layer[1])
           .attr('x', (v-a_)/2)
           .attr('y', (v-a_)/2);
       });

    return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));

}

function markerLetter(style) {//colorMarker, letter

  if (!style) return;

  let svg = d3_selection
    .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
    .attr('width', 1000)
    .attr('height', 1000)
    .attr('viewBox', '0 0 1000 1000')
    .attr('xmlns', 'http://www.w3.org/2000/svg');

  let p = d3_path.path();
  p.moveTo(570, 20);
  p.bezierCurveTo(370, 20, 210, 180, 210, 380);
  p.bezierCurveTo(210, 460, 230, 520, 280, 610);
  p.bezierCurveTo(380, 780, 570, 1000, 570, 1000);
  p.bezierCurveTo(570, 1000, 760, 780, 860, 610);
  p.bezierCurveTo(910, 520, 930, 460, 930, 380);
  p.bezierCurveTo(930, 180, 770, 20, 570, 20);
  p.closePath();

  svg
    .append('path')
    .style('fill', style.color)
    .style('opacity', 0.5)
    .attr('d', p.toString());

  p = d3_path.path();
  p.moveTo(500, 20);
  p.bezierCurveTo(300, 20, 140, 180, 140, 380);
  p.bezierCurveTo(140, 440, 160, 520, 210, 610);
  p.bezierCurveTo(310, 780, 500, 1000, 500, 1000);
  p.bezierCurveTo(500, 1000, 690, 780, 790, 610);
  p.bezierCurveTo(840, 520, 860, 460, 860, 380);
  p.bezierCurveTo(860, 180, 700, 20, 500, 20);
  p.closePath();

  svg
    .append('path')
    .style('fill', style.color)
    .attr('d', p.toString());

  svg
    .append('circle')
    .style('fill', '#fff')
    .style('opacity', 0.8)
    .attr('cx', 500)
    .attr('cy', 360)
    .attr('r', 250);

  svg
    .append('text')
    .attr('x', 500)
    .attr('y', 500)
    .style('text-anchor', 'middle')
    //.style('alignment-baseline', 'middle')
    .style('font-weight', 600)
    .style('font-size', '470px')
    .style('font-family', 'sans-serif')
    .style('fill', '#555')
    .text(style.letter);

  return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));
}

function markerColor(style) {//colorMarker, colorDot

  if (!style) return;

  let svg = d3_selection
    .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
    .attr('width', 1000)
    .attr('height', 1000)
    .attr('viewBox', '0 0 1000 1000')
    .attr('xmlns', 'http://www.w3.org/2000/svg');

  let p = d3_path.path();
  p.moveTo(570, 20);
  p.bezierCurveTo(370, 20, 210, 180, 210, 380);
  p.bezierCurveTo(210, 460, 230, 520, 280, 610);
  p.bezierCurveTo(380, 780, 570, 1000, 570, 1000);
  p.bezierCurveTo(570, 1000, 760, 780, 860, 610);
  p.bezierCurveTo(910, 520, 930, 460, 930, 380);
  p.bezierCurveTo(930, 180, 770, 20, 570, 20);
  p.closePath();

  svg
    .append('path')
    .style('fill', style.colorMarker)
    .style('opacity', 0.5)
    .attr('d', p.toString());

  p = d3_path.path();
  p.moveTo(500, 20);
  p.bezierCurveTo(300, 20, 140, 180, 140, 380);
  p.bezierCurveTo(140, 440, 160, 520, 210, 610);
  p.bezierCurveTo(310, 780, 500, 1000, 500, 1000);
  p.bezierCurveTo(500, 1000, 690, 780, 790, 610);
  p.bezierCurveTo(840, 520, 860, 460, 860, 380);
  p.bezierCurveTo(860, 180, 700, 20, 500, 20);
  p.closePath();

  svg
    .append('path')
    .style('fill', style.colorMarker)
    .attr('d', p.toString());

  svg
    .append('circle')
    .style('fill', '#fff')
    .style('opacity', 0.8)
    .attr('cx', 500)
    .attr('cy', 360)
    .attr('r', 250);

  svg
    .append('circle')
    .style('fill', style.colorDot)
    .attr('cx', 500)
    .attr('cy', 360)
    .attr('r', 180);

  return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));
}

function geolocation() {
  let svg = d3_selection
    .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
    .attr('width', 1000)
    .attr('height', 1000)
    .attr('viewBox', '0 0 1000 1000')
    .attr('xmlns', 'http://www.w3.org/2000/svg');

  svg
    .append('circle')
    .attr('cx', 500)
    .attr('cy', 500)
    .attr('r', 350)
    .style('stroke', '#090')
    .style('opacity', 0.8)
    .style('stroke-width', 75)
    .style('fill', 'none');

  svg
    .append('circle')
    .attr('cx', 500)
    .attr('cy', 500)
    .attr('r', 200)
    .style('fill', '#090')
    .style('opacity', 0.8);

  let p = d3_path.path();

  p.moveTo(500, 150);
  p.lineTo(500, 0);

  p.moveTo(500, 850);
  p.lineTo(500, 1000);

  p.moveTo(0, 500);
  p.lineTo(150, 500);

  p.moveTo(850, 500);
  p.lineTo(1000, 500);

  svg
    .append('path')
    .style('stroke', '#090')
    .style('opacity', 0.8)
    .style('stroke-width', 75)
    .attr('d', p.toString());

  return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));
}