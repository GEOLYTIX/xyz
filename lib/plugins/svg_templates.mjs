/**
### Svg Templates Plugin
@module /plugins/svg_templates
*/

/**
Fetches and stores SVG templates for use in the application.
@async
@function svg_templates
@param {Object} plugin - The plugin configuration object containing SVG template URLs.
@param {Object} mapview - The mapview object.
@returns {Promise<void>}
*/
export async function svg_templates(plugin, mapview) {

  if (typeof mapp.utils.svgSymbols.templates !== 'object') {
    mapp.utils.svgSymbols.templates = {}
  }

  // Iterate through svg_templates entries.
  const promises = Object.entries(plugin).map(entry => {

    // Fetch entry value.
    return fetch(entry[1])
      .then(response => response.text())
      .then(svgString => {

        // Assign parsed svgString as entry key to templates object.
        mapp.utils.svgSymbols.templates[entry[0]] = svgString
      })
  })

  await Promise.all(promises)
}