/**
### /ui/elements/jsoneditor

The module dynamically imports the [vanilla-jsoneditor]{@link https://www.npmjs.com/package/vanilla-jsoneditor} from esm.sh and exports a utility method to create a jsoneditor control.

@requires /utils/esmImport

@module /ui/elements/jsoneditor
*/

/**
@function createJSONEditor
@async

@description
The method dynamically imports the jsoneditor module from esm.sh and asssigns the module to the esm variable.

@param {Object} params Parameter for the creation of a jsoneditor element.
@property {Object} params.props Custom property for the createJSONEditor method.
@property {Object} params.data JSON data for the jsoneditor content.

@returns {Promise<Object|Error>} Exports a jsoneditor instance or an error if the jsoneditor module could not be imported.
*/
export default async function createJSONEditor(params) {
  const mod = await mapp.utils.esmImport('vanilla-jsoneditor@3.3.1');

  if (mod instanceof Error) return mod;

  params.content ??= { json: {} };

  if (typeof params.data === 'object') {
    params.content.json = params.data;
  }

  const editor = mod.createJSONEditor({
    props: {
      content: params.content,
      ...params.props,
    },
    target: params.target,
  });

  return editor;
}
