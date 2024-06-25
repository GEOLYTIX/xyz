/**
@module /utils/svg_templates
*/

/**
@async
@function svg_templates

@describe
Fetches and stores SVG templates.

@returns {Promise<void>}
*/
export default async function svg_templates(templates) {

  mapp.utils.svgSymbols.templates ??= {}

  // Iterate through svg_templates entries.
  const promises = Object.keys(templates)

    // The template key is not yet loaded into the templates
    .filter(key => !Object.hasOwn(mapp.utils.svgSymbols.templates, key))
    .map(key => {

      // Fetch entry value.
      return fetch(templates[key])
        .then(response => response.text())
        .then(svgString => {

          // Assign parsed svgString as entry key to templates object.
          mapp.utils.svgSymbols.templates[key] = svgString
        })
    })

  await Promise.all(promises)
}