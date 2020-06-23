export default _xyz => {

  return {
    get: {
      layer: params => get('layer', params),
      locale: params => get('locale', params),
      locales: params => get('locales', params)
    },
    locale: {}
  }

  function get(key, params = {}) {

    return new Promise((resolve, reject) => {

      const xhr = new XMLHttpRequest()

      xhr.open('GET',
        `${_xyz.host}/api/workspace/get/${key}?`
        + _xyz.utils.paramString(params))

      xhr.responseType = 'json'

      xhr.onload = e => {

        if (e.target.status !== 200) return reject()

        resolve(e.target.response)
      }

      xhr.send()
    })
  }

}