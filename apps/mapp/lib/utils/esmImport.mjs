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

The promise resolves to an error if the module can not be imported. The failed promise is removed from the promises object so that a subsequent call can retry the import.

@param {string} module The module to import.
@returns {Promise<Module|Error>} The promise resolves to the imported module or an error if the import failed.
*/
export default async function esmImport(module) {
  promises[module] ??= import(`https://esm.sh/${module}`)
    .then((esm) => {
      console.log(`${module} imported from esm.sh`);
      return esm;
    })
    .catch((err) => {
      delete promises[module];
      console.error(`${module} failed to import from esm.sh`, err);
      return err;
    });

  return await promises[module];
}
