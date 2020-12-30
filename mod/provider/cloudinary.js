const cloudinary_v2 = require('cloudinary').v2

module.exports = async req => {

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