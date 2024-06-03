/**
## merge.mjs

Imported by _utils.mjs to assign the exported default method mergeDeep as mapp.utils.merge().

@module /utils/merge
*/

/**
### mapp.utils.merge()

The mergeDeep utility method will set the source object's own enumerable string-keyed property values on a target object.

mergeDeep will call itself recursively allowing to merge nested objects.

An empty target object can be provided to effectively clone a source object.

Instances of HTMLElement objects will be ignored by the merge method.

Arrays will not be merged. The source array will overwrite a target array.

@function mergeDeep
@param {*} target 
@param  {...any} sources 
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

      // HTMLElement objects must not be merged.
      } else if (source[key] instanceof HTMLElement) {
        console.warn(source[key])

      // source[key] is object with potential nesting.
      } else if (isObject(source[key])) {

        // Target key must be an object.
        target[key] ??= {}

        // Call recursive merge for target key object.
        mergeDeep(target[key], source[key]);

      // source[key] could be null, true, false, or Array object
      } else {

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