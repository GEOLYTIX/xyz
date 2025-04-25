/**
## ui/layers/panels/dataviews

The dataviews panel module exports the dataviews method.

@requires /ui/Dataview

@module /ui/layers/panels/dataviews
*/

/**
@function dataviews

@description
### mapp.ui.layers.panels.dataviews(layer)

The dataviews method returns a drawer with checkbox elements for each dataview object in `layer.dataviews{}`.

The dataviews will be decorated with the `mapp.ui.Dataview()` method.

Specifying `layer.dataviews.drawer: false` will prevent a drawer from being made for the dataview panel.

@param {layer} layer The decorated mapp layer object.
@property {Object} layer.dataviews The layer dataviews.

@return {HTMLElement}
*/
export default function dataviews(layer) {
  const content = [];

  for (const [key, dataview] of Object.entries(layer.dataviews)) {
    // The dataview entry may be a flag.
    if (typeof dataview === 'string' || dataview === true || dataview === false)
      continue;

    Object.assign(dataview, {
      key,
      layer,
      host: layer.mapview.host,
    });

    // Find tabview element from data-id attribute.
    dataview.tabview = document.querySelector(`[data-id=${dataview.target}]`);

    // Return if the named tabview is not found in document.
    if (dataview.tabview) {
      // Return if on mobile as dataviews are not supported.
      if (mapp.utils.mobile()) return;

      dataview.show ??= () => {
        // Create tab after dataview creation is complete.
        dataview.tabview.dispatchEvent(
          new CustomEvent('addTab', { detail: dataview }),
        );

        // Show the dataview tab.
        dataview.show();
      };

      dataview.hide ??= () => {
        dataview.display = false;
        dataview.remove();
      };
    }

    // Assign target html element for dataview.
    dataview.target = mapp.utils.html.node`
      <div class="dataview-target">`;

    // Assign label for dataview.chkbox
    dataview.label ??= dataview.title || dataview.key;

    if (mapp.ui.Dataview(dataview) instanceof Error) return;

    // Display dataview if layer and dv have display flag.
    layer.display && dataview.display && dataview.show();

    layer.showCallbacks.push(() => {
      dataview.display && dataview.show();
    });

    content.push(dataview.chkbox);

    if (!dataview.tabview) {
      content.push(dataview.target);
    }
  }

  // The dataviews are created but no panel is returned.
  if (layer.dataviews.hide) return;

  if (layer.dataviews.drawer === false) {
    return mapp.utils.html
      .node`<div data-id="dataviews-drawer"><h3>${mapp.dictionary.layer_dataview_header}</h3>${content}`;
  }

  // Create a drawer with the dataview chkbox controls.
  const drawer = mapp.ui.elements.drawer({
    data_id: `dataviews-drawer`,
    class: 'raised',
    header: mapp.utils.html`
      <h3>${mapp.dictionary.layer_dataview_header}</h3>
      <div class="material-symbols-outlined caret"/>`,
    content,
  });

  return drawer;
}
