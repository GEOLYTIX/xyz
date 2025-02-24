/**
### /plugins/keyvalue_dictionary

A keyvalue_dictionary can be configured in the locale. The keyvalue_dictionary plugin method will parse the mapview.locale for properties with key/value pairs matching entries in the dictionary. The property value will be replaced with a language lookup in the dictionary or the default value.

```js
"keyvalue_dictionary": [
  {
    "key": "name",
    "value": "OSM",
    "default": "OpenStreetMap",
    "uk": "Sława OpenStreetMap 🇺🇦"
  }
]
```
@module /plugins/keyvalue_dictionary
*/

/**
@function keyvalue_dictionary

@description
Replaces key-value pairs in the mapview locale object with dictionary entries.

@param {Array} keyvalue_dictionary An array of dictionary entries.
@param {mapview} mapview The mapview object.
@property {Object} mapview.locale The locale object of the mapview.
*/
export function keyvalue_dictionary(keyvalue_dictionary, mapview) {
  if (!mapview?.locale) return;

  const dictionary = new WeakMap();

  keyvalue_dictionary.forEach((entry) => {
    dictionary.set([entry.key, entry.value], entry);
  });

  parseObject(mapview.locale, dictionary);
}

/**
@function parseObject

@description
Parses an object and replaces its string values with dictionary entries.

@param {Object} obj The object to parse.
@param {Array} dictionary An array of dictionary entries.
*/
export function parseObject(obj, dictionary) {
  for (const [key, value] of Object.entries(obj)) {
    // Prevents crash where the mapview with the locale itself maybe nested in a locale plugin object.
    if (key === 'mapview') continue;

    if (isArrayObject(value, dictionary)) continue;
    if (typeof value === 'string') replaceKeyValue(obj, key, value, dictionary);
  }
}

/**
@function isArrayObject

@description
Checks if an item is an array or an object and recursively applies the parsing logic.

@param {*} item The item to check.
@param {Array} dictionary An array of dictionary entries.
@returns {boolean} Returns true if the item is an array or an object, false otherwise.
 */
function isArrayObject(item, dictionary) {
  if (Array.isArray(item)) {
    item.forEach((val) => isArrayObject(val, dictionary));
    return true;
  }
  if (item instanceof Object) {
    parseObject(item, dictionary);
    return true;
  }
}

/**
@function replaceKeyValue

@description
Replaces a key-value pair in an object with a dictionary entry.

@param {Object} obj The object containing the key-value pair.
@param {string} key The key of the value to replace.
@param {string} value The value to replace.
@param {Array} dictionary An array of dictionary entries.
*/
function replaceKeyValue(obj, key, value, dictionary) {
  // TODO an array literal will not match a keyvalue dictionary array since the object symbols are never the same
  console.log([key, value]);

  if (!dictionary.has([key, value])) return;

  const entry = dictionary.get([key, value]);

  // Replace object key value with entry language lookup or default.
  obj[key] =
    entry[mapp?.user?.language || mapp.language] || entry.default || value;
}
