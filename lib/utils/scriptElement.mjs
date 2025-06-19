/**
### /utils/scriptElement

The module exports a default method to load scripts from tags.

@module /utils/scriptElement
*/

const promises = {};

/**
@function scriptElement
@async

@description
The scriptElement method adds a promise to the promises object for a script src to be loaded.

An existing promise will be awaited.

The promise resolves with the load event.

@param {string} module The script element src.
@returns {Promise<Event>} The promise resolves to the load event for the script element.
*/
export default async function scriptElement(module) {
  promises[module] ??= new Promise((resolve, reject) => {
    const scriptEl = document.createElement('script');
    scriptEl.type = 'module';
    scriptEl.src = module;

    scriptEl.addEventListener('load', resolve);
    scriptEl.addEventListener('error', reject);

    document.head.append(scriptEl);
  });

  return await promises[module];
}
