const https = require('https')

const httpsAgent = new https.Agent({
	keepAlive: true,
  maxSockets: parseInt(process.env.CUSTOM_AGENT) || 1
})

const { readFileSync } = require('fs')

const { join } = require('path')

const { getSignedUrl } = require('@aws-sdk/cloudfront-signer');

module.exports = async ref => {

  try {

    const url = (ref.params?.url || ref).replace(/\{(.*?)\}/g,
      matched => process.env[`SRC_${matched.replace(/\{|\}/g, '')}`] || matched)

    const date = new Date(Date.now())
    date.setDate(date.getDate() + 1);

    const signedURL = getSignedUrl({
      url: `https://${url}`,
      keyPairId: process.env.KEY_CLOUDFRONT,
      dateLessThan: date.toDateString(),
      privateKey: String(readFileSync(join(__dirname, `../../${process.env.KEY_CLOUDFRONT}.pem`)))
    });

    const response = await fetch(signedURL, {
      agent: process.env.CUSTOM_AGENT && httpsAgent
    })

    if (ref.params?.signedURL) {

      return signedURL;
    }
  
    if (response.status >= 300) return new Error(`${response.status} ${ref}`)

    if (url.match(/\.json$/i)) return await response.json()

    return await response.text()

  } catch(err) {
    console.error(err)
    return err
  }

}