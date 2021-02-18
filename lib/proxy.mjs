export default _xyz => url => new Promise((resolve, reject) => {

  const xhr = new XMLHttpRequest();

  xhr.open('GET', `${_xyz.host}/api/proxy?url=${encodeURIComponent(url)}`)

  xhr.setRequestHeader('Content-Type', 'application/json')

  xhr.responseType = 'json'

  xhr.onload = e => {

    if (e.target.status >= 300) return reject({ err: e.target.status })

    resolve(e.target.response)

  }

  xhr.send()

})