/**
@module /sign
*/

const cloudinary = require('./cloudinary');

module.exports = async (req, res) => {
  const signer = {
    cloudinary,
  };

  if (!Object.hasOwn(signer, req.params.provider)) {
    return res.send(`Failed to validate 'provider' param.`);
  }

  const response = await signer[req.params.provider](req);

  req.params.content_type &&
    res.setHeader('content-type', req.params.content_type);

  res.send(response);
};
