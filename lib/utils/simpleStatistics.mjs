/**
### /utils/simpleStatistics

The module dynamically imports the [simple-statistics]{@link https://www.npmjs.com/package/simple-statistics} from esm.sh.

@module /utils/simpleStatistics
*/

let promise, mod;

/**
@function esmImport
@async

@description
The method dynamically imports the jsoneditor module from esm.sh and asssigns the module to the esm variable.

A promise for the import will be assigned to the promise variable on first call.

The method awaits the import promise to resolve the esm module.
*/
async function esmImport() {
  promise ??= new Promise((resolve) => {
    import('https://esm.sh/simple-statistics@7.8.8').then((esm) => {
      mapp.utils.stats = esm;
      resolve();
    });
  });

  await promise;
}

export default async function simpleStatistics() {
  await esmImport();
}
