export default _xyz => layer => {

  let timeout

  const legend = _xyz.utils.html.node`<div class="legend" style="margin-top: 5px;">`

  const grid = legend.appendChild(_xyz.utils.html.node`
  <div style="display: grid; align-items: center;">`)

  const types = {
    text: textInput,
    range: rangeInput
  }

  layer.style.theme.fields?.forEach(field => grid.appendChild(types[field.type](field)))

  return legend

  function textInput(params) {

    return _xyz.utils.html.node`
    <div style="grid-column: 1;">${params.title}</div>
    <input
      style="grid-column: 3;"
      value=${layer.style[params.style || 'default'][params.field]}
      onchange=${e=>{
        layer.style[params.style || 'default'][params.field] = e.target.value
        clearTimeout(timeout)
        timeout = setTimeout(() => layer.reload(), 1000)
      }}>`

  }

  function rangeInput(params) {

    return _xyz.utils.html.node`
    <div style="grid-column: 1;">${params.title}</div>
    <div style="grid-column: 2;">${layer.style[params.style || 'default'][params.field]}</div>
    <div class="input-range"  style="grid-column: 3;">
      <input
        type="range"
        class="secondary-colour-bg"
        min=${params.min || 0}
        value=${layer.style[params.style || 'default'][params.field]}
        max=${params.max || 1}
        step=${params.step || 0.1}
        oninput=${e=>{
          layer.style[params.style || 'default'][params.field] = e.target.value
          e.target.parentNode.previousSibling.previousSibling.textContent = e.target.value
          clearTimeout(timeout)
          timeout = setTimeout(() => layer.reload(), 1000)
        }}>`
  }

}