/**
## /utils/merge

An XYZ utility module to merge complex objects [including function parameters] deeply.

The utility is required to compose nested workspace object properties [eg locales, layer] from templates.

@module /utils/merge
*/

/**
@function mergeDeep

@description
Method receives a target object and sources arguments spread into an array.

The target will be returned if the sources array argument has no length.

A source will be shited from the sources array argument and processed against the target object.

Each source object property will be iterated if both the target and source are object instances.

The method will iterate over itself until the object arguments are merged into the target.
*/
export default function mergeDeep(target, ...sources) {
  // No sources to merge.
  if (!sources.length) {
    return target;
  }

  // Shift first entry from sources array as source.
  const source = sources.shift();

  // Source and Target are both objects.
  if (isObject(target) && isObject(source)) {
    // Iterate over object keys in source.
    for (const key in source) {
      // Spread source array into target array.
      if (arrayMerge(source, target, key)) continue;

      // mergeDeep source object into target object.
      if (objectMerge(source, target, key)) continue;

      // Assign the source[key] property to target object.
      Object.assign(target, { [key]: source[key] });
    }
  }

  return mergeDeep(target, ...sources);
}

/**
@function arrayMerge

@description
Method checks whether the provided source and target objects have array properties with the same key.

The source array will be spread into the target array only if it contains items which are not included in the target array.
*/
function arrayMerge(source, target, key) {
  // Check whether source and target are both arrays.
  if (Array.isArray(source[key]) && Array.isArray(target[key])) {
    // Check whether the source and target arrays are equal.
    if (source[key].every((item) => target[key].includes(item))) {
      // Do not merge.
      target[key] = source[key];
    } else {
      // Merge unequal arrays.
      target[key] = [...(target[key] || []), ...source[key]];
    }

    return true;
  }
}

/**
@function objectMerge

@description
The method will create an empty object if the target object does not have a key property.

The mergeDeep method will be called recursive to merge the source key object into the target key object property.
*/
function objectMerge(source, target, key) {
  if (isObject(source[key])) {
    // Assign empty object on key.
    if (!target[key]) Object.assign(target, { [key]: {} });

    // Call recursive merge for target key object.
    Object.hasOwn(target, key) && mergeDeep(target[key], source[key]);

    return true;
  }
}

/**
@function isObject

@description
Method checks whether the item param is an Object but not an Array.
*/
function isObject(item) {
  return !Array.isArray(item) && item instanceof Object;
}
