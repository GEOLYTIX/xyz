const cloudfront = require('../provider/cloudfront')

const file = require('../provider/file')

const http = require('./httpsAgent')

const getFrom = {
  'https': ref => http(ref),
  'file': ref => file(ref.split(':')[1]),
  'cloudfront': ref => cloudfront(ref.split(':')[1]),
}

const logger = require('../logger')

module.exports = async workspace => {

  // Assign default view and query templates to workspace.
  workspace.templates = Object.assign({

    // Query templates:
    count_locations: require('../../public/js/queries/count_locations'),
    field_stats: require('../../public/js/queries/field_stats'),
    get_nnearest: require('../../public/js/queries/get_nnearest'),
    infotip: require('../../public/js/queries/infotip'),
    labels: require('../../public/js/queries/labels'),
    layer_extent: require('../../public/js/queries/layer_extent'),
    mvt_cache: require('../../public/js/queries/mvt_cache'),
    set_field_array: require('../../public/js/queries/set_field_array'),   

    // Default templates can be overridden by assigning a template with the same name.
  }, workspace.templates)

  const templatePromises = Object.entries(workspace.templates)
    .map(entry => new Promise(resolve => {

      // Entries without a src value must not be fetched.
      if (!entry[1].src) return assign(entry[1])

      // Substitute SRC_* parameter.
      entry[1].src = entry[1].src.replace(/\$\{(.*?)\}/g,
        matched => process.env[`SRC_${matched.replace(/\$|\{|\}/g, '')}`] || matched)

      if (getFrom[entry[1].src.split(':')[0]]) {

        return getFrom[entry[1].src.split(':')[0]](entry[1].src)
          .then(assign)
      }

      function assign(template) {

        // Failed to fetch template from src.
        if (template instanceof Error) {
          return resolve({
            [entry[0]]: { err: template }
          })
        }

        // Template is a module.
        if (entry[1].module || entry[1].type && entry[1].type === 'module') {

          try {
            const module_constructor = module.constructor;
            const Module = new module_constructor();
            Module._compile(template, entry[1].src)
  
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
        if (typeof template === 'string') {
          template = Object.assign(
            entry[1],
            {
              template: template
            })
        }

        resolve({
          [entry[0]]: template
        })
      }

    })
  )

  return new Promise((resolve, reject) => {

    const timestamp = Date.now()

    Promise
      .all(templatePromises)
      .then(arr => {
        logger(`Templates for ${workspace.nanoid} fetched in ${Date.now() - timestamp}`, 'templates')
        Object.assign(workspace.templates, ...arr)
        resolve()
      })
      .catch(error => {
        console.error(error)
        reject()
      })

  })

}