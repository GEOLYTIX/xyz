// Create param string for XHR request.
export default params => Object.entries(params)
  .filter(entry => entry[1] === 0 || !!entry[1])
  .filter(entry => entry[1] !== '{}')
  .filter(entry => entry[1].length > 0 || typeof entry[1] !== 'object')
  .map(entry => encodeURI(`${entry[0]}=${entry[1]}`))
  .join('&');