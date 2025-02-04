/**
### /utils/userLocale

The userLocale utility module exports methods to get, put (create or overwrite), or delete a userLocale object in a userIndexedDB.

At current the module requires the userIndexedDB utility module to store the userLocale in an indexedDB.

Locales can be stored in the locales store.

The locales store is part of an [indexed] DB identified by the user and the workspace.

A workspace is unique to an XYZ instance.

A decorated locale object must be parsed with the jsonParser utility method in order to be stored as a JSON object in a store.

@requires /utils/jsonParser
@requires /utils/userIndexedDB

@module /utils/userLocale
*/

/**
@function get

@description
The get method requests a locale stored in a userIndexedDB.

@param {Object} locale 
@property {Object} locale.userLocale The userLocale config.
@property {Object} locale.workspace Identifies the XYZ instance.
@property {Object} locale.name The custom name under which a locale is stored.
@returns {Object} Returns a locale object stored as a userLocale.
*/
export async function get(locale) {
  if (!locale.userLocale) return;

  const storedLocale = await mapp.utils.userIndexedDB.get({
    user: mapp.user.email || 'anonymous',
    workspace: locale.workspace,
    store: 'locales',
    name: locale.name,
  });

  return storedLocale;
}

/**
@function put

@description
The put method parses the mapview.locale first and stores the parsed JSON object in the locales database store identified by the locale.workspace.

@param {Object} mapview 
@property {Object} mapview.locale The locale which should be stored as a userLocale object.
@param {string} workspace The workspace identifier.
@property {Object} locale.name The custom name under which a locale is stored.
*/
export async function put(mapview) {
  const locale = mapp.utils.jsonParser(mapview.locale);

  locale.layers = Object.values(mapview.layers).map(mapp.utils.jsonParser);

  const response = await mapp.utils.userIndexedDB.put({
    user: mapp.user.email || 'anonymous',
    workspace: locale.workspace,
    store: 'locales',
    obj: locale,
    name: locale.name,
  });

  return response;
}

/**
@function list

@description
Requests an array of locales [key, name] from the 'locales' database store.

@param {string} workspace The workspace identifier.
*/
export async function list(workspace) {
  const locales = await mapp.utils.userIndexedDB.list({
    user: mapp.user.email || 'anonymous',
    workspace: workspace,
    store: 'locales',
  });

  return locales;
}

/**
@function remove

@description
The method removes a locale from the database 'locales' store.

@param {Object} locale 
@property {Object} locale.workspace The workspace identifier.
@property {Object} locale.name The custom name under which a locale is stored.
*/
export async function remove(locale) {
  const response = await mapp.utils.userIndexedDB.remove({
    user: mapp.user.email || 'anonymous',
    workspace: locale.workspace,
    store: 'locales',
    name: locale.name,
  });

  return response;
}
