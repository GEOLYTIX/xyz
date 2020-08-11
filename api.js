const getWorkspace = require('./mod/workspace/getWorkspace')

const mod = {
  layer: require('./mod/layer/_layer'),
  location: require('./mod/location/_location'),
  workspace: require('./mod/workspace/_workspace'),
  user: require('./mod/user/_user'),
  view: require('./mod/view'),
  query: require('./mod/query'),
  gazetteer: require('./mod/gazetteer'),
  provider: provider,
  proxy: proxy,
}

module.exports = async (req, res) => {

  req.params = Object.assign(req.params || {}, req.query || {})

  const workspace = await getWorkspace()

  if (workspace instanceof Error) return res.status(500).send(workspace.message)

  req.params.workspace = workspace

  const term = req.url.match(/(?<=\/api\/)(.*?)[\/\?]/)

  if (term && term[1] && mod[term[1]]) return mod[term[1]](req, res)

  mod.view(req, res)

}

const https = require('https')

function proxy(req, res) {

  const url = `${req.query.host || ''}${req.query.uri}&${process.env[`KEY_${req.query.provider.toUpperCase()}`]}`

  const proxy = https.request(url, _res => {
    res.writeHead(_res.statusCode, _res.headers)
    _res.pipe(res, {
      end: true
    })
  })

  req.pipe(proxy, {
    end: true
  })
  
}

const _provider = require('./mod/provider')

async function provider(req, res) {

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

    req.on('error', error => reject(error))

  })
}