/**
## /utils/merge

Export the default mergeDeep method to mapp.utils{}.

@module /utils/merge
*/

/**
@function mergeDeep

@description
The mergeDeep utility method will set the source object's own enumerable string-keyed property values on a target object.

mergeDeep will call itself recursively allowing to merge nested objects.

An empty target object can be provided to effectively clone a source object.

Instances of HTMLElement objects will be ignored by the merge method.

Arrays will not be merged. The source array will overwrite a target array.

@param {Object} target 
@param  {Spread} sources The sources param is spread into an array.
*/
export default function mergeDeep(target, ...sources) {
  // No sources to merge.
  if (!sources.length) {
    return target;
  }

  // Shift first source out of sources array.
  const source = sources.shift();

  // target & source are both objects.
  if (!isObject(target) || !isObject(source)) {
    return mergeDeep(target, ...sources);
  }

  // Iterate over object keys in source.
  for (const key in source) {
    if (Object.getPrototypeOf(source) !== Object.getPrototypeOf({})) continue;

    if (key === '__proto__' || key === 'constructor') continue;

    if (source[key] instanceof HTMLElement) {
      console.warn(source[key]);

      // source[key] is object with potential nesting.
    } else if (isObject(source[key])) {
      // Target key must be an object.
      target[key] ??= {};

      // Call recursive merge for target key object.
      mergeDeep(target[key], source[key]);
    } else {
      // source[key] could be null, true, false, or Array object
      target[key] = source[key];
    }
  }

  return mergeDeep(target, ...sources);
}

/**
@function isObject

@description
The method checks whether item param is an object, excluding true, false, null, Array objects.

@param {Any} item 

@return {Boolean} Return boolean whether item param is an object.
*/
function isObject(item) {
  if (item === true) return false;

  if (item === false) return false;

  if (item === null) return false;

  if (Array.isArray(item)) return false;

  if (typeof item === 'object') return true;
}
