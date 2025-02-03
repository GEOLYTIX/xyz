/**
@module /utils/merge
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
      if (isObject(source[key])) {
        // Assign empty object on key.
        if (!target[key]) Object.assign(target, { [key]: {} });

        // Call recursive merge for target key object.
        Object.hasOwn(target, key) && mergeDeep(target[key], source[key]);

        // Target and Source are both arrays.
      } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
        // Target and Source arrays are equal.
        if (source[key].every((item) => target[key].includes(item))) {
          // Do not merge.
          target[key] = source[key];
        } else {
          // Merge unequal arrays.
          target[key] = [...(target[key] || []), ...source[key]];
        }
      } else {
        // Assign key if not an object itself.
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

function isObject(item) {
  return !Array.isArray(item) && item instanceof Object;
}
