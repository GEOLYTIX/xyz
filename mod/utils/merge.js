module.exports = function mergeDeep(target, ...sources) {

  // No sources to merge.
  if (!sources.length) {
    return target;
  }

  const source = sources.shift();

  if (isObject(target) && isObject(source)) {

    // Iterate over object keys in source.
    for (const key in source) {

      if (isObject(source[key])) {

        // Assign empty object on key.
        if (!target[key]) Object.assign(target, { [key]: {} });

        // Call recursive merge for target key object.
        mergeDeep(target[key], source[key]);

      } else if (Array.isArray(source[key])) {

        // Target is object, Source is array
        if (isObject(target[key])
        
        // Target and Source are equal arrays.
        || Array.isArray(target[key]) && source[key].every(item => target[key].includes(item))) {
          
          // Do not merge.
          target[key] = source[key]

        } else {

          // Merge arrays.
          target[key] = [...target[key]||[], ...source[key]]
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
  return (!Array.isArray(item) && item instanceof Object);
}