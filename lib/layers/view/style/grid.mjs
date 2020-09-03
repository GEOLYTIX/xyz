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
    <span>${Object.keys(layer.grid_fields)[0]}</span>
    <div class="icon"></div>
  </div>
  <ul>
    ${Object.entries(layer.grid_fields).map(
      keyVal => _xyz.utils.html`
        <li onclick=${e=>{
          const drop = e.target.closest('.btn-drop')
          drop.classList.toggle('active')
          drop.querySelector(':first-child').textContent = keyVal[0]
          layer.grid_size = keyVal[1]
          layer.reload()
        }}>${keyVal[0]}`)}`)

  // Grid SVG legend.
  const svg = legend.appendChild(_xyz.utils.svg.node`<svg width=100% height=100px>`);

  // Create grid_size dropdown.
  legend.appendChild(_xyz.utils.html.node`
  <button class="btn-drop">
  <div
    class="head"
    onclick=${e => {
      e.preventDefault()
      e.target.parentElement.classList.toggle('active')
    }}>
    <span>${Object.keys(layer.grid_fields)[1]}</span>
    <div class="icon"></div>
  </div>
  <ul>
    ${Object.entries(layer.grid_fields).map(
      keyVal => _xyz.utils.html`
      <li onclick=${e=>{
        const drop = e.target.closest('.btn-drop')
        drop.classList.toggle('active')
        drop.querySelector(':first-child').textContent = keyVal[0]
        layer.grid_color = keyVal[1]
        layer.reload()
      }}>${keyVal[0]}`)}`)


  // Populate SVG grid legend
  let
    yTrack = 38,
    n = layer.style.range.length,
    w = 100 / n

  // Create the size circle row.
  for (let i = 0; i < n; i++) {

    let
      r = (i + 2) * 10 / n,
      x = i * w

    svg.appendChild(_xyz.utils.svg.node`
    <circle
      fill='#777'
      cx='${x + w / 2 + 1 + '%'}'
      cy='${yTrack + 1}'
      r='${r}'/>
    <circle
      fill='#999'
      cx='${x + w / 2 + '%'}'
      cy='${yTrack}'
      r='${r}'/>`)


    if (i === 0) {
      legend.size_min = svg.appendChild(_xyz.utils.svg.node`
      <text
        class='label'
        style='text-anchor: start;'
        x=${x  + '%'}
        y=${yTrack - 20}>${_xyz.language.layer_grid_legend_min}`)
    }

    if (i === (n / 2 % 1 != 0 && Math.round(n / 2) - 1)) {
      legend.size_avg = svg.appendChild(_xyz.utils.svg.node`
      <text
        class='label'
        style='text-anchor: middle;'
        x=${x + w / 2 + '%'}
        y=${yTrack - 20}>${_xyz.language.layer_grid_legend_avg}`)
    }

    if (i === n - 1) {
      legend.size_max = svg.appendChild(_xyz.utils.svg.node`
      <text
        class='label'
        style='text-anchor: end;'
        x=${x + w + '%'}
        y=${yTrack - 20}>${_xyz.language.layer_grid_legend_max}`);
    }

  }

  yTrack += 20;

  // Create the colour box row.
  for (let i = 0; i < n; i++) {

    let x = i * w

    svg.appendChild(_xyz.utils.svg.node`
    <rect
      height=20
      width=${w + '%'}
      x=${x  + '%'}
      y=${yTrack}
      fill=${layer.style.range[i]}`)

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
  
  legend.appendChild(_xyz.utils.html.node`
  <td style="padding-top: 5px;" colSpan=2>
  <label class="input-checkbox">
  <input type="checkbox"
    onchange=${e => {
      layer.grid_ratio = e.target.checked
      layer.reload()
    }}>
  </input>
  <div></div><span>${_xyz.language.layer_grid_legend_ratio}`);

  return legend

}