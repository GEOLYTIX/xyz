export default (marker) => {
  if (marker.svg && !marker.legend) return marker.svg;

  const markers = {
    dot: dot(marker),
    target: target(marker),
    triangle: triangle(marker),
    square: square(marker),
    semiCircle: semiCircle(marker),
    markerLetter: markerLetter(marker),
    markerColor: markerColor(marker),
    geo: geolocation(),
    circle: circle(marker),
    diamond: diamond(marker),
    clusterSummary: clusterSummary(marker),
  };

  function legend(style) {
    let _css = `height: ${style.cluster ? 40 : 24}px; width: ${
      style.cluster ? 40 : 24
    }px; position: relative;`;

    const node = html.node`<div style="${_css}">`;

    function make(m) {
      let css = `position:absolute; height:${m.cluster ? 40 : 20}px; width:${
        m.cluster ? 40 : 20
      }px;`;
      if (m.svg)
        return node.appendChild(
          html.node`<img style="${css}" src="${m.svg}"/>`
        );
      if (!m.type)
        return node.appendChild(
          html.node`<img style="${css}" src="${dot({ color: '#666' })}"/>`
        );
      return node.appendChild(
        html.node`<img style="${css}" src="${markers[m.type]}"/>`
      );
    }

    if (style.layers && Array.isArray(style.layers))
      style.layers.map((_l) => make(_l));
    else make(style);

    return node;
  }

  if (marker.legend) return legend(marker);

  if (!marker.type) return dot({ color: '#666' });

  return markers[marker.type];
};

import { svg, html } from 'uhtml';

const xmlSerializer = new XMLSerializer();

function dot(style) {
  const icon = svg.node`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <circle cx=13 cy=13 r=10 fill='#333'></circle>
    <circle cx=12 cy=12 r=10 fill=${style.fillColor || '#fff'}></circle>`;

  return `data:image/svg+xml,${encodeURIComponent(
    xmlSerializer.serializeToString(icon)
  )}`;
}

function target(style) {
  const icon = svg.node`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <circle cx=13 cy=13 fill='#333' r=10 opacity=0.4></circle>
    <circle cx=12 cy=12 r=10 fill=${style.fillColor || '#FFF'}>`;

  style.layers &&
    Object.entries(style.layers).forEach((layer) => {
      icon.appendChild(
        svg.node`<circle cx=12 cy=12 r=${parseFloat(layer[0]) * 10} fill=${
          layer[1]
        }>`
      );
    });

  return `data:image/svg+xml,${encodeURIComponent(
    xmlSerializer.serializeToString(icon)
  )}`;
}

function triangle(style) {
  const icon = svg.node`
  <svg width=24 height=24 viewBox='${`0 0 24 24`}' xmlns='http://www.w3.org/2000/svg'>
  <polygon points="12,4.68 2,22 22,22" 
  fill="#333" stroke="#333" opacity=0.4 stroke-opacity=0.4 stroke-width=3
  stroke-linejoin="round"/>`;

  icon.appendChild(svg.node`<polygon
    fill=${style.fillColor || '#FFF'} stroke=${
    style.fillColor || '#FFF'
  } stroke-width=2
    points="12,4.68 2,22 22,22"  stroke-linejoin="round"/>`);

  style.layers &&
    Object.entries(style.layers).forEach((layer) => {
      function x(val, scale) {
        return 12 + (val - 12) * scale;
      }

      function y(val, scale) {
        return 16 + (val - 16) * scale;
      }

      let points = `${x(12, layer[0])},${y(4.68, layer[0])} ${x(
        2,
        layer[0]
      )}, ${y(22, layer[0])} ${x(22, layer[0])}, ${y(22, layer[0])}`;

      icon.appendChild(svg.node`<polygon
    fill=${layer[1]} stroke=${layer[1] || '#FFF'} stroke-width=1
    points="${points}" stroke-linejoin="round"/>`);
    });

  return `data:image/svg+xml,${encodeURIComponent(
    xmlSerializer.serializeToString(icon)
  )}`;
}

function square(style) {
  const icon = svg.node`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <rect fill='#333' opacity=0.3 width=20 height=20 x=2 y=2 rx=1></rect>
    <rect fill=${
      style.fillColor || '#FFF'
    } width=20 height=20 x=0 y=0 rx=1></rect>`;

  style.layers &&
    Object.entries(style.layers).forEach((layer) => {
      icon.appendChild(svg.node`<rect fill=${layer[1]}
      width=${parseFloat(layer[0]) * 20}
      height=${parseFloat(layer[0]) * 20}
      x=${10 * (1 - parseFloat(layer[0]))}
      y=${10 * (1 - parseFloat(layer[0]))} rx=${parseFloat(layer[0])}></rect>`);
    });

  return `data:image/svg+xml,${encodeURIComponent(
    xmlSerializer.serializeToString(icon)
  )}`;
}

