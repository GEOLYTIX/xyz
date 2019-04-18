const env = require('../env');

const checkLayer = require('./checkLayer');

module.exports = async workspace => {
  
  // Check whether workspace keys are valid or missing.
  await chkOptionals(workspace, env._defaults.workspace);
  
  // Check locales.
  await chkLocales(workspace.locales);

  // Set workspace to env.
  env.workspace = workspace;

  if (env.debug) checkLayer(workspace);
};

async function chkOptionals(chk, opt) {

  // Check defaults => workspace first.
  Object.keys(opt).forEach(key => {

    // Return if the object is optional.
    if (typeof opt[key] === 'object' && opt[key].optional) return;

    // Non optional keys will be written from the defaults to the workspace
    // if not already defined !(key in chk)
    if (!(key in chk) && opt[key] !== 'optional') {
      chk[key] = opt[key];
    }
  });
  
  // Check workspace => defaults second.
  Object.keys(chk).forEach(key => {
  
    // Optional may have been introduced as entries of default objects.
    if (chk[key] === 'optional') {
      return delete chk[key];
    }
  
    // Workspace key does not exist in defaults.
    if (!(key in opt)) {
  
      // Prefix key with double underscore and delete original.
      // Double underscore invalidates a key!
      chk['__' + key] = chk[key];
      delete chk[key];
    }
  });
}

async function chkLocales(locales) {   
  
  // Iterate through locales.
  for (const key of Object.keys(locales)) {
  
    // Set default locale.
    const
      locale = locales[key],
      _locale = env._defaults.locale;
  
    // Remove locale which is not an object.
    if (typeof locale !== 'object') {
      delete locales[key];
      continue;
    }
  
    // Check whether locale keys are valid or missing.
    await chkOptionals(locale, _locale);
  
    // Check bounds.
    await chkOptionals(locale.bounds, _locale.bounds);
  
    // Check gazetteer.
    if (locale.gazetteer) await chkOptionals(locale.gazetteer, _locale.gazetteer);
  
    // Check layers in locale.
    await chkLayers(locale.layers, key);
  
  }
}

async function chkLayers(layers, locale_key) {

  // Iterate through loayers.
  for (const key of Object.keys(layers)) {

    const layer = layers[key];

    // Invalidate layer if it is not an object or does not have a valid layer format.
    if (typeof layer !== 'object'
        || !layer.format
        || !env._defaults.layers[layer.format]) {
      layers['__' + key] = layer;
      return delete locale.layers[key];
    }

    // Assign layer default from layer and format defaults.
    const _layer = Object.assign({},
      env._defaults.layers.default,
      env._defaults.layers[layer.format]
    );

    // Set layer key and name.
    layer.key = key;
    layer.name = layer.name || key;
    layer.locale = locale_key;

    // Check whether layer keys are valid or missing.
    await chkOptionals(layer, _layer);

    // Check whether layer.style keys are valid or missing.
    if (layer.style) await chkOptionals(layer.style, _layer.style);

  }
}