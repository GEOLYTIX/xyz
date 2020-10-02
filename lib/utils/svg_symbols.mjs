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

import chroma from 'chroma-js'

import { svg } from 'uhtml'

const xmlSerializer = new XMLSerializer()

function dot(style) {

  const icon = svg.node`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <circle cx=11 cy=10.5 r=10 fill=${chroma(style.fillColor || '#fff').darken()}></circle>
    <circle cx=10 cy=10 r=10 fill=${style.fillColor || '#fff'}></circle>`

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`
}

function target(style) {

  const icon = svg.node`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <circle cx=13 cy=13 fill='#333' r=10 opacity=0.4></circle>
    <circle cx=12 cy=12 r=10 fill=${style.fillColor || '#FFF'}>`

  style.layers && Object.entries(style.layers).forEach(layer => {

    icon.appendChild(svg.node`<circle cx=12 cy=12 r=${parseFloat(layer[0]) * 10} fill=${layer[1]}>`)

  })

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`
}

function triangle(style) {

  const icon = svg.node`
  <svg width=32 height=24 viewBox='0 -2 20 20' xmlns='http://www.w3.org/2000/svg'>
  <path fill="#333" stroke="#333" opacity=0.4 stroke-opacity=0.4 stroke-width=3
    d="M0,-19.6L17,9.8L-17,9.8Z" stroke-linejoin="round"
    transform="translate(11 12) scale(0.6)"/>`;

  icon.appendChild(svg.node`<path
    fill=${style.fillColor || '#FFF'} stroke=${style.fillColor || '#FFF'} stroke-width=2
    d="M0,-19.6L17,9.8L-17,9.8Z" stroke-linejoin="round"
    transform=${`translate(10 11) scale(0.6)`}/>`)
  
  style.layers && Object.entries(style.layers).forEach(layer => {

    icon.appendChild(svg.node`<path
    fill=${layer[1]} stroke=${layer[1] || '#FFF'} stroke-width=2
    d="M0,-19.6L17,9.8L-17,9.8Z" stroke-linejoin="round"
    transform=${`translate(10 11) scale(${layer[0]*0.6})`}/>`)
  })

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`
}

function square(style) {

  const icon = svg.node`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <rect fill='#333' opacity=0.3 width=20 height=20 x=2 y=2 rx=1></rect>
    <rect fill=${style.fillColor || '#FFF'} width=20 height=20 x=0 y=0 rx=1></rect>`

  style.layers && Object.entries(style.layers).forEach(layer => {

    icon.appendChild(svg.node`<rect fill=${layer[1]}
      width=${parseFloat(layer[0]) * 20}
      height=${parseFloat(layer[0]) * 20}
      x=${10*(1-parseFloat(layer[0]))}
      y=${10*(1-parseFloat(layer[0]))} rx=${parseFloat(layer[0])}></rect>`)
  })

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`
}

function semiCircle(style){

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
    <circle cx=10 cy=10 r=10 fill=${style.fillColor || '#FFF'} clip-path="url(#cut-off-shade)">`

  style.layers && Object.entries(style.layers).forEach(layer => {

    icon.appendChild(svg.node`
    <circle cx=10 cy=10 r=${parseFloat(layer[0]) * 10} fill=${layer[1]} clip-path="url(#cut-off-shade)">`)

  })

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`
}

function markerLetter(style) {

  const icon = svg.node`
  <svg width=18 height=24 viewBox='0 0 24 18' xmlns='http://www.w3.org/2000/svg'>
    <path style="opacity: 0.5;" fill=${style.colorMarker}
      d="M 10.797 1.238 C 6.308 1.238 2.716 4.83 2.716 9.32 C 2.716 11.116 3.165 12.463 4.287 14.483 C 6.532 18.3 9.952 23.234 9.952 23.234 C 9.952 23.234 15.063 18.3 17.308 14.483 C 18.43 12.463 18.879 11.116 18.879 9.32 C 18.879 4.83 15.287 1.238 10.797 1.238 Z"/>
    <path fill=${style.color}
      d="M 10 1.238 C 5.51 1.238 2.144 4.83 2.144 9.32 C 2.144 10.667 2.593 12.463 3.716 14.483 C 5.961 18.3 10 23.238 10 23.238 C 10 23.238 14.491 18.3 16.736 14.483 C 17.859 12.463 18.1 11.116 18.1 9.32 C 18.1 4.83 14.49 1.238 10 1.238 Z"/>
    <circle cx=10.226 cy=8.871 r=5.612 opacity=0.8 fill="rgb(255, 255, 255)"/>
    <text x=10 y=11.5 style="text-anchor: middle; font-weight: 600; font-size: 10px; font-family: sans-serif; fill: rgb(85, 85, 85);">
    ${style.letter}`
  
    return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`
}

function markerColor(style) {

  const icon = svg.node`
  <svg width=18 height=24 viewBox='0 0 24 18' xmlns='http://www.w3.org/2000/svg'>
    <path style="opacity: 0.5;" fill=${style.colorMarker}
      d="M 10.797 1.238 C 6.308 1.238 2.716 4.83 2.716 9.32 C 2.716 11.116 3.165 12.463 4.287 14.483 C 6.532 18.3 9.952 23.234 9.952 23.234 C 9.952 23.234 15.063 18.3 17.308 14.483 C 18.43 12.463 18.879 11.116 18.879 9.32 C 18.879 4.83 15.287 1.238 10.797 1.238 Z"/>
    <path fill=${style.colorMarker}
      d="M 10 1.238 C 5.51 1.238 2.144 4.83 2.144 9.32 C 2.144 10.667 2.593 12.463 3.716 14.483 C 5.961 18.3 10 23.238 10 23.238 C 10 23.238 14.491 18.3 16.736 14.483 C 17.859 12.463 18.1 11.116 18.1 9.32 C 18.1 4.83 14.49 1.238 10 1.238 Z"/>
    <circle cx=10.226 cy=8.871 r=5.612 opacity=0.8 fill="rgb(255, 255, 255)"/>
    <circle cx=10.226 cy=8.871 r=2.806 opacity=0.8 fill=${style.colorDot}/>`

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`
}

function geolocation() {

  const icon = svg.node`
  <svg width=1000 height=1000 viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'>
    <circle cx=500 cy=500 r=350 stroke='#1F964D' opacity=0.8 stroke-width=75 fill=none></circle>
    <circle cx=500 cy=500 r=200 fill='#1F964D' opacity=0.8></circle>
    <path stroke='#1F964D' opacity=0.8 stroke-width=75 d="M500,150L500,0M500,850L500,1000M0,500L150,500M850,500L1000,500" />`

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`
}

function circle(style){

  const icon = svg.node`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <circle cx=12 cy=12 r=11
    stroke="${style.strokeColor || '#333333'}"
    stroke-width="${style.strokeWidth || 1}"
    fill="${style.fillColor || 'none'}"></circle>`

  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`
}