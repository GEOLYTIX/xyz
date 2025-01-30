/**
### /ui/elements/codemirror

@module /ui/elements/codemirror
*/

let promise, codemirror;

async function codeMirror() {
  if (codemirror?.EditorView) return new codemirror.EditorView(...arguments);

  // Create promise to load maplibre from esm.sh
  if (!promise)
    promise = new Promise((resolve) => {
      import('https://esm.sh/codemirror@6.0.1').then((mod) => {
        console.log(mod);
        codemirror = mod;

        resolve();
      });
    });

  await promise;

  if (!codemirror?.EditorView) return;

  return new codemirror.EditorView(...arguments);
}

export default async (params) => {
  await codeMirror();

  console.log(codemirror);

  const view = new codemirror.EditorView({
    parent: params.target,
    doc: 'Hello',
    extensions: [codemirror.basicSetup],
  });

  console.log(view);

  return view;
};
