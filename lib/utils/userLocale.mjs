export async function get(locale) {

  if (!locale.userLocale) return;

  locale.userLocale.stored = await mapp.utils.userIndexedDB.get('locales', locale.key)

  return locale.userLocale.stored
}

export async function save(mapview) {

  const locale = mapp.utils.jsonParser(mapview.locale)

  locale.layers = Object.values(mapview.layers).map(mapp.utils.jsonParser)

  await mapp.utils.userIndexedDB.put('locales', locale)
}

export async function remove() {

  await mapp.utils.userIndexedDB.deleteDB()
}
