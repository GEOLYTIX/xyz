const fetch = require('node-fetch')

const { readFileSync } = require('fs')

const { join } = require('path')

const AWS = require("aws-sdk")

function readPem() {
  const pem = readFileSync(join(__dirname, `../../${process.env.KEY_CLOUDFRONT}.pem`))
  return String(pem)
}

const awsSigner = process.env.KEY_CLOUDFRONT && new AWS.CloudFront.Signer(
  process.env.KEY_CLOUDFRONT,
  readPem()
)

function generateSignedDownloadUrl(ref) {
  return new Promise(function(resolve) {
    const url = awsSigner.getSignedUrl({
      url: `https://${ref}`,
      expires: Date.now() + 60 * 60 * 1000 // 1 hour
    })
    resolve(url)
  })
}

module.exports = async ref => {

  try {

    const url = ref.params && ref.params.url || ref
  
    const signedUrl = await generateSignedDownloadUrl(url)
  
    const response = await fetch(signedUrl)
  
    if (response.status >= 300) return new Error(`${response.status} ${ref}`)

    if (url.match(/\.json$/i)) return await response.json()

    return await response.text()

  } catch(err) {
    console.error(err)
    return err
  }

}