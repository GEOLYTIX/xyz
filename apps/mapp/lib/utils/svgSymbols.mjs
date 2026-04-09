/**
## mapp.utils.svgSymbols{}

@module /utils/svgSymbols
*/

import { svg } from './uhtml.mjs';

const xmlSerializer = new XMLSerializer();

const memoizedIcons = {
  dot: new Map(),
};

export function dot(style) {
  const lookup = Object.values({
    fillColor: style.fillColor,
  }).reduce((a, b) => a + b);

  if (memoizedIcons.dot.has(lookup)) return memoizedIcons.dot.get(lookup);

  let icon = svg.node`
    <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
      <circle cx=13 cy=13 r=10 fill='#333'></circle>
      <circle cx=12 cy=12 r=10 fill=${style.fillColor || '#fff'}></circle>`;

  icon = `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`;

  memoizedIcons.dot.set(lookup, icon);

  return icon;
}

export function target(style) {
  const icon = svg.node`
    <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
      <circle cx=13 cy=13 fill='#333' r=10 opacity=0.4></circle>
      <circle cx=12 cy=12 r=10 fill=${style.fillColor || '#FFF'}>`;

  style.layers &&
    Object.entries(style.layers).forEach((layer) => {
      icon.appendChild(
        svg.node`<circle cx=12 cy=12 r=${parseFloat(layer[0]) * 10} fill=${layer[1]}>`,
      );
    });

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`;
}

export function triangle(style) {
  const icon = svg.node`
    <svg width=24 height=24 viewBox='${`0 0 24 24`}' xmlns='http://www.w3.org/2000/svg'>
      <polygon
        points="12,4.68 2,22 22,22"
        fill="#333" stroke="#333" opacity=0.4 stroke-opacity=0.4 stroke-width=3
        stroke-linejoin="round"/>`;

  icon.appendChild(svg.node`
    <polygon
      fill=${style.fillColor || '#FFF'} stroke=${style.fillColor || '#FFF'} stroke-width=2
      points="12,4.68 2,22 22,22"  stroke-linejoin="round"/>`);

  style.layers &&
    Object.entries(style.layers).forEach((layer) => {
      function x(val, scale) {
        return 12 + (val - 12) * scale;
      }

      function y(val, scale) {
        return 16 + (val - 16) * scale;
      }

      const points = `${x(12, layer[0])},${y(4.68, layer[0])} ${x(2, layer[0])}, ${y(22, layer[0])} ${x(22, layer[0])}, ${y(22, layer[0])}`;

      icon.appendChild(svg.node`
      <polygon
        points="${points}"
        fill=${layer[1]}
        stroke=${layer[1] || '#FFF'}
        stroke-width=1
        stroke-linejoin="round"/>`);
    });

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`;
}

export function square(style) {
  const icon = svg.node`
    <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
      <rect fill='#333' opacity=0.3 width=20 height=20 x=2 y=2 rx=1></rect>
      <rect fill=${style.fillColor || '#FFF'} width=20 height=20 x=0 y=0 rx=1></rect>`;

  style.layers &&
    Object.entries(style.layers).forEach((layer) => {
      icon.appendChild(svg.node`
      <rect fill=${layer[1]}
        width=${parseFloat(layer[0]) * 20}
        height=${parseFloat(layer[0]) * 20}
        x=${10 * (1 - parseFloat(layer[0]))}
        y=${10 * (1 - parseFloat(layer[0]))} rx=${parseFloat(layer[0])}></rect>`);
    });

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`;
}

export function diamond(style) {
  const icon = svg.node`
    <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
      <polygon
        fill='#333'
        opacity=0.3
        points="12 0, 24 12, 12 24, 0 12"></polygon>
      <polygon
        fill=${style.fillColor || '#FFF'}
        points="12 0, 24 12, 12 24, 0 12"></polygon>`;

  function s(val, scale) {
    return 12 + (val - 12) * scale;
  }

  style.layers &&
    Object.entries(style.layers).forEach((layer) => {
      const points = `${s(12, layer[0])} ${s(0, layer[0])},${s(24, layer[0])} ${s(12, layer[0])},${s(12, layer[0])} ${s(24, layer[0])}, ${s(0, layer[0])} ${s(12, layer[0])}`;

      icon.appendChild(svg.node`
      <polygon
        fill=${layer[1] || '#FFF'}
        points="${points}"></polygon>`);
    });

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`;
}

