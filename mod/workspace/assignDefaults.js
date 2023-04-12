const defaults = require('./defaults')

const merge = require('../utils/merge')

module.exports = async workspace => {

  // Loop through locale keys in workspace.
  Object.keys(workspace.locales).forEach(locale_key => {

    // Get locale object from key.
    const locale = workspace.locales[locale_key]

    // A default locale has been defined in the workspace.
    if (typeof workspace.locale === 'object') {

      // Merge the workspace template into workspace.
      merge(locale, workspace.locale)
    }

    // A template exists for the workspace key.
    if (Object.hasOwn(workspace.templates, locale_key) && typeof workspace.templates[locale_key] === 'object') {

      // Merge the workspace template into workspace.
      merge(locale, workspace.templates[locale_key])
    }

    // Assign key value as key on locale object.
    locale.key = locale_key

    // Assign locale key as name with no existing name on locale object.
    locale.name = locale.name || locale_key

    // Loop through layer keys in locale.
    Object.keys(locale.layers).forEach(layer_key => {

      // Get layer object from key.
      let layer = locale.layers[layer_key]

      // Assign key value as key on layer object.
      layer.key = layer_key

      // Merge layer object with layer template object.
      layer = merge({},

        // Assign layer template implicit or from key lookup.
        workspace.templates[layer.template || layer.key] || {},

        // Layer entries must override template entries.
        layer)

      // Assign layer format defaults.
      layer = layer.format && Object.assign({},

        // Assign layer defaults.
        defaults.layers[layer.format] || {},

        // Layer entries must override template entries.
        layer) || layer

      // Merge default layer style.
      layer.style = layer.format && merge({},

        // Assign layer format default style first.
        defaults.layers[layer.format]?.style || {},

        // Layer style must override the default style.
        layer.style || {})

      if (Array.isArray(layer.templates)) {

        // Merge templates from templates array into layer.
        layer.templates.forEach(template => {
          merge(layer, workspace.templates[template] || {})
        })
      }

      // Check for layer geom[s].
      if ((layer.table || layer.tables) && (!layer.geom && !layer.geoms)) {

        console.warn('Layer with a table or tables must have a geom or geoms defined.')
      }

      // Assign layer key as name with no existing name on layer object.
      layer.name = layer.name || layer_key

      // Assign layer to workspace locale
      locale.layers[layer_key] = layer
    })

  })

}