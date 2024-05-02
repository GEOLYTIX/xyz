/**
### Keyvalue Dictionary Plugin
@module /plugins/keyvalue_dictionary
*/

/**
Replaces key-value pairs in the mapview locale object with dictionary entries.
@function keyvalue_dictionary
@param {Array} keyvalue_dictionary - An array of dictionary entries.
@param {Object} mapview - The mapview object.
@param {Object} mapview.locale - The locale object of the mapview.
@returns {void}
 */
export function keyvalue_dictionary(keyvalue_dictionary, mapview) {
  if (!mapp?.user?.language || !mapp.language) return;
  if (!mapview.locale) return;
  parseObject(mapview.locale, keyvalue_dictionary);
}

/**
Checks if an item is an array or an object and recursively applies the parsing logic.
@function isArrayObject
@param {*} item - The item to check.
@param {Array} dictionary - An array of dictionary entries.
@returns {boolean} - Returns true if the item is an array or an object, false otherwise.
 */
function isArrayObject(item, dictionary) {
  if (Array.isArray(item)) {
    item.forEach(val => isArrayObject(val, dictionary));
    return true;
  }
  if (item instanceof Object) {
    parseObject(item, dictionary);
    return true;
  }
}

/**
Parses an object and replaces its string values with dictionary entries.
@function parseObject
@param {Object} obj - The object to parse.
@param {Array} dictionary - An array of dictionary entries.
@returns {void}
*/
function parseObject(obj, dictionary) {
  for (const [key, value] of Object.entries(obj)) {
    if (isArrayObject(value, dictionary)) continue;
    if (typeof value === 'string') replaceKeyValue(obj, key, value, dictionary);
  }
}

/**
Replaces a key-value pair in an object with a dictionary entry.
@function replaceKeyValue
@param {Object} obj - The object containing the key-value pair.
@param {string} key - The key of the value to replace.
@param {string} value - The value to replace.
@param {Array} dictionary - An array of dictionary entries.
@returns {void}
 */
function replaceKeyValue(obj, key, value, dictionary) {
  // Find dictionary entry matching key and value.
  const entry = dictionary
    .filter(entry => entry.key === key)
    .find(entry => entry.value === value);
  if (!entry) return;
  // Replace object key value with entry language lookup or default.
  obj[key] = entry[mapp?.user?.language || mapp.language] || entry.default || value;
}