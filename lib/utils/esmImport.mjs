/**
### /utils/esmImport

The module exports a default method to import modules from esm.sh cdn.

@module /utils/esmImport
*/

const promises = {};

/**
@function esmImport
@async

@description
The esmImport method add a promise to the promises object for the module to be imported.

An existing promise will be awaited.

The promise resolves to the module to be imported.

@param {string} module The module to import.
@returns {Promise<Module>} The promise resolves to the imported module.
*/
export default async function esmImport(module) {
  promises[module] ??= new Promise((resolve) => {
    import(`https://esm.sh/${module}`).then((esm) => {
      resolve(esm);
    });
  });

  return await promises[module];
}
