/**
## mapp.utils.merge()

@module /utils/merge
*/

export default function mergeDeep(target, ...sources) {

  // No sources to merge.
  if (!sources.length) {
    return target;
  }

  // Shift first source out of sources array.
  const source = sources.shift();

  // target & source are both objects.
  if (isObject(target) && isObject(source)) {

    const proto = Object.getPrototypeOf(target)

    // Iterate over object keys in source.
    for (const key in source) {

      // Key must not be in target object prototype.
      if (proto[key]) {
        console.warn(`Prototype polution detected for key: ${key}`)

      } else if (source[key] instanceof HTMLElement) {

        // HTMLElement objects must not be merged.
        console.warn(source[key])

      } else if (isObject(source[key])) {

        // Target key must be an object.
        target[key] ??= {}

        // Call recursive merge for target key object.
        mergeDeep(target[key], source[key]);

      } else {

        // source[key] is neither null nor object.
        target[key] = source[key]
      }
    }
  }

  return mergeDeep(target, ...sources);
}

function isObject(item) {

  if (item === true) return false;

  if (item === false) return false;

  if (item === null) return false;

  if (Array.isArray(item)) return false;

  if (typeof item === 'object') return true;
}