export default (function () {

  // Create object to hold template strings.
  mapp.utils.svgSymbols.templates = {}

  // Assign template method to svgSymbols.
  mapp.utils.svgSymbols.template = (icon) => {

    // Get svgString from svgSymbol.templates.
    let svgString = mapp.utils.svgSymbols.templates[icon.template]

    // Return undefined if svgString not found in templates.
    if (!svgString) return;

    // Iterate through the icon.substitute entries.
    if (typeof icon.substitute === 'Object') {

      Object.entries(icon.substitute).forEach((entry) => {

        // Replace substitute key with values.
        svgString = svgString.replaceAll(entry[0], entry[1]);
      });
    }

    // Return encoded string.
    return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
  }

  mapp.plugins.svg_templates = (plugin) => {

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

})()