const defaults = require('./defaults')

module.exports = async workspace => {

  Object.keys(workspace.locales).forEach(locale_key => {

    const locale = workspace.locales[locale_key]

    locale.key = locale_key

    locale.name = locale.name || locale_key

    Object.keys(locale.layers).forEach(layer_key => {

      let layer = locale.layers[layer_key]

      layer.key = layer_key

      if (layer.template && workspace.templates[layer.template]) {
        layer = Object.assign({},
          workspace.templates[layer.template],
          layer)
      }

      layer = Object.assign({},
        layer.format && defaults.layers[layer.format] || {},
        layer)

      layer.style = layer.style && Object.assign({},
        layer.format && defaults.layers[layer.format].style,
        layer.style)

      locale.layers[layer_key] = layer
    })
  })

  Object.keys(workspace.templates).forEach(layer_key => {

    let layer = workspace.templates[layer_key]

    if (layer.format && defaults.layers[layer.format]) {

      layer.key = layer_key

      layer = Object.assign({},
        defaults.layers[layer.format],
        layer)

      layer.style = layer.style && Object.assign({},
        defaults.layers[layer.format].style,
        layer.style)

      workspace.templates[layer_key] = layer

    }

  })

}