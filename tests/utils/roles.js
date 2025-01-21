/**
 * @function hasRoles

 * Recursively checks if an object contains any 'roles' properties
 * @param {*} obj - The object to check
 * @returns {boolean} - True if any 'roles' property is found, false otherwise
 */
export function hasRoles(obj) {
  // If not an object or null, return false
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  // If it's an array, check each element
  if (Array.isArray(obj)) {
    return obj.some((item) => hasRoles(item));
  }

  // Check if current object has 'roles' property
  if (Object.keys(obj).includes('roles')) {
    return true;
  }

  // Check all nested properties
  return Object.values(obj).some((value) => hasRoles(value));
}
