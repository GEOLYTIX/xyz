const env = require('../env');

module.exports = async workspace => {
  
  workspace = Object.assign({}, env._defaults.workspace, workspace);
  
  await processLocales(workspace.locales);

  return workspace;
};

async function processLocales(locales) {   
  
  for (const key of Object.keys(locales)) {

    locales[key].key = key;
   
    // Remove locale which is not an object.
    if (typeof locales[key] !== 'object') {
      delete locales[key];
      continue;
    }

    locales[key] = Object.assign({}, env._defaults.locale, locales[key]);

    locales[key].bounds = Object.assign({}, env._defaults.locale.bounds, locales[key].bounds);
    
    await processLayers(locales[key]);
  }
}

async function processLayers(locale) {

  for (const key of Object.keys(locale.layers)) {

    const format = locale.layers[key].format;

    // Check layer format.
    if (typeof locale.layers[key] !== 'object'
        || !format
        || !env._defaults.layers[format]) {

      delete locale.layers[key];
      continue;
    }

    locale.layers[key] = Object.assign({}, env._defaults.layers[format], locale.layers[key]);

    locale.layers[key].key = key;
    locale.layers[key].name = locale.layers[key].name || key;
    locale.layers[key].locale = locale.key;

    // Check whether layer.style keys are valid or missing.
    if (locale.layers[key].style) locale.layers[key].style = Object.assign({}, env._defaults.layers[format].style, locale.layers[key].style);

  }
}