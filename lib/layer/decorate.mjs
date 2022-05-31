import show from './show.mjs'

import hide from './hide.mjs'

import tableCurrent from './tableCurrent.mjs'

import tableMax from './tableMax.mjs'

import tableMin from './tableMin.mjs'

export default function (layer) {
  
  mapp.layer.format[layer.format]
    && mapp.layer.format[layer.format](layer)
  
  Object.assign(layer, {
    show,
    hide,
    tableCurrent,
    tableMax,
    tableMin,
    zoomToExtent,
  })

  layer.hover && typeof layer.hover !== 'function' && hover(layer)

  layer.filter = layer.filter || {}

  layer.filter.current = layer.filter.current || {}

  // Set the first theme from themes array as layer.style.theme
  if (layer.style && layer.style.themes) {
    layer.style.theme = layer.style.theme
      || layer.style.themes[Object.keys(layer.style.themes)[0]];
  }

  Object.keys(layer).forEach((key) => {
    mapp.plugins[key] && mapp.plugins[key](layer);
  });

  return layer
}

function hover(layer) {

  const field = layer.hover.field

  const template = layer.hover.query || 'infotip'

  layer.hover = feature => {

    let key = layer.mapview.interaction.current.key

    let paramString = mapp.utils.paramString({
      dbs: layer.dbs,
      locale: layer.mapview.locale.key,
      layer: layer.key,
      template: template,
      qID: layer.qID,
      id: layer.highlight,
      table: layer.tableCurrent(),
      geom: layer.geom,
      field: field,
      coords: layer.format === 'cluster'
        && ol.proj.transform(
          feature.getGeometry().getCoordinates(),
          `EPSG:${layer.mapview.srid}`,
          `EPSG:${layer.srid}`)
    })

    mapp.utils.xhr(`${layer.mapview.host}/api/query?${paramString}`)
      .then(response => {
        if(layer.mapview.interaction?.current?.key !== key) return;
        if (!layer.mapview.position) return;
        if (!response) return;
        if (response.label == '') return;
        layer.mapview.infotip(response.label)
      })
  }
}

async function zoomToExtent(params) {

  const layer = this
  
  let response = await mapp.utils.xhr(`${layer.mapview.host}/api/query/layer_extent?`+
    mapp.utils.paramString({
      dbs: layer.dbs,
      locale: layer.mapview.locale.key,
      layer: layer.key,
      table: layer.table || Object.values(layer.tables)[0] || Object.values(layer.tables)[1],
      geom: layer.geom,
      proj: layer.srid,
      srid: layer.mapview.srid,
      filter: layer.filter.current
    }))

  const bounds = /\((.*?)\)/.exec(response.box2d)[1].replace(/ /g, ',')

  layer.mapview
    .fitView(bounds.split(',')
    .map(coords => parseFloat(coords)), params)

}