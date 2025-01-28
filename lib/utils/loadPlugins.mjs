/**
Exports the default loadPlugins utility method as mapp.utils.loadPlugins().

@module /utils/loadPlugins
*/

/**
@function loadPlugins

@description
The loadPlugins utility method receives an array argument of src string locations.

The method creates an array of promises to load each plugin from the provided source.

All import promises must be resolved for the loadPlugins method to resolve.

The endsWith argument can be used to provide an array of string conditions on which the plugin src string must end to be loaded.

@param {Array} plugins Array of plugin src location strings.
@param  {Array} endsWith Array of strings to limit which plugins should be loaded. Defaults to ['.js','.mjs']

@returns {Promise} The promise returned from the method will resolve once all [plugin] import promises are settled.
*/

export default function loadPlugins(plugins, endsWith = ['.js', '.mjs']) {
  if (!Array.isArray(plugins)) return;

  return new Promise((resolveAll) => {
    const promises = plugins
      .filter((plugin) => endsWith.some((_this) => plugin.endsWith(_this)))
      .map(loadPlugin);

    Promise.allSettled(promises)
      .then(() => {
        resolveAll();
      })
      .catch((err) => {
        console.error(err);
        resolveAll();
      });
  });
}

function loadPlugin(plugin) {
  return new Promise((resolve, reject) =>
    import(plugin)
      .then((mod) => {
        resolve(mod);
      })
      .catch((err) => {
        console.warn(`Failed to load plugin: ${plugin}`);
        console.error(err);
        reject(err);
      }),
  );
}
