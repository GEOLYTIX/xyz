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

        if (Array.isArray(target[key]) && source[key].every(item => target[key].includes(item))) {
          
          // Do not merge equal arrays
          target[key] = source[key]
          
        } else {

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
  return (item && typeof item === 'object' && !Array.isArray(item));
}