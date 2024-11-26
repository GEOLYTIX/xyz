/**
### /utils/jsonParser

The jsonParser utility is used to parse a locale to be stored as a userLocale.

@module /utils/jsonParser
*/

export default jsonParser

/**
@function jsonParser

@description
The jsonParser returns an object which can be stored in an object store.

@param {Object} obj A decorated object.
@returns {Object} Returns a JSON object which can be stored in an object store.
*/
function jsonParser(obj) {

  if (typeof obj !== 'object') return;

  const jsonObject = {}

  propertyParser(jsonObject, obj)

  return jsonObject
}

const ignoreKeys = new Set(['__proto__', 'constructor', 'mapview'])

/**
@function propertyParser

@description
The propertyParser parses a source object and assigns properties which can be stored in an object store to the target object.

@param {Object} target
@param {Object} source
*/
function propertyParser(target, source) {

  if (!isObject(source)) return source;

  for (const key in source) {

    if (typeof source[key] === 'object') {

      // Openlayer objects will have an unique id.
      if (Object.hasOwn(source[key], 'ol_uid')){
        continue;
      }

      if (source[key].type === 'html'
        && Array.isArray(source[key].template)
        && Array.isArray(source[key].values)) {
        continue;
      }

    }

    // The ignoreKeys contain checks against prototype pollution.
    if (ignoreKeys.has(key)) continue;

    if (source[key] instanceof HTMLElement) {
      continue;
    }

    if (source[key] instanceof Function) {
      continue;
    }

    if (Array.isArray(source[key])) {

      // Ignore html template arrays.
      if (source[key][0] instanceof HTMLElement) continue;

      // Ignore callback arrays.
      if (source[key][0] instanceof Function) continue;

      target[key] = source[key].map(entry => isObject(entry)
        ? propertyParser({}, entry)
        : entry)
      continue;
    }

    if (isObject(source[key])) {

      // Target key must be an object.
      target[key] ??= {}

      // Call recursive merge for target key object.
      propertyParser(target[key], source[key]);

    } else {

      // source[key] could be null, true, false, or Array object
      target[key] = source[key]
    }
  }

  return target
}

/**
@function isObject
Checks whether the item argument is an object but not true, false, null, or an array.

@param {*} item
@returns {Boolean} True if the item is an object but not true, false, null, or an array.
*/
function isObject(item) {

  if (item === true) return false;

  if (item === false) return false;

  if (item === null) return false;

  if (Array.isArray(item)) return false;

  if (typeof item === 'object') return true;
}
