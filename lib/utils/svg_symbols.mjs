export default marker => {

  if (marker.svg) return marker.svg

  const markers = {
    dot: dot(marker),
    target: target(marker),
    triangle: triangle(marker),
    square: square(marker),
    semiCircle: semiCircle(marker),
    markerLetter: markerLetter(marker),
    markerColor: markerColor(marker),
    geo: geolocation(),
    circle: circle(marker)
  }

  if (!marker.type) return dot({ color: '#666' })

  return markers[marker.type]
}

import { wire } from 'hyperhtml/esm'

import chroma from 'chroma-js'

// import {render, html, svg} from 'uhtml'

const xmlSerializer = new XMLSerializer()

function dot(style) {

  const icon = uhtml.svg.node`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <circle cx=11 cy=10.5 r=10 fill=${chroma(style.fillColor || '#fff').darken()}></circle>
    <circle cx=10 cy=10 r=10 fill=${style.fillColor || '#fff'}></circle>`

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`
}

// function dot(style) {

//   const svg = wire()`
//   <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>`

//   svg.appendChild(wire(null, 'svg')`
//   <circle cx=11 cy=10.5 r=10 fill=${chroma(style.fillColor || '#fff').darken()}>`)

//   svg.appendChild(wire(null, 'svg')`
//   <circle cx=10 cy=10 r=10 fill=${style.fillColor || '#fff'}>`)

//   return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg))
// }

function target(style) {

  const r = 10;

  const svg = wire()`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>`;

  let shade = wire(null, 'svg')`
  <circle cx=11 cy=10.5 fill='#333' opacity=0.4>`;

  shade.setAttribute('r', r);

  svg.appendChild(shade);

  let main = wire(null, 'svg')`<circle cx=10 cy=10  fill=${style.fillColor || '#FFF'}>`;

  main.setAttribute('r', r);

  svg.appendChild(main);

  if (!style.layers) return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));

  Object.entries(style.layers).forEach(layer => {

    const _layer = wire(null, 'svg')`<circle cx=10 cy=10  fill=${layer[1]}>`;

    _layer.setAttribute('r', parseFloat(layer[0]) * r);

    svg.appendChild(_layer);
  });

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));
}

function triangle(style) {

  let
    r = 10,
    scale = 0.6;

  const svg = wire()`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>`;

  // triangle path
  let t = 'M0,-19.618873042551414L16.990442448471224,9.809436521275707L-16.990442448471224,9.809436521275707Z';

  let shade = wire(null, 'svg')`<path fill='#333' opacity=0.4>`;

  shade.setAttribute('d', t);
  shade.setAttribute('transform', `translate(${r + 40} ${r + 20}) scale(${scale}, ${scale})`);

  svg.appendChild(shade);

  let path = wire(null, 'svg')`<path fill=${style.fillColor || '#FFF'}>`;

  path.setAttribute('d', t);
  path.setAttribute('transform', `translate(${r} ${r}) scale(${scale}, ${scale})`);
  svg.appendChild(path);
  
  if(!style.layers) return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));

  Object.entries(style.layers).map(layer => {

    const _layer = wire(null, 'svg')`<path fill=${layer[1]}>`;

    _layer.setAttribute('d', t);
    _layer.setAttribute('transform', `translate(${r} ${r}) scale(${layer[0]*scale}, ${layer[0]*scale})`);
      
    svg.appendChild(_layer);
  });

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));

  }

function square(style) {

  let
    v = 20,
    a = 20,
    o = 1;

  const svg = wire()`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>`;

  let shade = wire(null, 'svg')`<rect fill='#333' opacity=0.3 >`;

  shade.setAttribute('width', a);
  shade.setAttribute('height', a);
  shade.setAttribute('x', (v - a) / 2 + o);
  shade.setAttribute('y', (v - a) / 2 + o);

  svg.appendChild(shade);

  let path = wire(null, 'svg')`<rect fill=${style.fillColor || '#FFF'}>`;

  path.setAttribute('width', a);
  path.setAttribute('height', a);
  path.setAttribute('x', (v - a) / 2);
  path.setAttribute('y', (v - a) / 2);

  svg.appendChild(path);

  if (!style.layers) return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));

  Object.entries(style.layers).map(layer => {

    const _layer = wire(null, 'svg')`<rect fill=${layer[1]}>`;

    _layer.setAttribute('width', layer[0] * a);
    _layer.setAttribute('height', layer[0] * a);
    _layer.setAttribute('x', (v - layer[0] * a) / 2);
    _layer.setAttribute('y', (v - layer[0] * a) / 2);
        
    svg.appendChild(_layer);
  });

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));
}

