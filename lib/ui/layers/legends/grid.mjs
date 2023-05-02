export default layer => {

  const grid = []

  grid.push(mapp.ui.elements.dropdown({
    entries: Object.entries(layer.grid_fields).map(e=>({
      title: e[0],
      options: e[1]
    })),
    callback: (e, entry) => {
      layer.grid_size = entry.options
      layer.reload()
    }
  }))

  const n = layer.style.range.length

  const xmlSerializer = new XMLSerializer()

  const centreBit = mapp.utils.html`
  <div
    class="grid"
    style=${`grid-template-columns: repeat(${n}, 1fr); grid-template-rows: 20px 20px 20px 20px;`}>
    <div
      data-id="size-labels"
      class="contents"
    >
      <span data-id="size-min" style="grid-row:1;grid-column:1;">min</span>
      <span data-id="size-avg" style=${`grid-row:1;grid-column:${Math.ceil(n/2)};text-align:center;`}>avg</span>
      <span data-id="size-max" style=${`grid-row:1;grid-column:${n};text-align:end;`}>max</span>
    </div>
    <div data-id="size-icons" class="contents">
      ${layer.style.range.map((colour, i)=>{

        let icon = mapp.utils.svg.node`<svg height=50 width=50>
          <circle
            fill='#777'
            cx=27
            cy=27
            r='${(23/n)*(i+1)}'/>
          <circle
            fill='#999'
            cx=25
            cy=25
            r='${(23/n)*(i+1)}'/>`

        let backgroundImage = `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`

        const inlineStyle = `
          grid-row:2;
          grid-column:${i+1};
          background-position: center;
          background-repeat: no-repeat;
          background-size: contain;
          width: 100%;
          height: 100%;
          background-image: url(${backgroundImage});`

        return mapp.utils.html`<div style=${inlineStyle}>`

      })}
    </div>
    <div data-id="colour-icons" class="contents">
      ${layer.style.range.map((colour, i)=>mapp.utils.html`
        <div style=${`grid-row:3;grid-column:${i+1};background-color:${colour};width:100%;height:100%;`}>
      `)}
    </div>
    <div data-id="colour-labels" class="contents">
      <span data-id="color-min" style="grid-row:4;grid-column:1;">min</span>
      <span data-id="color-avg" style=${`grid-row:4;grid-column:${Math.ceil(n/2)};text-align:center;`}>avg</span>
      <span data-id="color-max" style=${`grid-row:4;grid-column:${n};text-align:end;`}>max</span>
    </div>
  </div>`

  grid.push(centreBit)

  // Create grid_size dropdown.
  grid.push(mapp.ui.elements.dropdown({
    entries: Object.entries(layer.grid_fields).map(e=>({
      title: e[0],
      options: e[1]
    })),
    span: Object.keys(layer.grid_fields)[1],
    callback: (e, entry) => {
      layer.grid_color = entry.options
      layer.reload()
    }
  }))

  grid.push(mapp.ui.elements.chkbox({
    label: mapp.dictionary.layer_grid_legend_ratio,
    onchange: (checked) => {
      layer.grid_ratio = checked
      layer.reload()    
    }}))

  layer.style.legend = mapp.utils.html.node`
    <div class="legend">${grid}`

  layer.style.legend.addEventListener('update', () => {
      layer.style.legend.querySelector('[data-id=size-min]').textContent = layer.sizeMin.toLocaleString('en-GB', { maximumFractionDigits: 0 });
      layer.style.legend.querySelector('[data-id=size-avg]').textContent = layer.sizeAvg.toLocaleString('en-GB', { maximumFractionDigits: 0 });
      layer.style.legend.querySelector('[data-id=size-max]').textContent = layer.sizeMax.toLocaleString('en-GB', { maximumFractionDigits: 0 });

      if (layer.grid_ratio) {

        layer.style.legend.querySelector('[data-id=color-min]').textContent = layer.colorMin.toLocaleString('en-GB', { maximumFractionDigits: 0, style: 'percent' });
        layer.style.legend.querySelector('[data-id=color-avg]').textContent = layer.colorAvg.toLocaleString('en-GB', { maximumFractionDigits: 0, style: 'percent' });
        layer.style.legend.querySelector('[data-id=color-max]').textContent = layer.colorMax.toLocaleString('en-GB', { maximumFractionDigits: 0, style: 'percent' });

      } else {

        layer.style.legend.querySelector('[data-id=color-min]').textContent = layer.colorMin.toLocaleString('en-GB', { maximumFractionDigits: 0 });
        layer.style.legend.querySelector('[data-id=color-avg]').textContent = layer.colorAvg.toLocaleString('en-GB', { maximumFractionDigits: 0 });
        layer.style.legend.querySelector('[data-id=color-max]').textContent = layer.colorMax.toLocaleString('en-GB', { maximumFractionDigits: 0 });

      }
  })

  return layer.style.legend
}