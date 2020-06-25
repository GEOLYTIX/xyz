const auth = require('../mod/user/auth')

const _provider = require('../mod/provider')

module.exports = async (req, res) => {

  req.params = Object.assign(req.params || {}, req.query || {})

  await auth(req, res)

  if (res.finished) return

  const provider = _provider[req.params.provider]

  if (!provider) {
    return res.send(`Failed to evaluate 'provider' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/provider/">Provider API</a>`)
  }

  req.body = req.body && await bodyData(req) || null

  const content = await provider(req)

  req.params.content_type && res.setHeader('content-type', req.params.content_type)

  res.send(content)
}

function bodyData(req) {

  return new Promise((resolve, reject) => {

    const chunks = []

    req.on('data', chunk => chunks.push(chunk))

    req.on('end', () => resolve(Buffer.concat(chunks)))

  });
}