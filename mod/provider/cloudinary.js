const cloudinary_v2 = require('cloudinary').v2

module.exports = async req => {

  req.body = req.body && await bodyData(req) || null

  req.params.folder = req.params.folder || process.env.CLOUDINARY.split(' ')[3]

  if (!process.env.CLOUDINARY_URL) {

    cloudinary_v2.config({
      api_key: process.env.CLOUDINARY.split(' ')[0],
      api_secret: process.env.CLOUDINARY.split(' ')[1],
      cloud_name: process.env.CLOUDINARY.split(' ')[2],
    })

  }

  if (req.params.destroy) return await cloudinary_v2.uploader.destroy(`${req.params.folder}/${req.params.public_id}`)

  const ressource = req.params.resource_type === 'raw' && req.body.toString() || `data:image/jpeg;base64,${req.body.toString('base64')}`

  return await cloudinary_v2.uploader.upload(ressource,
    {
      resource_type: req.params.resource_type,
      public_id: `${req.params.folder}/${req.params.public_id}`, //${Date.now()}`,
      overwrite: true
    })

}

function bodyData(req) {

  return new Promise((resolve, reject) => {

    const chunks = []

    req.on('data', chunk => chunks.push(chunk))

    req.on('end', () => resolve(Buffer.concat(chunks)))

    req.on('error', error => reject(error))

  })
}