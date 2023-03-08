export function svg_templates(plugin) {

  if (typeof mapp.utils.svgSymbols.templates !== 'object') {
    mapp.utils.svgSymbols.templates = {}
  }

  // Iterate through svg_templates entries.
  Object.entries(plugin).forEach(entry => {

    // Fetch entry value.
    fetch(entry[1])
      .then(response => response.text())
      .then(svgString => {

        // Assign parsed svgString as entry key to templates object.
        mapp.utils.svgSymbols.templates[entry[0]] = svgString
      })
  })
}

export function onViewsLoad(hook) {
  /**
   * Registers a hook to plugins onViewsLoadHooks array to run after views are loaded
   * @param {function} hook - Hook to run when vies are loaded
   */

  if (Array.isArray(this.onViewsLoadHooks)) {
    this.onViewsLoadHooks.push(hook);
  } else {
    this.onViewsLoadHooks = [hook];
  }
}