const fetch = require('node-fetch')

const { readFileSync } = require('fs')

const { join } = require('path')

const _cloudinary = require('cloudinary').v2

module.exports = {

  github: async req => await github(req),

  here: async req => await here(req),

  mapbox: async req => await mapbox(req),

  opencage: async req => await opencage(req),

  google: async req => await google(req),

  cloudinary: async req => await cloudinary(req),

  http: async req => await http(req),

  file: async req => await file(req),
}

async function http(req) {

  try {

    const response = await fetch(req)

    if (response.status >= 300) return new Error(`${response.status} ${req}`)

    return await response.text()

  } catch(err) {

    return err

  }
}

function file(ref) {
  try {
    return readFileSync(join(__dirname, ref))
  } catch (err) {
    console.error(err)
    return err
  }
}

async function github(req) {

  try {

    const url = req.params && req.params.url.replace(/https:/,'').replace(/\/\//,'') || req.replace(/https:/,'').replace(/\/\//,'')

    // console.log(`https://${url}`);
  
    const response = await fetch(`https://${url}`, process.env.KEY_GITHUB &&
      {headers: new fetch.Headers({Authorization:`token ${process.env.KEY_GITHUB}`})})

    if (response.status >= 300) return new Error(`${response.status} ${url}`)
  
    const b64 = await response.json()
  
    const buff = await Buffer.from(b64.content, 'base64')
  
    return await buff.toString('utf8')

  } catch(err) {

    return err

  }
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

async function cloudinary(req) {

  _cloudinary.config({
    api_key: process.env.CLOUDINARY.split(' ')[0],
    api_secret: process.env.CLOUDINARY.split(' ')[1],
    cloud_name: process.env.CLOUDINARY.split(' ')[2],
  })

  if (req.params.destroy) return await _cloudinary.uploader.destroy(`${process.env.CLOUDINARY.split(' ')[3]}/${req.params.public_id}`)

  const ressource = req.params.resource_type === 'raw' && req.body.toString() || `data:image/jpeg;base64,${req.body.toString('base64')}`

  return await _cloudinary.uploader.upload(ressource,
    {
      resource_type: req.params.resource_type,
      public_id: `${process.env.CLOUDINARY.split(' ')[3]}/${Date.now()}`,
      overwrite: true,
    })
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