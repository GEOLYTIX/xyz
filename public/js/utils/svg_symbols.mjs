export default marker => {

    if (typeof(marker) == 'string') return marker;

    if (marker.svg) return marker.svg;

    const markers = {
      dot: dot(marker),
      target: target(marker),
      triangle: triangle(marker),
      square: square(marker),
      markerLetter: markerLetter(marker),
      markerColor: markerColor(marker),
      geo: geolocation()
    };

    if (!marker.type) return dot({ color: '#666' });

    return markers[marker.type];
};

import { wire } from 'hyperhtml/esm';
import chroma from 'chroma-js';

import d3_selection from 'd3-selection';
import d3_path from 'd3-path';
import d3_shape from 'd3-shape';

const xmlSerializer = new XMLSerializer();

function dot(style) {

    const svg = wire()
    `<svg
  width=866
  height=1000
  viewBox='0 0 866 1000'
  xmlns='http://www.w3.org/2000/svg'
  >`;

    svg.appendChild(
        wire(null, 'svg')
        `
    <circle
    cx=466
    cy=532
    r=395
    fill=${chroma(style.fillColor || '#fff').darken()}>`
    );

    svg.appendChild(
        wire(null, 'svg')
        `
    <circle
    cx=400
    cy=468
    r=395
    fill=${style.fillColor || '#fff'}>`
    );

    return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));

}

function target(style) {

    const r = 400;

    const svg = wire()
    `<svg 
  width=1000
  height=1000
  viewBox='0 0 1000 1000'
  xmlns='http://www.w3.org/2000/svg'
  >`;

    let shade = wire(null, 'svg')
    `
    <circle
    cx=540
    cy=540
    fill='#333'
    opacity=0.4>`;

    shade.setAttribute('r', r);

    svg.appendChild(shade);

    let main = wire(null, 'svg')
    `
    <circle
    cx=500
    cy=500
    fill=${style.fillColor || '#FFF'}>`;

    main.setAttribute('r', r);

    svg.appendChild(main);

    if (!style.layers) return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));

    Object.entries(style.layers).forEach(layer => {

        let _layer = wire(null, 'svg')
        `
      <circle
      cx=500
      cy=500
      fill=${layer[1]}>`;

        _layer.setAttribute('r', parseFloat(layer[0]) * r);

        svg.appendChild(_layer);

    });

    return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));
}


function triangle(style) {

    let r = 500,
        scale = -20;

    const svg = d3_selection
        .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
        .attr('width', 1000)
        .attr('height', 1000)
        .attr('viewBox', '0 0 1000 1000')
        .attr('xmlns', 'http://www.w3.org/2000/svg');

    let t = d3_shape.symbol().type(d3_shape.symbolTriangle).size(r);

    svg.append('path')
        .attr('d', t)
        .attr('fill', '#333')
        .attr('opacity', 0.4)
        .attr('transform', 'translate(' + (r + 40) + ' ' + (r + 20) + ') rotate(180) scale(' + scale + ', ' + scale + ')');

    svg.append('path')
        .attr('d', t)
        .attr('fill', style.fillColor)
        .attr('transform', 'translate(' + r + ',' + r + ') rotate(180) scale(' + scale + ', ' + scale + ')');

    if (!style.layers) return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));

    Object.entries(style.layers).map(layer => {
        svg.append('path')
            .attr('d', t)
            .attr('fill', layer[1])
            .attr('transform', 'translate(' + r + ',' + r + ') rotate(180) scale(' + layer[0] * scale + ', ' + layer[0] * scale + ')');
    });

    return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));
}

function square(style) {

    let v = 1000,
        a = 800,
        o = 10;

    const svg = d3_selection
        .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
        .attr('width', v)
        .attr('height', v)
        .attr('viewBox', '0 0 1000 1000')
        .attr('xmlns', 'http://www.w3.org/2000/svg');

    svg.append('rect')
        .attr('width', a)
        .attr('height', a)
        .attr('fill', '#333')
        .attr('opacity', 0.3)
        .attr('x', (v - a) / 2 + o)
        .attr('y', (v - a) / 2 + o);

    svg.append('rect')
        .attr('width', a)
        .attr('height', a)
        .attr('fill', style.fillColor)
        .attr('x', (v - a) / 2)
        .attr('y', (v - a) / 2);

    if (!style.layers) return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));

    Object.entries(style.layers).map(layer => {
        let a_ = layer[0] * a;
        svg.append('rect')
            .attr('width', a_)
            .attr('height', a_)
            .attr('fill', layer[1])
            .attr('x', (v - a_) / 2)
            .attr('y', (v - a_) / 2);
    });

    return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));

}

function markerLetter(style) {

    const svg = wire()
    `
    <svg
    width=1000
    height=1000
    viewBox='0 0 1000 1000'
    xmlns='http://www.w3.org/2000/svg'>`;

    svg.appendChild(
        wire(null, 'svg')
        `
    <path
    style="opacity: 0.5;"
    fill=${style.color}
    d="M570,20C370,20,210,180,210,380C210,460,230,520,280,610C380,780,570,1000,570,1000C570,1000,760,780,860,610C910,520,930,460,930,380C930,180,770,20,570,20Z"/>`
    );

    svg.appendChild(
        wire(null, 'svg')
        `
    <path
    fill=${style.color}
    d="M500,20C300,20,140,180,140,380C140,440,160,520,210,610C310,780,500,1000,500,1000C500,1000,690,780,790,610C840,520,860,460,860,380C860,180,700,20,500,20Z"/>`
    );

    svg.appendChild(
        wire(null, 'svg')
        `
    <circle
    cx=500
    cy=360
    r=250
    opacity=0.8
    fill="rgb(255, 255, 255)"/>`
    );

    svg.appendChild(
        wire(null, 'svg')
        `
    <text
      x=500
      y=500
      style="text-anchor: middle; font-weight: 600; font-size: 470px; font-family: sans-serif; fill: rgb(85, 85, 85);">
        ${style.letter}`
    );

    return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));

}

function markerColor(style) {

    const svg = wire()
    `
    <svg
    width=1000
    height=1000
    viewBox='0 0 1000 1000'
    xmlns='http://www.w3.org/2000/svg'>`;

    svg.appendChild(
        wire(null, 'svg')
        `
      <path
      style="opacity: 0.5;"
      fill=${style.colorMarker}
      d="M570,20C370,20,210,180,210,380C210,460,230,520,280,610C380,780,570,1000,570,1000C570,1000,760,780,860,610C910,520,930,460,930,380C930,180,770,20,570,20Z"/>`
    );

    svg.appendChild(
        wire(null, 'svg')
        `
      <path
      fill=${style.colorMarker}
      d="M500,20C300,20,140,180,140,380C140,440,160,520,210,610C310,780,500,1000,500,1000C500,1000,690,780,790,610C840,520,860,460,860,380C860,180,700,20,500,20Z"/>`
    );

    svg.appendChild(
        wire(null, 'svg')
        `
    <circle
    cx=500
    cy=360
    r=250
    opacity=0.8
    fill="rgb(255, 255, 255)"/>`
    );

    svg.appendChild(
        wire(null, 'svg')
        `
    <circle
    cx=500
    cy=360
    r=180
    opacity=0.8
    fill=${style.colorDot}/>`
    );

    return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));

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