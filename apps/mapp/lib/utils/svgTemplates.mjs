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
export async function svgTemplates(templates) {
  if (!templates || !Object.keys(templates).length) return;

  mapp.utils.svgSymbols.templates ??= {};

  // Iterate through svg_templates entries.
  const promises = Object.keys(templates)

    // The template key is not yet loaded into the templates
    .filter((key) => !Object.hasOwn(mapp.utils.svgSymbols.templates, key))
    .map((key) =>
      // Fetch entry value.
      fetchSvgTemplate(templates[key]).then((svgString) => {
        // Only assign valid svg document strings.
        if (!svgString) return;

        // Assign svgString as entry key to templates object.
        mapp.utils.svgSymbols.templates[key] = svgString;
      }),
    );

  await Promise.all(promises);
}

/**
@function fetchSvgTemplate
@async

@description
Fetches the src and returns the response text if the response is ok and the text can be parsed as an svg document. Failed fetch requests, error responses, and non svg documents [eg. an html 404 page] will be logged as warning and return undefined.

@param {string} src The svg template src.

@returns {Promise<string|undefined>}
*/
async function fetchSvgTemplate(src) {
  try {
    const response = await fetch(src);

    if (!response.ok) {
      console.warn(`SVG template fetch failed [${response.status}]: ${src}`);
      return;
    }

    const svgString = await response.text();

    const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml');

    // A parser error or a non svg root element is not a valid svg document.
    if (
      doc.querySelector('parsererror') ||
      doc.documentElement.localName !== 'svg'
    ) {
      console.warn(`SVG template is not a valid svg document: ${src}`);
      return;
    }

    return svgString;
  } catch (err) {
    console.warn(`SVG template fetch failed: ${src}`, err);
  }
}
