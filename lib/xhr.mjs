const requestMap = new Map()

export default _xyz => params => new Promise((resolve, reject) => {

  if (!params) return reject()

  params = typeof params === 'string' ? { url: params } : params

  if (!params.no_cache && requestMap.has(params)) return resolve(requestMap.get(params))

  const xhr = new XMLHttpRequest()

  xhr.open(params.method || 'GET', params.url)

  xhr.setRequestHeader('Content-Type', params.content_type || 'application/json')

  xhr.responseType = params.responseType || 'json'

  xhr.onload = e => {

    if (e.target.status >= 300) return reject({ err: e.target.status })

    requestMap.set(params, e.target.response)

    resolve(e.target.response)

  }

  xhr.send(params.body)

})