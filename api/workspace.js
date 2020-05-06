const auth = require('../mod/auth/handler')

const _method = {
  cache: {
    handler: cache,
    access: 'admin_workspace'
  },
  set: {
    handler: set,
    access: 'admin_workspace'
  },
  get: {
    handler: get
  }
}

const getWorkspace = require('../mod/workspace/getWorkspace')

const { Pool } = require('pg')

const fetch = require('node-fetch')

let host

module.exports = async (req, res) => {

  req.params = Object.assign(req.params || {}, req.query || {})

  const method = _method[req.params && req.params.method]

  if (!method) return res.send('Help text.')

  await auth(req, res, method.access)

  if (res.finished) return

  host = `${req.headers.host.includes('localhost') && 'http' || 'https'}://${req.headers.host}${process.env.DIR || ''}`

  method.handler(req, res)
}

async function cache(req, res) {

  const workspace = await getWorkspace(true)

  if (workspace instanceof Error) return res.status(500).send(`<span style="color: red;">${workspace.message}</span>`)

  Promise.all([
    fetch(`${host}/view?clear_cache=true&token=${req.params.token.signed}`),
    fetch(`${host}/api/query?clear_cache=true&token=${req.params.token.signed}`),
    fetch(`${host}/api/gazetteer?clear_cache=true&token=${req.params.token.signed}`),
    fetch(`${host}/api/layer?clear_cache=true&token=${req.params.token.signed}`),
    fetch(`${host}/api/location?clear_cache=true&token=${req.params.token.signed}`),
  ]).then(arr => {
    if (arr.some(response => !response.ok)) return res.status(500).send('Failed to cache workspace.')

    const errormessages = Object.values(workspace.templates)
      .filter(template => template.err)
      .map(template => `<span style="color: red;">${template.err}</span>`)

    res.send(`Workspace cached.<br><br>${errormessages.join('<br>')}`)
  })
}

async function get(req, res) {

  const workspace = await getWorkspace()

  if (workspace instanceof Error) return res.status(500).send(workspace.message)

  //if (req.params.key === 'layer' && req.params.layer) return res.send(layers[req.params.layer])

  //if (req.params.key === 'layers') return res.send(Object.keys(layers))

  if (req.params.key === 'template') {

    if (!req.params.template) return res.send('Template not defined.')

    const template = workspace.templates[req.params.template];
    
    if (!template) return res.status(400).send('Template not found.')

    res.setHeader('content-type', 'text/plain')

    return res.send(template.err && template.err.message || template.template || template.render.toString())
  }

  if (req.params.key === 'templates') {
    const templates = Object.entries(workspace.templates).map(
      template => `<a ${template[1].err && 'style="color: red;"' ||''} href="${host}/api/workspace/get/template?template=${template[0]}">${template[0]}</a>`
    )

    return res.send(templates.join('<br>'))
  }

  if (req.params.key === 'locale') {

    if (!req.params.locale) return res.send('Locale not defined.')

    const locale = workspace.locales[req.params.locale];

    if (!locale) return res.status(400).send('Locale not found.')

    return res.send(locale)

    if (req.params.token && req.params.token.roles) {

      let _locale = JSON.parse(JSON.stringify(locale))

      (function objectEval(o, parent, key) {

        // check whether the object has an access key matching the current level.
        if (Object.entries(o).some(
          e => e[0] === 'roles' && !Object.keys(e[1]).some(
            role => req.params.token && req.params.token.roles && req.params.token.roles.includes(role)
          )
        )) {

          // if the parent is an array splice the key index.
          if (parent.length > 0) return parent.splice(parseInt(key), 1)

          // if the parent is an object delete the key from the parent.
          return delete parent[key]
        }

        // iterate through the object tree.
        Object.keys(o).forEach((key) => {
          if (o[key] && typeof o[key] === 'object') objectEval(o[key], o, key)
        });

      })(_locale)
    }

  }

  if (req.params.key === 'locales') return res.send(Object.keys(workspace.locales))

  res.send('Help text.')
}

async function set(req, res) {

  try {

    const pool = new Pool({
      connectionString: process.env.WORKSPACE.split('|')[0],
      statement_timeout: 10000
    })

    await pool.query(`
      INSERT INTO ${process.env.WORKSPACE.split('|')[1]} (settings)
      SELECT $1 AS settings;`, [req.body]);

    return res.send('PostgreSQL Workspace updated.')

  } catch (err) {

    console.error(err)
    return res.status(500).send('FAILED to update PostgreSQL Workspace table.')
  }
}