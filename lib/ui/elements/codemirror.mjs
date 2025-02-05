/**
### /ui/elements/codemirror

@module /ui/elements/codemirror
*/

let promise, codemirror, json;

async function codeMirror() {
  if (codemirror?.EditorView) return new codemirror.EditorView(...arguments);

  // Create promise to load maplibre from esm.sh
  if (!promise)
    promise = new Promise((resolve) => {
      import('https://esm.sh/codemirror@6.0.1').then((mod) => {
        codemirror = mod;

        import('https://esm.sh/@codemirror/lang-json').then((lang) => {
          json = lang.json;

          resolve();
        });
      });
    });

  await promise;

  if (!codemirror?.EditorView) return;

  return new codemirror.EditorView(...arguments);
}

export default async (params) => {
  await codeMirror();

  if (typeof params.data === 'object') {
    params.doc = JSON.stringify(params.data);
  }

  const view = new codemirror.EditorView({
    parent: params.target,
    doc: params.doc,
    extensions: [codemirror.basicSetup, json()],
  });

  return view;
};
