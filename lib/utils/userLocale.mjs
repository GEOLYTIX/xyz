/**
### /utils/userLocale

The userLocale utility module exports methods to get, save/overwrite, or delete a userLocale object in a userIndexedDB.

These methods are to be extended for different stores once they become available.

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
@returns {Object} Returns a locale object stored as a userLocale.
*/
export async function get(locale) {

  if (!locale.userLocale) return;

  locale.userLocale.stored = await mapp.utils.userIndexedDB.get({
    user: mapp.user.email || 'anonymous',
    db: locale.title,
    store: 'locales',
    key: locale.key
  })

  console.log(locale.userLocale.stored)

  return locale.userLocale.stored
}

/**
@function save

@description
The save method parses the mapview.locale to be stored in a userIndexedDB.

@param {Object} mapview 
@property {Object} mapview.locale The locale which should be stored as a userLocale object.
*/
export async function save(mapview) {

  const locale = mapp.utils.jsonParser(mapview.locale)

  locale.layers = Object.values(mapview.layers).map(mapp.utils.jsonParser)

  await mapp.utils.userIndexedDB.put({
    user: mapp.user.email || 'anonymous',
    db: locale.title,
    store: 'locales',
    obj: locale
  })

  console.log('userLocale saved')
}

/**
@function remove

@description
The remove method deletes a userIndexedDB.

@param {Object} locale 
@property {string} locale.title
*/
export async function remove(locale) {

  await mapp.utils.userIndexedDB.deleteDB({
    user: mapp.user.email || 'anonymous',
    db: locale.title
  })

  console.log('userLocale removed')
}
