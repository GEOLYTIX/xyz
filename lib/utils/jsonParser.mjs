export default jsonParser

function jsonParser(obj) {

  if (typeof obj !== 'object') return;

  const jsonObject = {}

  propertyParser(jsonObject, obj)

  return jsonObject
}

function propertyParser(target, source) {

  if (!isObject(source)) return source;

  for (const key in source) {

    if (key === '__proto__' || key === 'constructor' || key === 'mapview') continue;

    if (source[key] instanceof HTMLElement) {
      target[key] = 'HTMLElement'
      continue;
    }

    if (source[key] instanceof Function) {
      //target[key] = true
      continue;
    }

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

function isObject(item) {

  if (item === true) return false;

  if (item === false) return false;

  if (item === null) return false;

  if (Array.isArray(item)) return false;

  if (typeof item === 'object') return true;
}
