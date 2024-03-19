/**
## mapp.utils.paramString()
This module creates a parameter string for an XHR request.

@module /utils/paramString
*/

/**
Creates a parameter string for an XHR request based on the provided parameters object.

The function takes an object params as input and performs the following steps:
1. It returns an empty string if params is falsy.
2. It applies a series of filters to the entries of params:
    - It filters out entries where the value is not 0 or truthy.
    - It filters out entries where the value is an empty functional bracket string ('{}').
    - It filters out entries where the value is an object with zero length or an object with empty object values.
3. It maps the remaining entries to a string representation:
    - If the value is a non-array object, it stringifies the value and encodes it as a URI component.
    - Otherwise, it encodes the key-value pair as a URI string.
4. It joins the mapped entries with '&' to create the parameter string.
5. It returns the resulting parameter string.
@function paramString
@param {Object} params - The object containing the parameters.
@returns {string} The parameter string.
 */
// Create param string for XHR request.
export default params => {

  if (!params) return ''

  const paramsString = Object.entries(params)

    // Value should be 0 or truthy
    .filter(entry => entry[1] === 0 || !!entry[1])

    // Value must not be empty functional brackets.
    .filter(entry => entry[1] !== '{}')

    // Filter out zero length array and objects with empty object values.
    .filter(entry => typeof entry[1] !== 'object'
      || entry[1].length
      || Object.values(entry[1]).some(val => typeof val === 'object' && Object.keys(val).length))

    .map(entry => {

      // Stringify non array objects.
      if (typeof entry[1] === 'object' && !Array.isArray(entry[1])) {

        return `${entry[0]}=${encodeURIComponent(JSON.stringify(entry[1]))}`
      }

      return encodeURI(`${entry[0]}=${entry[1]}`)

    }).join('&')

  return paramsString
}