const fetch = require('node-fetch')

module.exports = async req => {

  try {

    const url = req.params && req.params.url.replace(/https:/,'').replace(/\/\//,'') || req.replace(/https:/,'').replace(/\/\//,'')
  
    const response = await fetch(`https://${url}`, process.env.KEY_GITHUB &&
      {headers: new fetch.Headers({Authorization:`token ${process.env.KEY_GITHUB}`})})

    if (response.status >= 300) return new Error(`${response.status} ${url}`)
  
    const b64 = await response.json()
  
    const buff = await Buffer.from(b64.content, 'base64')

    const str = await buff.toString('utf8')

    if (url.match(/\.json$/i)) {
      return JSON.parse(str)
    }
  
    return str

  } catch(err) {
    console.error(err)
    return err
  }
}