export function keyvalue_dictionary(keyvalue_dictionary, mapview) {

  if (!mapp.user.language) return;

  if (!mapview.locale) return;

  parseObject(mapview.locale, keyvalue_dictionary)
}

function isArrayObject(item, dictionary) {

  if (Array.isArray(item)) {
    item.forEach(val => isArrayObject(val, dictionary))
    return true
  }

  if (item instanceof Object) {
    parseObject(item, dictionary)
    return true
  }
}

function parseObject(obj, dictionary) {

  for (const [key, value] of Object.entries(obj)) {

    if (isArrayObject(value, dictionary)) continue;

    if (typeof value === 'string') replaceKeyValue(obj, key, value, dictionary);
  }
}

function replaceKeyValue(obj, key, value, dictionary) {

  // Find dictionary entry matching key and value.
  const entry = dictionary
    .filter(entry => entry.key === key)
    .find(entry => entry.value === value)

  if (!entry) return;

  // Replace object key value with entry language lookup or default.
  obj[key] = entry[mapp.user.language] || entry.default || value
}