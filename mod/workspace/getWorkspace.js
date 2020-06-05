const fetch = require('node-fetch')

const assignDefaults = require('./assignDefaults')

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

    await layerTemplates()

    workspace = await assignDefaults(workspace)

  }

  return workspace
}

async function layerTemplates() {

  Object.keys(workspace.locales).forEach(locale => {

    Object.keys(workspace.locales[locale].layers).forEach(_layer => {

      const layer = workspace.locales[locale].layers[_layer];

      if (layer.template && workspace.templates[layer.template]) {
        workspace.locales[locale].layers[_layer] = Object.assign({}, workspace.templates[layer.template], layer)
      }

    })

  })

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

const renderTemplate = location => {
  const template = readFileSync(join(__dirname, location)).toString('utf8')

  return {
    template: template,
    render: params => template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')
  }
}

async function assignTemplates() {

  workspace.templates = Object.assign({

    //views
    _desktop: renderTemplate('../../public/views/_desktop.html'),
    _mobile: renderTemplate('../../public/views/_mobile.html'),
    admin_user: renderTemplate('../../public/views/_admin_user.html'),

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

        const template = {}

        template[entry[0]] = {}

        if (_template instanceof Error) {
          template[entry[0]].err = _template
          return resolve(template)
        }

        if (entry[1].layer) {
          Object.assign(template[entry[0]], JSON.parse(_template))
          return resolve(template)
        }

        template[entry[0]].template = _template

        template[entry[0]].dbs = entry[1].dbs

        template[entry[0]].roles = entry[1].roles

        template[entry[0]].access = entry[1].access

        template[entry[0]].render = params => _template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')

        resolve(template)
      }

      // Default templates already have a render method
      if (entry[1].render || (!entry[1].src && !entry[1].template)) return resolve({[entry[0]]:entry[1]})

      if (entry[1].src.toLowerCase().includes('api.github')) {
        return provider.github(entry[1].src).then(template => _resolve(template))
      }

      if (entry[1].src.startsWith('http')) {
        return provider.http(entry[1].src).then(template => _resolve(template))
      }

      if (entry[1].template.toLowerCase().includes('api.github')) {
        return provider.github(entry[1].template).then(template => _resolve(template))
      }

      if (entry[1].template.startsWith('http')) {
        return provider.http(entry[1].template).then(template => _resolve(template))
      }

      return _resolve(entry[1].template)

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