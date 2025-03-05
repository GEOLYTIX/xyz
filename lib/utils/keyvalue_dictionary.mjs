/**
### /utils/keyvalue_dictionary

The keyvalue_dictionary utility method will parse a JSON object for properties with key/value pairs matching entries a provided dictionary.

The property value will be replaced with a language lookup in the dictionary or the default value.

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
@module /utils/keyvalue_dictionary
*/

/**
@function keyvalue_dictionary

@description
Replaces key-value pairs in an object with dictionary entries.

@param {Object} obj The object to be mapped to keyvalue_dictionary.
*/
export function keyvalue_dictionary(obj) {
  if (!obj.keyvalue_dictionary) return;

  // Create a Map from dictionary object.
  const keyvalue_dictionaryMap = new Map();

  obj.keyvalue_dictionary.forEach((entry) => {
    const compositeKey = `${entry.key}:${entry.value}`;
    keyvalue_dictionaryMap.set(compositeKey, entry);
  });

  parseObject(obj, keyvalue_dictionaryMap);
}

/**
@function parseObject

@description
Parses an object and replaces its string values with dictionary entries.

@param {Object} obj The object to parse.
@param {Array} dictionary An array of dictionary entries.
*/
function parseObject(obj, dictionary) {
  for (const [key, value] of Object.entries(obj)) {
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
  const compositeKey = `${key}:${value}`;

  if (!dictionary.has(compositeKey)) return;

  const entry = dictionary.get(compositeKey);

  obj[key] =
    entry[mapp?.user?.language || mapp.language] || entry.default || value;
}
