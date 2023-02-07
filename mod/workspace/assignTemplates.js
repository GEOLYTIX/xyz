const cloudfront = require('../provider/cloudfront');

const file = require('../provider/file');

const http = require('./httpsAgent');

const getFrom = {
  https: (ref) => http(ref),
  file: (ref) => file(ref.split(':')[1]),
  cloudfront: (ref) => cloudfront(ref.split(':')[1]),
};

const logger = require('../utils/logger');

module.exports = async (workspace) => {

  // Assign default view and query templates to workspace.
  workspace.templates = Object.assign(
    {
      // Query templates:
      count_locations: {
        template: require('../../public/js/queries/count_locations'),
      },
      distinct_values: {
        template: require('../../public/js/queries/distinct_values'),
      },
      field_stats: {
        template: require('../../public/js/queries/field_stats'),
      },
      field_min: {
        template: require('../../public/js/queries/field_min'),
      },
      field_max: {
        template: require('../../public/js/queries/field_max'),
      },
      get_nnearest: {
        render: require('../../public/js/queries/get_nnearest'),
      },
      infotip: {
        render: require('../../public/js/queries/infotip'),
      },
      labels: {
        render: require('../../public/js/queries/labels'),
      },
      layer_extent: {
        template: require('../../public/js/queries/layer_extent'),
      },
      get_last_location: {
        render: require('../../public/js/queries/get_last_location'),
      },
      mvt_cache: {
        admin: true,
        render: require('../../public/js/queries/mvt_cache'),
      },
      set_field_array: {
        template: require('../../public/js/queries/set_field_array'),
      },

      // Default templates can be overridden by assigning a template with the same name.
    },
    workspace.templates
  );

  const templatePromises = Object.entries(workspace.templates)
    .map((entry) => new Promise((resolve) => {

      // Entries without a src value must not be fetched.
      if (!entry[1].src) {
        resolve({
          [entry[0]]: entry[1]
        });
        return;
      }

      // Substitute parameter in src string.
      entry[1].src = entry[1].src.replace(
        /\$\{(.*?)\}/g,
        (matched) => process.env[`SRC_${matched.replace(/\$|\{|\}/g, '')}`] || matched
      );

      // Get template from src.
      getFrom[entry[1].src.split(':')[0]](entry[1].src).then(resolveFrom);

      function resolveFrom(_template) {

        // Failed to fetch template from src.
        if (_template instanceof Error) {
          resolve({
            [entry[0]]: Object.assign(entry[1], {
              err: _template,
            }),
          });
          return;
        }

        // Template is a module.
        if (entry[1].module || (entry[1].type && entry[1].type === 'module')) {
          try {

            // Attempt to construct module from string.
            const module_constructor = module.constructor;
            const Module = new module_constructor();
            Module._compile(_template, entry[1].src);

            // Assign module exports as template function
            resolve({
              [entry[0]]: Object.assign(entry[1], {
                render: Module.exports,
              }),
            });
            return;
          } catch (err) {
            resolve({
              [entry[0]]: Object.assign(entry[1], {
                err: err,
              }),
            });
            return;
          }
        }

        if (typeof _template === 'object') {

          // Assign template object to the entry
          resolve({
            [entry[0]]: Object.assign(_template, entry[1])
          });
          return;
        }

        // Resolve template as string.
        resolve({
          [entry[0]]: Object.assign(entry[1], {
            template: _template,
          }),
        });

      }
    })
    );

  return new Promise((resolve, reject) => {
    Promise.all(templatePromises)
      .then((arr) => {

        // Log set of template objects from resolved promises.
        logger(arr, 'templates');

        // Spread array of template objects and assign to workspace.
        Object.assign(workspace.templates, ...arr);

        // Resolve Promise for all template promises.
        resolve();
      })
      .catch((error) => {
        console.error(error);
        reject();
      });
  });
};
