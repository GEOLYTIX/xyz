/**
@module /utils/svgTemplates
*/

/**
@function svg_templates
@async

@description
The method parses the templates object param. Templates which are not yet available as mapp.utils.svgSymbols.templates{} will fetched and stored for use in feature style methods.

The svgTemplates method will resolve once all templates have been parsed and loaded.

@param {object} templates An object with svg_template properties to load.

@returns {Promise<void>}
*/
export default async function svgTemplates(templates) {
  if (!templates || !Object.keys(templates).length) return;

  mapp.utils.svgSymbols.templates ??= {};

  // Iterate through svg_templates entries.
  const promises = Object.keys(templates)

    // The template key is not yet loaded into the templates
    .filter((key) => !Object.hasOwn(mapp.utils.svgSymbols.templates, key))
    .map((key) => {
      // Fetch entry value.
      return fetch(templates[key])
        .then((response) => response.text())
        .then((svgString) => {
          // Assign parsed svgString as entry key to templates object.
          mapp.utils.svgSymbols.templates[key] = svgString;
        });
    });

  await Promise.all(promises);
}
