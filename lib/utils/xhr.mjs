/**
## mapp.utils.xhr()

@module /utils/xhr
*/

const requestMap = new Map()

export default params => new Promise(resolve => {

  // Return if params are falsy.
  if (!params) {
    console.error(`xhr params are falsy.`)
    return;
  }

  // Set params as object with url from string.
  params = typeof params === 'string' ? { url: params } : params

  // A request url must be provided.
  if (!params.url) {
    console.error(`no xhr request url has been provided.`)
    return;
  };

  // Check whether a request with the same params has already been resolved.
  if (params.cache && requestMap.has(params)) return resolve(requestMap.get(params))

  // Assign 'GET' as default method.
  params.method ??= 'GET'

  const xhr = new XMLHttpRequest()

  xhr.open(params.method, params.url)

  // Use requestHeader: null to prevent assignment of requestHeader.
  if (params.requestHeader !== null) {

    // Butter (spread) over requestHeader.
    const requestHeader = {
      'Content-Type': 'application/json',
      ...params.requestHeader
    }

    Object.entries(requestHeader).forEach(entry => xhr.setRequestHeader(...entry))
  }

  xhr.responseType = params.responseType || 'json'

  xhr.onload = e => {

    if (e.target.status >= 400) {
      resolve(new Error(e.target.status))
      return;
    }

    // Cache the response in the requestMap
    params.cache && requestMap.set(params, e.target.response)

    resolve(params.resolveTarget ? e.target : e.target.response)
  }

  xhr.send(params.body)
})