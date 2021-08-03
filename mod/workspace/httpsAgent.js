const https = require('https')

const httpsAgent = new https.Agent({
	keepAlive: true,
  maxSockets: parseInt(process.env.CUSTOM_AGENT) || 1
})

const fetch = require('node-fetch')

module.exports = async ref => {
  try {

    const response = await fetch(ref, {
      agent: process.env.CUSTOM_AGENT && httpsAgent
    })

    if (response.status >= 300) return new Error(`${response.status} ${ref}`)

    if (ref.match(/\.json$/i)) {
      return await response.json()
    }

    return await response.text()

  } catch(err) {
    console.error(err)
    return err
  }
}