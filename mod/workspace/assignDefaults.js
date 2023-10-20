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
  })

}