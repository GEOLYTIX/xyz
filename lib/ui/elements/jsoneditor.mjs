/**
### /ui/elements/jsoneditor

The module dynamically imports the [vanilla-jsoneditor]{@link https://www.npmjs.com/package/vanilla-jsoneditor} from esm.sh and exports a utility method to create a jsoneditor control.

@module /ui/elements/jsoneditor
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
    import('https://esm.sh/vanilla-jsoneditor@2.3.3').then((esm) => {
      mod = esm;
      resolve();
    });
  });

  await promise;
}

/**
@function esmImport
@async

@description
The method dynamically imports the jsoneditor module from esm.sh and asssigns the module to the esm variable.

@param {Object} params Parameter for the creation of a jsoneditor element.
@property {Object} params.props Custom property for the createJSONEditor method.
@property {Object} params.data JSON data for the jsoneditor content.

@returns {object} Exports a jsoneditor instance.
*/
export default async function createJSONEditor(params) {
  await esmImport();

  const content = {};

  if (typeof params.data === 'object') {
    content.json = params.data;
  } else {
    content.text = '';
  }

  const editor = mod.createJSONEditor({
    target: params.target,
    props: {
      content,
      ...params.props,
    },
  });

  return editor;
}
