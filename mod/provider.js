const fetch = require('node-fetch')

const { join } = require('path')

module.exports = {

  github: async req => await github(req),

  here: async req => await here(req),

  mapbox: async req => await mapbox(req),

  opencage: async req => await opencage(req),

  google: async req => await google(req),

  cloudinary: async req => await cloudinary(req),

  http: async req => await http(req),

  file: async req => await file(req),

  cloudfront: async ref => await cloudfront(ref),
}


async function http(ref) {

  try {

    const response = await fetch(ref)

    if (response.status >= 300) return new Error(`${response.status} ${ref}`)

    if (ref.match(/\.json$/i)) {
      return await response.json()
    }

    return await response.text()

  } catch(err) {

    return err

  }
}

const { readFileSync } = require('fs')

const AWS = require("aws-sdk")

function readPem() {
  const pem = readFileSync(join(__dirname, `../${process.env.KEY_CLOUDFRONT}.pem`))
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

async function cloudfront(ref) {
  try {

    let url = ref.params && ref.params.url || ref

    url = url.replace(/\{(.*?)\}/g,
        matched => process.env[`SRC_${matched.replace(/\{|\}/g, '')}`] || matched)
  
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


function file(ref) {
  try {

    const file = readFileSync(join(__dirname, ref))

    if (ref.match(/\.json$/i)) {
      return JSON.parse(file, 'utf8')
    }

    return String(file)

  } catch (err) {
    console.error(err)
    return err
  }
}


async function github(req) {

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


const cloudinary_v2 = require('cloudinary').v2

async function cloudinary(req) {

  cloudinary_v2.config({
    api_key: process.env.CLOUDINARY.split(' ')[0],
    api_secret: process.env.CLOUDINARY.split(' ')[1],
    cloud_name: process.env.CLOUDINARY.split(' ')[2],
  })

  if (req.params.destroy) return await cloudinary_v2.uploader.destroy(`${process.env.CLOUDINARY.split(' ')[3]}/${req.params.public_id}`)

  const ressource = req.params.resource_type === 'raw' && req.body.toString() || `data:image/jpeg;base64,${req.body.toString('base64')}`

  return await cloudinary_v2.uploader.upload(ressource,
    {
      resource_type: req.params.resource_type,
      public_id: `${process.env.CLOUDINARY.split(' ')[3]}/${req.params.public_id}`, //${Date.now()}`,
      overwrite: true
    })
}


async function here(req) {

  const response = await fetch(`https://${getURL(req)}&${process.env.KEY_HERE}`)

  return await response.json()
}

async function mapbox(req) {

  const response = await fetch(`https://${getURL(req)}&${process.env.KEY_MAPBOX}`.replace(/\&provider=mapbox/,''))

  return await response.json()
}

async function opencage(req) {

  const response = await fetch(`https://${getURL(req)}&key=${process.env.KEY_OPENCAGE}`)

  return await response.json()
}

async function google(req) {

  const response = await fetch(`https://${getURL(req)}&${process.env.KEY_GOOGLE}`)

  return await response.json()
}

function getURL(req) {

  if (!req.params || !req.params.url) return req

  return req.params.url + Object.entries(req.params)
    .filter(entry => entry[0] !== 'provider')
    .filter(entry => entry[0] !== 'url')
    .filter(entry => entry[1] === 0 || !!entry[1])
    .filter(entry => entry[1].length > 0 || typeof entry[1] !== 'object')
    .map(entry => encodeURI(`${entry[0]}=${entry[1]}`))
    .join('&')
}