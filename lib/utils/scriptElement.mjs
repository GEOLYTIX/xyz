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

@param {string} src The script element src.
@param {string} [type='module'] The script type.
@returns {Promise<Event>} The promise resolves to the load event for the script element.
*/
export default async function scriptElement(src, type = 'module') {
  promises[src] ??= new Promise((resolve, reject) => {
    const scriptEl = document.createElement('script');
    scriptEl.type = type;
    scriptEl.src = src;

    scriptEl.addEventListener('load', () => {
      console.log(`${scriptEl.src} script loaded.`);
      resolve();
    });
    scriptEl.addEventListener('error', reject);

    document.head.append(scriptEl);
  });

  return await promises[src];
}
