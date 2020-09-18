const provider = require('../provider')

const getFrom = {
  'http': ref => provider.http(ref),
  'https': ref => provider.http(ref),
  'file': ref => provider.file(`../public/workspaces/${ref.split(':')[1]}`),
  'github': ref => provider.github(ref.split(':')[1]),
  'cloudfront': ref => provider.cloudfront(ref.split(':')[1]),
}

let workspace = null

module.exports = async req => {

  let timestamp = Date.now()

  // If the workspace is empty or older than 1hr it needs to be cached.
  if (!workspace || ((timestamp - workspace.timestamp) > 3600000)) {

    if (!workspace) {
      req.params.logger(`workspace is empty ${timestamp}`)
    } else if ((timestamp - workspace.timestamp) > 3600000) {
      req.params.logger(`workspace has expired ${workspace.timestamp} | new timestamp is ${timestamp}`)
    }

    workspace = process.env.WORKSPACE && await getFrom[process.env.WORKSPACE.split(':')[0]](process.env.WORKSPACE) || {}

    if (workspace instanceof Error) return workspace

    await assignTemplates()

    await assignDefaults()

    workspace.timestamp = timestamp

  } else {

    req.params.logger(`workspace cached ${workspace.timestamp} | age ${timestamp - workspace.timestamp}`)

  }

  return workspace
}

const { readFileSync } = require('fs');

const { join } = require('path');

async function assignTemplates() {

  // Assign default view and query templates to workspace.
  workspace.templates = Object.assign({

    // View templates:
    _desktop: {
      template: readFileSync(join(__dirname, '../../public/views/_desktop.html')).toString('utf8')
    },
    _mobile: {
      template: readFileSync(join(__dirname, '../../public/views/_mobile.html')).toString('utf8')
    },
    admin_user: {
      template: readFileSync(join(__dirname, '../../public/views/_admin_user.html')).toString('utf8')
    },

    // Query templates:
    mvt_cache: require('../../public/queries/mvt_cache'),
    get_nnearest: require('../../public/queries/get_nnearest'),
    field_stats: require('../../public/queries/field_stats'),
    infotip: require('../../public/queries/infotip'),
    count_locations: require('../../public/queries/count_locations'),
    labels: require('../../public/queries/labels'),
    layer_extent: require('../../public/queries/layer_extent'),
    set_field_array: require('../../public/queries/set_field_array'),
    filter_aggregate: require('../../public/queries/filter_aggregate'),

    // Default templates can be overridden by assigning a template with the same name.
  }, workspace.templates)

  const templatePromises = Object.entries(workspace.templates).map(
    entry => new Promise(resolve => {

      // Entries without a src value must not be fetched.
      if (!entry[1].src) return _resolve(entry[1])

      // Substitute SRC_* parameter
      entry[1].src = entry[1].src.replace(/\$\{(.*?)\}/g,
        matched => process.env[`SRC_${matched.replace(/\$|\{|\}/g, '')}`] || matched)

      if (entry[1].src && entry[1].src.startsWith('file:')) {
        return provider.file(`../public/${entry[1].src.replace('file:', '')}`)
          .then(_resolve)
      }

      if (entry[1].src && entry[1].src.startsWith('cloudfront:')) {
        return provider.cloudfront(entry[1].src.split(':')[1])
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

      function _resolve(_template) {

        // Failed to fetch template from src.
        if (_template instanceof Error) {
          return resolve({
            [entry[0]]: { err: _template }
          })
        }

        // Template is a module.
        if (entry[1].module || entry[1].type && entry[1].type === 'module') {

          try {
            const module_constructor = module.constructor;
            const Module = new module_constructor();
            Module._compile(_template, entry[1].src)
  
            return resolve({
              [entry[0]]: Module.exports
            })
          } catch(err) {
            return resolve({
              [entry[0]]: { err: err }
            })
          }

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
        if (!_template.render && !_template.format) {
          _template.render = params => _template.template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')
        }

        resolve({
          [entry[0]]: _template
        })
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

  //Substitute SRC_* parameter in locales.
  workspace.locales = JSON.parse(
    JSON.stringify(workspace.locales || {zero: defaults.locale}).replace(/\$\{(.*?)\}/g,
      matched => process.env[`SRC_${matched.replace(/\$|\{|\}/g, '')}`] || matched)
  )

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
        layer.format && defaults.layers[layer.format] || {},
        layer)

      layer.style = layer.style && Object.assign(
        {},
        layer.format && defaults.layers[layer.format].style,
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