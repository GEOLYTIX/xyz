export default _xyz => layer => {

  const legend = _xyz.utils.html.node`<div class="legend">`

  // Create grid_size dropdown.
  legend.appendChild(_xyz.utils.html.node`
  <button class="btn-drop">
  <div
    class="head"
    onclick=${e => {
      e.preventDefault()
      e.target.parentElement.classList.toggle('active')
    }}>
    <span>getEqInterval</span>
    <div class="icon"></div>
  </div>
  <ul>
    ${['getEqInterval', 'getStdDeviation', 'getJenks', 'getQuantile'].map(
      key => _xyz.utils.html`
        <li onclick=${e=>{
          const drop = e.target.closest('.btn-drop')
          drop.classList.toggle('active')
          drop.querySelector(':first-child').textContent = key
          layer.style.theme.geostat = key
          layer.reload()
        }}>${key}`)}`)

  // Grid SVG legend.
  const svg = legend.appendChild(_xyz.utils.svg.node`<svg width=100% height=100px>`);

  // Populate SVG grid legend
  let
    yTrack = 38,
    n = layer.style.theme.cat_arr.length,
    w = 100 / n

  // Create the colour box row.
  for (let i = 0; i < n; i++) {

    let x = i * w

    svg.appendChild(_xyz.utils.svg.node`
    <rect
      height=20
      width=${w + '%'}
      x=${x  + '%'}
      y=${yTrack}
      fill=${layer.style.theme.cat_arr[i].style.fillColor}`)

    if (i === 0) {
      legend.color_min = svg.appendChild(_xyz.utils.svg.node`
      <text
        class='label'
        style='text-anchor: start;'
        x=${x  + '%'}
        y=${yTrack + 40}>${_xyz.language.layer_grid_legend_min}`)
    }

    if (i === (n / 2 % 1 != 0 && Math.round(n / 2) - 1)) {
      legend.color_avg = svg.appendChild(_xyz.utils.svg.node`
      <text
        class='label'
        style='text-anchor: middle;'
        x=${x + w / 2 + '%'}
        y=${yTrack + 40}>${_xyz.language.layer_grid_legend_avg}`)
    }

    if (i === n - 1) {
      legend.color_max = svg.appendChild(_xyz.utils.svg.node`
      <text
        class='label'
        style='text-anchor: end;'
        x=${x + w + '%'}
        y=${yTrack + 40}>${_xyz.language.layer_grid_legend_max}`)
    }

  }
  
  return legend

}