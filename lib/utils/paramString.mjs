/**
## /utils/paramString
This module creates a parameter string for an XHR request.

@module /utils/paramString
*/

/**
@function paramString

@description
Creates a parameter string for an XHR request based on the provided parameters object.

The function takes a params object and returns a URL parameter string for for requests.

Following properties are filtered out:

- Value is falsy and not 0
- Value is '{}' string.
- Value is not typeof 'object', empty array, or object with some property value that is an object with keys.

The URL parameter value of objects which are not arrays will be stringified and URI component encoded.

Other property values will be URI encoded.

The URL parameter array is joined with an ampersand (&) to be returned as URL parameter string.

@param {Object} params The object containing the parameters.

@returns {string} The parameter string.
*/
export default paramString;

function paramString(params) {
  if (!params) return '';

  const paramsString = Object.entries(params)

    // Value should be 0 or truthy
    .filter((entry) => entry[1] === 0 || !!entry[1])

    // Value must not be empty functional brackets.
    .filter((entry) => entry[1] !== '{}')

    // Filter out zero length array and objects with empty object values.
    .filter(
      (entry) =>
        typeof entry[1] !== 'object' ||
        entry[1].length ||
        Object.values(entry[1]).some(
          (val) => typeof val === 'object' && Object.keys(val).length,
        ),
    )

    .map((entry) => {
      // Stringify non array objects.
      if (typeof entry[1] === 'object' && !Array.isArray(entry[1])) {
        return `${entry[0]}=${encodeURIComponent(JSON.stringify(entry[1]))}`;
      }

      return encodeURI(`${entry[0]}=${entry[1]}`);
    })
    .join('&');

  return paramsString;
}
