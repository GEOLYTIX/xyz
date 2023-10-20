const merge = require('../utils/merge')

module.exports = async workspace => {

  workspace.locale ??= {
    layers: {}
  }

  workspace.locales ??= {
    locale: workspace.locale
  }

  // Loop through locale keys in workspace.
  Object.keys(workspace.locales).forEach(locale_key => {

    // Get locale object from key.
    const locale = workspace.locales[locale_key]

    // A default locale has been defined in the workspace.
    if (typeof workspace.locale === 'object') {

      // Merge the workspace template into workspace.
      merge(locale, workspace.locale)
    }

    // A template exists for the locale key.
    if (Object.hasOwn(workspace.templates, locale_key) && typeof workspace.templates[locale_key] === 'object') {

      // Merge the workspace template into workspace.
      merge(locale, workspace.templates[locale_key])
    }

    // Assign key value as key on locale object.
    locale.key = locale_key

    // Assign locale key as name with no existing name on locale object.
    locale.name = locale.name || locale_key

    return;

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

      if (Array.isArray(layer.templates)) {

        // Merge templates from templates array into layer.
        layer.templates.forEach(template => {
          merge(layer, workspace.templates[template] || {})
        })
      }

      // Check for layer geom[s].
      if ((layer.table || layer.tables) && (!layer.geom && !layer.geoms)) {

        console.warn(`Layer: ${layer.key},has a table or tables defined, but no geom or geoms.`)
      }

      // Assign layer key as name with no existing name on layer object.
      layer.name = layer.name || layer_key

      // Assign layer to workspace locale
      locale.layers[layer_key] = layer
    })

  })

}