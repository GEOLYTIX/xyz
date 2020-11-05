// Create param string for XHR request.
export default params => Object.entries(params)
  .filter(entry => entry[1] === 0 || !!entry[1])
  .filter(entry => entry[1] !== '{}')

  // Filter out zero length array and objects with empty object values.
  .filter(entry => typeof entry[1] !== 'object'
    || entry[1].length
    || Object.values(entry[1]).some(val => typeof val === 'object' && Object.keys(val).length))

  .map(entry => {

    // Stringify non array objects.
    if (typeof entry[1] === 'object' && !entry[1].length) {

      entry[1] = JSON.stringify(entry[1])

    }

    return encodeURI(`${entry[0]}=${entry[1]}`)

  }).join('&')