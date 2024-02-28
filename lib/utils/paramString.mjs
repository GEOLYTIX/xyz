/**
## mapp.utils.paramString()

@module /utils/paramString
*/

// Create param string for XHR request.
export default params => Object.entries(params)

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