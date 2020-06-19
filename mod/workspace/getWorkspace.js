const fetch = require('node-fetch')

const provider = require('../provider')

const getFrom = {
  'http': ref => http(ref),
  'https': ref => http(ref),
  'file': ref => file(ref.split(':')[1]),
  'github': ref => github(ref.split(':')[1])
}

let workspace = null

module.exports = async cache => {

  if (!workspace || cache) {

    workspace = process.env.WORKSPACE && await getFrom[process.env.WORKSPACE.split(':')[0]](process.env.WORKSPACE) || {}

    if (workspace instanceof Error) return workspace

    await assignTemplates()

    await assignDefaults()

  }

  return workspace
}

async function http(ref){
  try {

    const response = await fetch(ref)

    if (response.status >= 300) return new Error(`${response.status} ${req}`)

    return await response.json()

  } catch(err) {
    console.error(err)
    return err
  }
}

async function file(ref) {
  try {

    const workspace = await provider.file(`../public/workspaces/${ref}`)

    if (workspace instanceof Error) return workspace

    return JSON.parse(workspace, 'utf8')

  } catch (err) {
    console.error(err)
    return err
  }
}

async function github(ref){

  const response = await provider.github(ref)

  if (response instanceof Error) return response

  return JSON.parse(response)
}

const { readFileSync } = require('fs');

const { join } = require('path');

async function assignTemplates() {

  workspace.templates = Object.assign({

    //views
    _desktop: {
      template: readFileSync(join(__dirname, '../../public/views/_desktop.html')).toString('utf8')
    },
    _mobile: {
      template: readFileSync(join(__dirname, '../../public/views/_mobile.html')).toString('utf8')
    },
    admin_user: {
      template: readFileSync(join(__dirname, '../../public/views/_admin_user.html')).toString('utf8')
    },

    //queries
    mvt_cache: require('../../public/queries/mvt_cache'),
    get_nnearest: require('../../public/queries/get_nnearest'),
    field_stats: require('../../public/queries/field_stats'),
    infotip: require('../../public/queries/infotip'),
    count_locations: require('../../public/queries/count_locations'),
    labels: require('../../public/queries/labels'),
    layer_extent: require('../../public/queries/layer_extent'),
    set_field_array: require('../../public/queries/set_field_array'),
    filter_aggregate: require('../../public/queries/filter_aggregate'),
  }, workspace.templates)

  const templatePromises = Object.entries(workspace.templates).map(
    entry => new Promise(resolve => {

      function _resolve(_template) {

        // Failed to fetch template from src.
        if (_template instanceof Error) {
          return resolve({
            [entry[0]]: { err: _template }
          })
        }

        // Template maybe json as string.
        if (typeof _template === 'string') {
          try {
            _template = JSON.parse(_template)
          } catch(err) { }
        }

        // Template is string only.
        if (typeof _template === 'string') {
          _template = Object.assign(
            entry[1],
            {
              template: _template
            })
        }

        // Assign render method if none exists.
        if (!_template.render) {
          _template.render = params => _template.template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')
        }

        resolve({
          [entry[0]]: _template
        })
      }

      // Default templates already have a render method
      if (!entry[1].src) return _resolve(entry[1])

      if (entry[1].src && entry[1].src.startsWith('file:')) {
        return provider.file(`../public/${entry[1].src.replace('file:', '')}`)
          .then(_resolve)
      }

      if (entry[1].src && entry[1].src.toLowerCase().includes('api.github')) {
        return provider.github(entry[1].src)
          .then(_resolve)
      }

      if (entry[1].src && entry[1].src.startsWith('http')) {
        return provider.http(entry[1].src)
          .then(_resolve)
      }

    })
  )

  return new Promise((resolve, reject) => {

    Promise
      .all(templatePromises)
      .then(arr => {
        Object.assign(workspace.templates, ...arr)
        resolve()
      })
      .catch(error => {
        console.error(error)
        reject()
      });

  })

}

const defaults = require('./defaults')

async function assignDefaults() {

  Object.keys(workspace.locales).forEach(locale_key => {

    const locale = workspace.locales[locale_key]

    locale.key = locale_key

    Object.keys(locale.layers).forEach(layer_key => {

      let layer = locale.layers[layer_key]

      layer.key = layer_key

      if (layer.template && workspace.templates[layer.template]) {
        layer = Object.assign(
        {},
        workspace.templates[layer.template],
        layer)
      }

      layer = Object.assign(
        {},
        defaults.layers[layer.format] || {},
        layer)

      layer.style = layer.style && Object.assign(
        {},
        defaults.layers[layer.format].style,
        layer.style)

      locale.layers[layer_key] = layer
    })
  })

  Object.keys(workspace.templates).forEach(layer_key => {

    let layer = workspace.templates[layer_key]

    if (layer.format && defaults.layers[layer.format]) {

      layer.key = layer_key

      layer = Object.assign(
        {},
        defaults.layers[layer.format],
        layer)

      layer.style = layer.style && Object.assign(
        {},
        defaults.layers[layer.format].style,
        layer.style)

      workspace.templates[layer_key] = layer

    }

  })
}