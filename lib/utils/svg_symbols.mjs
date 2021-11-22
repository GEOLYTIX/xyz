export default {
  dot,
  target,
  triangle,
  square,
  semiCircle,
  markerLetter,
  markerColor,
  circle,
  diamond,
  clusterSummary,
  commonplacePin,
};

import { svg } from "uhtml";

const xmlSerializer = new XMLSerializer();

function dot(style) {
  const icon = svg.node`
    <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
      <circle cx=13 cy=13 r=10 fill='#333'></circle>
      <circle cx=12 cy=12 r=10 fill=${style.fillColor || "#fff"}></circle>`;

  return `data:image/svg+xml,${encodeURIComponent(
    xmlSerializer.serializeToString(icon)
  )}`;
}

function target(style) {
  const icon = svg.node`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <circle cx=13 cy=13 fill='#333' r=10 opacity=0.4></circle>
    <circle cx=12 cy=12 r=10 fill=${style.fillColor || "#FFF"}>`;

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
    fill=${style.fillColor || "#FFF"} stroke=${
    style.fillColor || "#FFF"
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
    fill=${layer[1]} stroke=${layer[1] || "#FFF"} stroke-width=1
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
      style.fillColor || "#FFF"
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
    <polygon fill=${style.fillColor || "#FFF"}
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
      <polygon fill=${layer[1] || "#FFF"}
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
      style.fillColor || "#FFF"
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

function circle(style) {
  const icon = svg.node`
  <svg width=24 height=24 viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'>
    <circle cx=15 cy=15 r=10
      stroke="${style.strokeColor || "#333"}"
      stroke-width="${style.strokeWidth || 1}"
      stroke-opacity="${style.strokeOpacity || 1}"
      fill="${style.fillColor || "none"}"></circle>`;

  return `data:image/svg+xml,${encodeURIComponent(
    xmlSerializer.serializeToString(icon)
  )}`;
}

function clusterSummary(style, feature) {
  const properties = feature.getProperties();
  const { cat } = properties;
  if (!cat) return null;

  const themeCat = style.cat;

  const size = 25;
  const getStrokeColor = (value) => {
    return themeCat[value].style.strokeColor;
  };
  const getPercentage = (value) => {
    if (!cat) return 0;
    return (cat.filter((c) => c === value).length * 100) / cat.length;
  };
  const getPercentageWithRest = (value) => {
    const percentage = getPercentage(value);
    const rest = 100 - percentage;
    return `${percentage.toFixed(2)} ${rest.toFixed(2)}`;
  };
  const getDashArray = (value) => {
    const precedingSegments = Object.keys(themeCat).reduce(
      (acc, key) => (acc += +key < value ? +getPercentage(+key) : 0),
      0
    );
    return 100 - precedingSegments + 25;
  };

  const icon = svg.node`
        <svg width="${size}" height="${size}" viewBox="0 0 42 42" aria-labelledby="beers-title beers-desc" role="img">
        <circle cx="21" cy="21" r="15.91549430918954" fill="#f6f6f4" role="presentation"></circle>
        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" stroke-width="5" role="presentation"></circle>
        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="${getStrokeColor(
          0
        )}" stroke-width="5" stroke-dasharray="${getPercentageWithRest(
    0
  )}" stroke-dashoffset="${getDashArray(0)}"></circle>
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="${getStrokeColor(
            25
          )}" stroke-width="5" stroke-dasharray="${getPercentageWithRest(
    25
  )}" stroke-dashoffset="${getDashArray(25)}"></circle>
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="${getStrokeColor(
            50
          )}" stroke-width="5" stroke-dasharray="${getPercentageWithRest(
    50
  )}" stroke-dashoffset="${getDashArray(50)}"></circle>
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="${getStrokeColor(
            75
          )}" stroke-width="5" stroke-dasharray="${getPercentageWithRest(
    75
  )}" stroke-dashoffset="${getDashArray(75)}"></circle>
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="${getStrokeColor(
            100
          )}" stroke-width="5" stroke-dasharray="${getPercentageWithRest(
    100
  )}" stroke-dashoffset="${getDashArray(100)}"></circle>
        <text x=21 y=24 style="text-anchor: middle; font-weight: 600; font-size: 10px; font-family: sans-serif; fill: rgb(85, 85, 85);">
          ${properties.count}
        </svg>
      `;
  return `data:image/svg+xml,${encodeURIComponent(
    xmlSerializer.serializeToString(icon)
  )}`;
  // }
}

function commonplacePin(style) {
  const icon = svg.node`
  <svg
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    viewBox="-50 0 600 500"
    style="enable-background:new 0 0 24 18;"
    xml:space="preserve"
    width="20px"
    height="20px"
  >
    <path
      d="M256,0C153.755,0,70.573,83.182,70.573,185.426c0,126.888,165.939,313.167,173.004,321.035
      c6.636,7.391,18.222,7.378,24.846,0c7.065-7.868,173.004-194.147,173.004-321.035C441.425,83.182,358.244,0,256,0z M256,278.719
      c-51.442,0-93.292-41.851-93.292-93.293S204.559,92.134,256,92.134s93.291,41.851,93.291,93.293S307.441,278.719,256,278.719z"
      fill=${style.pinColor}
      style="filter: drop-shadow(0 0 2.75rem #a3a3a3)"
    />
  `;

  return `data:image/svg+xml,${encodeURIComponent(
    xmlSerializer.serializeToString(icon)
  )}`;
}
