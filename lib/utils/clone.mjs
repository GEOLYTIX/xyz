export default function clone(target, map = new WeakMap()) {

  // Return the value if target is not an object or null
  if (target === null
    || typeof target !== 'object'
    || typeof target === 'function'
    || target instanceof HTMLElement) {
    return target
  }

  // Check whether target is an array.
  let cloneTarget = Array.isArray(target) ? [] : {};

  // Use WeakMap to prevent circular references.
  if (map.get(target)) {
    return map.get(target);
  }
  map.set(target, cloneTarget);

  for (const key in target) {
    cloneTarget[key] = clone(target[key], map);
  }

  return cloneTarget;
};