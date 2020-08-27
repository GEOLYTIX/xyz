import categorized from './categorized.mjs'

import graduated from './graduated.mjs'

import grid from './grid.mjs'

import basic from './basic.mjs'

export default _xyz => {

  const legends = {

    categorized: categorized(_xyz),

    graduated: graduated(_xyz),
     
    grid: grid(_xyz),

    basic: basic(_xyz),

  }

  return layer => {

    layer.style.legend = _xyz.utils.html.node`<div class="legend">`

    if (layer.format === 'grid') return legends.grid(layer)

    if (layer.style.theme.type === 'basic') return legends.basic(layer)

    layer.filter = layer.filter || {}

    if (layer.style.theme.type === 'categorized') return legends.categorized(layer)
  
    if (layer.style.theme.type === 'graduated') return legends.graduated(layer)
      
  }

}