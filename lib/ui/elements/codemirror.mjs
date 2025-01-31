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

  const view = new codemirror.EditorView({
    parent: params.target,
    doc: `{"version": "9.99.99", "data": [1, 2, 3]}`,
    extensions: [codemirror.basicSetup, json()],
  });

  console.log(view);

  return view;
};
