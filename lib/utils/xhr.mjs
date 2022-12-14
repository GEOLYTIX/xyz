const requestMap = new Map()

export default params => new Promise((resolve, reject) => {

  if (!params) return reject()

  params = typeof params === 'string' ? { url: params } : params

  // Check whether a request with the same params has already been resolved.
  if (params.cache && requestMap.has(params)) return resolve(requestMap.get(params))

  const xhr = new XMLHttpRequest()

  xhr.open(params.method || 'GET', params.url)

  const requestHeader = {
    'Content-Type': params.contentType || 'application/json'
  }

  Object.assign(requestHeader, params.requestHeader || {})

  Object.entries(requestHeader).forEach(entry=>xhr.setRequestHeader(...entry))

  xhr.responseType = params.responseType || 'json'

  xhr.onload = e => {

    if (e.target.status >= 300) {
      reject(new Error(e.target.status))
      return;
    }

    // Cache the response in the requestMap
    params.cache && requestMap.set(params, e.target.response)

    resolve(params.resolveTarget ? e.target : e.target.response)
    
  }

  // xhr.onerror = err => {
  //   console.error(err)
  //   reject(err);
  // };

  xhr.send(params.body)

})