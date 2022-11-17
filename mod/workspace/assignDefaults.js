const defaults = require('./defaults')

const merge = require('../utils/merge')

module.exports = async workspace => {

  // Loop through locales in workspace.
  Object.keys(workspace.locales).forEach(locale_key => {

    const locale = workspace.locales[locale_key]

    locale.key = locale_key

    locale.name = locale.name || locale_key

    // Loop through layers in locale.
    Object.keys(locale.layers).forEach(layer_key => {

      let layer = locale.layers[layer_key]

      layer.key = layer_key

      layer = layer.template && Object.assign({},

        // Assign layer template.
        workspace.templates[layer.template] || {},

        // Layer entries must override template entries.
        layer) || layer

      layer = layer.format && Object.assign({},

        // Assign layer defaults.
        defaults.layers[layer.format] || {},

        // Layer entries must override template entries.
        layer) || layer

      layer.style = layer.format && merge({},

        // Assign layer style.
        defaults.layers[layer.format]?.style || {
          style: {
            hidden: true
          }
        },

        // Layer style must override default style.
        layer.style || {})

      if (Array.isArray(layer.templates)) {

        layer.templates.forEach(template => {
          merge(layer, workspace.templates[template] || {})
        })
      }

      layer.name = layer.name || layer_key

      // Assign layer to workspace locale
      locale.layers[layer_key] = layer
    })

  })

}