function diamond(style) {
  const icon = svg.node`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
  <polygon fill='#333' opacity=0.3
    points="12 0, 24 12, 12 24, 0 12"
    ></polygon>
    <polygon fill=${style.fillColor || '#FFF'}
    points="12 0, 24 12, 12 24, 0 12"
    ></polygon>`;

  function s(val, scale) {
    return 12 + (val - 12) * scale;
  }

  style.layers &&
    Object.entries(style.layers).forEach((layer) => {
      let points = `${s(12, layer[0])} ${s(0, layer[0])},${s(24, layer[0])} ${s(
        12,
        layer[0]
      )},${s(12, layer[0])} ${s(24, layer[0])}, ${s(0, layer[0])} ${s(
        12,
        layer[0]
      )}`;

      icon.appendChild(svg.node`
      <polygon fill=${layer[1] || '#FFF'}
      points="${points}"
      ></polygon>`);
    });

  return `data:image/svg+xml,${encodeURIComponent(
    xmlSerializer.serializeToString(icon)
  )}`;
}

function semiCircle(style) {
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
    <circle cx=10 cy=10 r=10 fill=${
      style.fillColor || '#FFF'
    } clip-path="url(#cut-off-shade)">`;

  style.layers &&
    Object.entries(style.layers).forEach((layer) => {
      icon.appendChild(svg.node`
    <circle cx=10 cy=10 r=${parseFloat(layer[0]) * 10} fill=${
        layer[1]
      } clip-path="url(#cut-off-shade)">`);
    });

  return `data:image/svg+xml,${encodeURIComponent(
    xmlSerializer.serializeToString(icon)
  )}`;
}

function markerLetter(style) {
  const icon = svg.node`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    
    
    <path style="opacity: 0.5;" fill=${style.colorMarker}
      d=" M 12.692 1.969 C 8.605 1.969 5.334 5.239 5.334 9.328 C 5.334 10.963 5.743 12.189 6.764 14.028 C 8.808 17.504 11.922 21.996 11.922 21.996 C 11.922 21.996 16.576 17.504 18.62 14.028 C 19.642 12.189 20.051 10.963 20.051 9.328 C 20.051 5.239 16.78 1.969 12.692 1.969 Z "/>
    <path fill=${style.color}
      d=" M 12 1.969 C 7.878 1.969 4.813 5.239 4.813 9.328 C 4.813 10.554 5.222 12.189 6.244 14.028 C 8.289 17.504 12 22 12 22 C 12 22 16.055 17.504 18.099 14.028 C 19.122 12.189 19.341 10.963 19.341 9.328 C 19.341 5.239 16.054 1.969 12 1.969 Z "/>
    <circle cx="12.17192400568182" cy="8.918683238636365" r="5.109789772727275" opacity=0.8 fill="rgb(255, 255, 255)"/>
    <text x=12 y=12 style="text-anchor: middle; font-weight: 600; font-size: 10px; font-family: sans-serif; fill: rgb(85, 85, 85);">
    ${style.letter}`;

  return `data:image/svg+xml,${encodeURIComponent(
    xmlSerializer.serializeToString(icon)
  )}`;
}

function markerColor(style) {
  const icon = svg.node`
  <svg width=18 height=24 viewBox='0 0 24 18' xmlns='http://www.w3.org/2000/svg'>
    <path style="opacity: 0.5;" fill=${style.colorMarker}
      d="M 10.797 1.238 C 6.308 1.238 2.716 4.83 2.716 9.32 C 2.716 11.116 3.165 12.463 4.287 14.483 C 6.532 18.3 9.952 23.234 9.952 23.234 C 9.952 23.234 15.063 18.3 17.308 14.483 C 18.43 12.463 18.879 11.116 18.879 9.32 C 18.879 4.83 15.287 1.238 10.797 1.238 Z"/>
    <path fill=${style.colorMarker}
      d="M 10 1.238 C 5.51 1.238 2.144 4.83 2.144 9.32 C 2.144 10.667 2.593 12.463 3.716 14.483 C 5.961 18.3 10 23.238 10 23.238 C 10 23.238 14.491 18.3 16.736 14.483 C 17.859 12.463 18.1 11.116 18.1 9.32 C 18.1 4.83 14.49 1.238 10 1.238 Z"/>
    <circle cx=10.226 cy=8.871 r=5.612 opacity=0.8 fill="rgb(255, 255, 255)"/>
    <circle cx=10.226 cy=8.871 r=2.806 opacity=0.8 fill=${style.colorDot}/>`;

  return `data:image/svg+xml,${encodeURIComponent(
    xmlSerializer.serializeToString(icon)
  )}`;
}

function geolocation() {
  const icon = svg.node`
  <svg width=1000 height=1000 viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'>
    <circle cx=500 cy=500 r=350 stroke='#1F964D' opacity=0.8 stroke-width=75 fill=none></circle>
    <circle cx=500 cy=500 r=200 fill='#1F964D' opacity=0.8></circle>
    <path stroke='#1F964D' opacity=0.8 stroke-width=75 d="M500,150L500,0M500,850L500,1000M0,500L150,500M850,500L1000,500" />`;

  return `data:image/svg+xml,${encodeURIComponent(
    xmlSerializer.serializeToString(icon)
  )}`;
}

function circle(style) {
  const icon = svg.node`
  <svg width=24 height=24 viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'>
    <circle cx=16 cy=16 r=10
      stroke="#333"
      stroke-width="${style.strokeWidth || 1}"
      fill="none"></circle>
    <circle cx=15 cy=15 r=10
      stroke="${style.strokeColor || '#333'}"
      stroke-width="${style.strokeWidth || 1}"
      fill="${style.fillColor || 'none'}"></circle>`;

  return `data:image/svg+xml,${encodeURIComponent(
    xmlSerializer.serializeToString(icon)
  )}`;
}

function clusterSummary(style) {
  const icon = svg.node`
    <svg height="20" width="20" viewBox="0 0 20 20">
      <circle r="10" cx="10" cy="10" fill="white" />
      <circle r="5" cx="10" cy="10" fill="transparent"
          stroke="tomato"
          stroke-width="10"
          stroke-dasharray="calc(35 * 31.4 / 100) 31.4"
          transform="rotate(-90) translate(-20)" />
    </svg>
  `;

  // return `data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%20220%20200%22%20text-anchor%3D%22middle%22%20style%3D%22font%3A%2016px%20sans-serif%3B%20transform%3A%20translate(-50%25%2C%20-50%25)%20translate(393px%2C%20280px)%20rotateX(0deg)%20rotateZ(0deg)%3B%22%3E%3Cpath%20d%3D%22M%2040%2016%20L%2040%200%20A%2040%2040%200%200%201%2052.98797876818735%2077.83268966802538%20L%2047.792787260912405%2062.69961380081523%20A%2024%2024%200%200%200%2040%2016%20%22%20fill%3D%22%23C32121%22%2F%3E%3Cpath%20d%3D%22M%2047.792787260912405%2062.69961380081523%20L%2052.98797876818735%2077.83268966802538%20A%2040%2040%200%200%201%201.9378493312257774%2027.70070382226976%20L%2017.162709598735464%2032.620422293361855%20A%2024%2024%200%200%200%2047.792787260912405%2062.69961380081523%20%22%20fill%3D%22%23EC671C%22%2F%3E%3Cpath%20d%3D%22M%2017.162709598735464%2032.620422293361855%20L%201.9378493312257774%2027.70070382226976%20A%2040%2040%200%200%201%2019.628624691956617%205.576068381737102%20L%2027.77717481517397%2019.34564102904226%20A%2024%2024%200%200%200%2017.162709598735464%2032.620422293361855%20%22%20fill%3D%22%23DFB436%22%2F%3E%3Cpath%20d%3D%22M%2027.77717481517397%2019.34564102904226%20L%2019.628624691956617%205.576068381737102%20A%2040%2040%200%200%201%2026.63125358815781%202.300177462276338%20L%2031.978752152894685%2017.380106477365803%20A%2024%2024%200%200%200%2027.77717481517397%2019.34564102904226%20%22%20fill%3D%22%23B8BF08%22%2F%3E%3Cpath%20d%3D%22M%2031.978752152894685%2017.380106477365803%20L%2026.63125358815781%202.300177462276338%20A%2040%2040%200%200%201%2039.99999999999999%200%20L%2039.99999999999999%2016%20A%2024%2024%200%200%200%2031.978752152894685%2017.380106477365803%20%22%20fill%3D%22%2375AA03%22%2F%3E%3Cpath%20d%3D%22M%2039.99999999999999%2016%20L%2039.99999999999999%200%20A%2040%2040%200%200%201%2039.99999999999999%200%20L%2039.99999999999999%2016%20A%2024%2024%200%200%200%2039.99999999999999%2016%20%22%20fill%3D%22%23248DC1%22%2F%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2240%22%20r%3D%2224%22%20fill%3D%22%23f6f6f4%22%2F%3E%3Ctext%20dominant-baseline%3D%22central%22%20fill%3D%22%235f625f%22%20class%3D%22donut-text%22%20transform%3D%22translate(40%2C%2040)%22%3E3%2C116%3C%2Ftext%3E%3C%2Fsvg%3E`;

  return `data:image/svg+xml,${encodeURIComponent(
    xmlSerializer.serializeToString(icon)
  )}`;
}
