export default jsonParser

function jsonParser(obj) {

  if (typeof obj !== 'object') return;

  const jsonObject = {}

  propertyParser(jsonObject, obj)

  return jsonObject
}

const ignoreKeys = new Set(['__proto__', 'constructor', 'mapview'])

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

function isObject(item) {

  if (item === true) return false;

  if (item === false) return false;

  if (item === null) return false;

  if (Array.isArray(item)) return false;

  if (typeof item === 'object') return true;
}
