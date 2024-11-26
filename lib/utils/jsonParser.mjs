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

    // The ignoreKeys contain checks against prototype pollution.
    if (ignoreKeys.has(key)) continue;

    if (excludeProperty(source[key])) continue;

    if (Array.isArray(source[key])) {
 
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
@function excludeProperty
@description
The excludeProperty method returns true if a property should be exluded from the target in the propertyParser iteration.

@param {*} value
@returns {Boolean} True if the property should be excluded in regards to the property value.
*/
function excludeProperty(value) {

  if (typeof value === 'object') {

    // Openlayer objects will have an unique id.
    if (Object.hasOwn(value, 'ol_uid')){
      return true;
    }

    if (value.type === 'html'
      && Array.isArray(value.template)
      && Array.isArray(value.values)) {
      
      return true;
    }
  }

  if (value instanceof HTMLElement) {
    return true;
  }

  if (value instanceof Function) {
    return true;
  }

  if (Array.isArray(value)) {

    // Ignore html template arrays.
    if (value[0] instanceof HTMLElement) return true;

    // Ignore callback arrays.
    if (value[0] instanceof Function) return true;
  }
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
