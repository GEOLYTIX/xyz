const github = require('../provider/github')

const cloudfront = require('../provider/cloudfront')

const http = require('./http')

const file = require('./file')

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

  const templatePromises = Object.entries(workspace.templates).map(
    entry => new Promise(resolve => {

      // Entries without a src value must not be fetched.
      if (!entry[1].src) return _resolve(entry[1])

      // Substitute SRC_* parameter.
      entry[1].src = entry[1].src.replace(/\$\{(.*?)\}/g,
        matched => process.env[`SRC_${matched.replace(/\$|\{|\}/g, '')}`] || matched)

      if (entry[1].src && entry[1].src.startsWith('file:')) {
        return file(`../../public/${entry[1].src.replace('file:', '')}`)
          .then(_resolve)
      }

      if (entry[1].src && entry[1].src.startsWith('cloudfront:')) {
        return cloudfront(entry[1].src.split(':')[1])
          .then(_resolve)
      }

      if (entry[1].src && entry[1].src.toLowerCase().includes('api.github')) {
        return github(entry[1].src)
          .then(_resolve)
      }

      if (entry[1].src && entry[1].src.startsWith('http')) {
        return http(entry[1].src)
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