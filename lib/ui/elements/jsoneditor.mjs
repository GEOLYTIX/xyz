/**
### /ui/elements/jsoneditor

@module /ui/elements/jsoneditor
*/

let promise, mod;

async function jsonEditor() {
  //if (mod?.createJSONEditor) return;

  // Create promise to load maplibre from esm.sh
  if (!promise)
    promise = new Promise((resolve) => {
      import('https://esm.sh/vanilla-jsoneditor@2.3.3').then((esm) => {
        mod = esm;
        resolve();
      });
    });

  await promise;
}

export default async (params) => {
  await jsonEditor();

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
    },
  });

  return editor;
};
