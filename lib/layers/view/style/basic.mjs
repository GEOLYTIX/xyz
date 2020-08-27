export default _xyz => layer => {

  const legend = _xyz.utils.html.node`<div class="legend" style="margin-top: 5px;">`

  polyStyle(layer, layer.style.default, 'Default')

  return legend

  function polyStyle(layer, style, title){
 
    legend.appendChild(_xyz.utils.html.node`
    <div style="display: grid;">
      <div style="grid-column: 1;">Stroke</div>
      <input style="grid-column: 2;" value="${style.strokeColor}"></input>
      <div style="grid-column: 1;">Width</div>
      <div style="grid-column: 1;">Fill</div>
      <input style="grid-column: 2;" value="${style.fillColor}"></input>
      <div style="grid-column: 1;">Opacity</div>
    `)

  }

}