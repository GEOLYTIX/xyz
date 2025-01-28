/**
## /utils/olScript

Exports the olScript utility method as default.

@module /utils/olScript
*/

/**
@function olScript
@async

@description
The olScript method assigns a script tag to the document head for the Openlayers cdn src. The tag is appended in a promise which assigns the resolve to the onload method of the tag element.

It is recommended to load Openlayers by defining the script in the document markup header. A warning will be logged if the script is loaded through the utility method.
*/
export default async function olScript() {
  await new Promise((resolve) => {
    const script = document.createElement('script');

    script.type = 'application/javascript';

    script.src = 'https://cdn.jsdelivr.net/npm/ol@v10.3.1/dist/ol.js';

    script.onload = resolve;

    document.head.append(script);

    console.warn('Openlayers v10.3.1 loaded from script tag.');
  });
}
