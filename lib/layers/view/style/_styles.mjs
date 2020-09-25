import _categorized from './categorized.mjs'

import _graduated from './graduated.mjs'

import _grid from './grid.mjs'

import _basic from './basic.mjs'

export default _xyz => {

  const style = {

    panel: panel,

    legend: legend,

    themes: {

      categorized: _categorized(_xyz),

      graduated: _graduated(_xyz),
       
      grid: _grid(_xyz),
    
      basic: _basic(_xyz),
      
    },

  }

  return style

  function panel(layer) {

    if (!layer.style) return

    if (!layer.style.theme) return

    if (layer.style.hidden) return

    // Create style panel
    const panel = _xyz.utils.html.node`<div class="drawer panel expandable">`
  
    // Append panel header
    panel.appendChild(_xyz.utils.html.node`
    <div
      class="header primary-colour"
      onclick=${e => {
        e.stopPropagation()
        _xyz.utils.toggleExpanderParent(e.target, true)
      }}>
      <span>${_xyz.language.layer_style_header}</span>
      <button class="btn-header xyz-icon icon-expander primary-colour-filter">`)
  
    // Add toggle for label layer.
    layer.style.label && panel.appendChild(_xyz.utils.html.node`
    <label class="input-checkbox" style="margin-bottom: 10px;">
    <input type="checkbox"
      .checked=${!!layer.style.label.display}
      onchange=${e => {
        layer.style.label.display = e.target.checked
        layer.show()
      }}>
    </input>
    <div></div><span>${_xyz.language.layer_style_display_labels}`)
  
    // Add theme control
    layer.style.themes && panel.appendChild(_xyz.utils.html.node`
      <div>${_xyz.language.layer_style_select_theme}</div>
      <button class="btn-drop">
      <div
        class="head"
        onclick=${e => {
          e.preventDefault();
          e.target.parentElement.classList.toggle('active');
        }}>
        <span>${Object.keys(layer.style.themes)[0]}</span>
        <div class="icon"></div>
      </div>
      <ul>
        ${Object.entries(layer.style.themes).map(
          theme => _xyz.utils.html.node`
          <li onclick=${e=>{
            const drop = e.target.closest('.btn-drop');
            drop.querySelector('span').textContent = theme[0];
            drop.classList.toggle('active');
            layer.style.theme = theme[1];
            applyTheme(layer);
            layer.reload();
          }}>${theme[0]}`)}`);

    layer.style.bringToFront = _xyz.utils.html.node`
      <button 
        title=${_xyz.language.layer_style_bring_to_front}
        style="margin-top: 5px;"
        class="btn-wide primary-colour"
        onclick=${()=>layer.bringToFront()}>${_xyz.language.layer_style_bring_to_front}`

    // Apply the current theme.
    applyTheme(layer)
  
    return panel
  
    function applyTheme(layer) {
      
      // Empty legend.
      layer.style.legend && layer.style.legend.remove()

      layer.style.bringToFront.remove()

      layer.style.legend = _xyz.layers.view.style.legend(layer)
      
      panel.appendChild(layer.style.legend)

      panel.appendChild(layer.style.bringToFront)

    }
  
  }

  function legend(layer) {

    layer.style.legend = _xyz.utils.html.node`<div class="legend">`

    layer.filter = layer.filter || {}

    return style.themes[layer.style.theme.type](layer)

  }

}