function semiCircle(style){

  const svg = wire()`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <defs>
      <clipPath id="cut-off-shade">
        <rect x="0" y="0" width="24" height="11"/>
      </clipPath>
      <clipPath id="cut-off">
        <rect x="0" y="0" width="24" height="10"/>
      </clipPath>
    </defs>
    <circle cx="11" cy="10" r="10" fill="#333" opacity="0.3" clip-path="url(#cut-off-shade)"/>
  </svg>`;

  svg.appendChild(wire(null, 'svg')`
  <circle cx=10 cy=10 r=10 fill=${style.fillColor} clip-path='url(#cut-off)'>`);

  if(style.layers){
    Object.entries(style.layers).map(layer => {
      const arc = wire(null, 'svg')`<circle cx=10 cy=10 fill=${layer[1]} clip-path='url(#cut-off)'>`;
      arc.setAttribute('r', parseInt(parseFloat(layer[0]) * 10));
      svg.appendChild(arc);
    });
  }

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));
}

function markerLetter(style) {

  const svg = wire()`
  <svg width=18 height=24 viewBox='0 0 24 18' xmlns='http://www.w3.org/2000/svg'>`;

  svg.appendChild(wire(null, 'svg')`
  <path style="opacity: 0.5;" fill=${style.color}
    d="M 10.797 1.238 C 6.308 1.238 2.716 4.83 2.716 9.32 C 2.716 11.116 3.165 12.463 4.287 14.483 C 6.532 18.3 9.952 23.234 9.952 23.234 C 9.952 23.234 15.063 18.3 17.308 14.483 C 18.43 12.463 18.879 11.116 18.879 9.32 C 18.879 4.83 15.287 1.238 10.797 1.238 Z"/>`);

  svg.appendChild(wire(null, 'svg')`
  <path fill=${style.color}
    d="M 10 1.238 C 5.51 1.238 2.144 4.83 2.144 9.32 C 2.144 10.667 2.593 12.463 3.716 14.483 C 5.961 18.3 10 23.238 10 23.238 C 10 23.238 14.491 18.3 16.736 14.483 C 17.859 12.463 18.1 11.116 18.1 9.32 C 18.1 4.83 14.49 1.238 10 1.238 Z"/>`);

  svg.appendChild(wire(null, 'svg')`
  <circle cx="10.226" cy="8.871" r="5.612" opacity=0.8 fill="rgb(255, 255, 255)"/>`);

  svg.appendChild(wire(null, 'svg')`
  <text x=10 y=11.5 style="text-anchor: middle; font-weight: 600; font-size: 10px; font-family: sans-serif; fill: rgb(85, 85, 85);">
    ${style.letter}`);

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));
}

function markerColor(style) {

  const svg = wire()`
  <svg width=18 height=24 viewBox='0 0 24 18' xmlns='http://www.w3.org/2000/svg'>`;

  svg.appendChild(wire(null, 'svg')`
  <path style="opacity: 0.5;" fill=${style.colorMarker}
    d="M 10.797 1.238 C 6.308 1.238 2.716 4.83 2.716 9.32 C 2.716 11.116 3.165 12.463 4.287 14.483 C 6.532 18.3 9.952 23.234 9.952 23.234 C 9.952 23.234 15.063 18.3 17.308 14.483 C 18.43 12.463 18.879 11.116 18.879 9.32 C 18.879 4.83 15.287 1.238 10.797 1.238 Z"/>`);

  svg.appendChild(wire(null, 'svg')`
  <path fill=${style.colorMarker}
    d="M 10 1.238 C 5.51 1.238 2.144 4.83 2.144 9.32 C 2.144 10.667 2.593 12.463 3.716 14.483 C 5.961 18.3 10 23.238 10 23.238 C 10 23.238 14.491 18.3 16.736 14.483 C 17.859 12.463 18.1 11.116 18.1 9.32 C 18.1 4.83 14.49 1.238 10 1.238 Z"/>`);

  svg.appendChild(wire(null, 'svg')`
  <circle cx=10.226 cy=8.871 r=5.612 opacity=0.8 fill="rgb(255, 255, 255)"/>`);

  svg.appendChild(wire(null, 'svg')`
  <circle cx=10.226 cy=8.871 r=2.806 opacity=0.8 fill=${style.colorDot}/>`);

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));
}

function geolocation() {

  const svg = wire()`
  <svg width=1000 height=1000 viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'>`;

  const d = 'M500,150L500,0M500,850L500,1000M0,500L150,500M850,500L1000,500';

  svg.appendChild(wire(null, 'svg')`
  <circle cx=500 cy=500 r=350 stroke='#1F964D' opacity=0.8 stroke-width=75 fill=none>`);

  svg.appendChild(wire(null, 'svg')`
  <circle cx=500 cy=500 r=200 fill='#1F964D' opacity=0.8>`);

  let p = wire(null, 'svg')`
  <path stroke='#1F964D' opacity=0.8 stroke-width=75>`;

  p.setAttribute('d', d);

  svg.appendChild(p);

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));
}

function circle(style){

  const svg = wire()`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>`;

  const circle = wire(null, 'svg')`
  <circle cx=12 cy=12
  stroke="${style.strokeColor || '#333333'}" 
  stroke-width="${style.strokeWidth || 1}" fill="${style.fillColor || 'none'}">`

  circle.setAttribute('r', style.radius || 10);

  svg.appendChild(circle);

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));

}