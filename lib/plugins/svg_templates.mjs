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