export function semiCircle(style) {
  const icon = svg.node`
    <svg width=30 height=30 viewBox='0 0 20 24' xmlns='http://www.w3.org/2000/svg'>
      <defs>
        <clipPath id="cut-off-shade">
          <rect x="0" y="0" width="24" height="11"/>
        </clipPath>
        <clipPath id="cut-off">
          <rect x="0" y="0" width="24" height="10"/>
        </clipPath>
      </defs>
      <circle cx="11" cy="10" r="10" clip-path="url(#cut-off-shade)" fill="#333" opacity=0.4></circle>
      <circle cx=10 cy=10 r=10 fill=${style.fillColor || '#FFF'} clip-path="url(#cut-off-shade)">`;

  style.layers &&
    Object.entries(style.layers).forEach((layer) => {
      icon.appendChild(svg.node`
      <circle cx=10 cy=10 r=${parseFloat(layer[0]) * 10} fill=${layer[1]} clip-path="url(#cut-off-shade)">`);
    });

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`;
}

export function markerLetter(style) {
  const icon = svg.node`
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="${style.color}"
        d="M 12 1.969 C 7.878 1.969 4.813 5.239 4.813 9.328 C 4.813 10.554 5.222 12.189 6.244 14.028 C 8.289 17.504 12 22 12 22 C 12 22 16.055 17.504 18.099 14.028 C 19.122 12.189 19.341 10.963 19.341 9.328 C 19.341 5.239 16.054 1.969 12 1.969 Z"/>
      <circle cx="12.17192400568182" cy="8.918683238636365" r="5.109789772727275" fill="rgb(255, 255, 255)"/>
      <text x="12" y="12" style="text-anchor: middle; font-weight: 600; font-size: 9px; font-family: sans-serif; fill: rgb(85, 85, 85);">
      ${style.letter}`;

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`;
}

export function markerColor(style) {
  const icon = svg.node`
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path style="opacity: 0.5;" fill="${style.colorMarker}"
        d="M 10.797 1.238 C 6.308 1.238 2.716 4.83 2.716 9.32 C 2.716 11.116 3.165 12.463 4.287 14.483 C 6.532 18.3 9.952 23.234 9.952 23.234 C 9.952 23.234 15.063 18.3 17.308 14.483 C 18.43 12.463 18.879 11.116 18.879 9.32 C 18.879 4.83 15.287 1.238 10.797 1.238 Z"/>
      <path fill="${style.colorMarker}"
        d="M 10 1.238 C 5.51 1.238 2.144 4.83 2.144 9.32 C 2.144 10.667 2.593 12.463 3.716 14.483 C 5.961 18.3 10 23.238 10 23.238 C 10 23.238 14.491 18.3 16.736 14.483 C 17.859 12.463 18.1 11.116 18.1 9.32 C 18.1 4.83 14.49 1.238 10 1.238 Z"/>
      <circle cx="10.226" cy="8.871" r="5.612" opacity="0.8" fill="rgb(255, 255, 255)"/>
      <circle cx="10.226" cy="8.871" r="2.806" opacity="0.8" fill="${style.colorDot}"/>`;

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`;
}

export function circle(style) {
  const icon = svg.node`
    <svg width=24 height=24 viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'>
      <circle cx=16 cy=16 r=10
        stroke="${style.strokeColor || '#333'}"
        stroke-width="${style.strokeWidth || 1}"
        fill="#ffffff33">`;

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`;
}

// Assign template method to svgSymbols.
export function template(icon) {
  // Get svgString from svgSymbol.templates.
  let svgString = mapp.utils.svgSymbols.templates?.[icon.template];

  // Return undefined if svgString not found in templates.
  if (!svgString) return;

  // Iterate through the icon.substitute entries.
  if (typeof icon.substitute === 'object') {
    Object.entries(icon.substitute).forEach((entry) => {
      // Replace substitute key with values.
      svgString = svgString.replaceAll(entry[0], entry[1]);
    });
  }

  // Return encoded string.
  return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
}
