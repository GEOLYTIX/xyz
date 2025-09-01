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
      host: layer.mapview.host,
      key,
      layer,
    });

    // Find tabview element from data-id attribute.
    populateTabview(dataview);

    // Return if on mobile as dataviews are not supported.
    if (dataview.tabview && mapp.utils.mobile()) return;

    // Assign label for dataview.chkbox
    dataview.label ??= dataview.title || dataview.key;

    mapp.ui.utils.dataviewDialog(dataview);

    // Assign target html element for dataview.
    dataview.target =
      dataview.target instanceof HTMLElement
        ? dataview.target
        : mapp.utils.html.node`
        <div class="dataview-target">`;

    if (mapp.ui.Dataview(dataview) instanceof Error) return;

    // Display dataview if layer and dv have display flag.
    layer.display && dataview.display && dataview.show();

    layer.showCallbacks.push(() => {
      if (dataview.display) {
        dataview.chkbox.querySelector('input').checked = true;
        dataview.show();
      }
    });

    layer.hideCallbacks.push(() => {
      // Only attempt to hide a dataview which is currently displayed.
      if (dataview.display) {
        dataview.chkbox.querySelector('input').checked = false;
        dataview.hide();
      }
    });

    content.push(dataview.chkbox);

    !dataview.tabview &&
      !dataview.dataview_dialog &&
      content.push(dataview.target);
  }

  // The dataviews are created but no panel is returned.
  if (layer.dataviews.hide) return;

  if (layer.dataviews.drawer === false) {
    return mapp.utils.html
      .node`<div data-id="dataviews-drawer"><h3>${mapp.dictionary.layer_dataview_header}</h3>${content}`;
  }

  // Create a drawer with the dataview chkbox controls.
  const drawer = mapp.ui.elements.drawer({
    class: 'raised',
    content,
    data_id: `dataviews-drawer`,
    header: mapp.utils.html`
      <h3>${mapp.dictionary.layer_dataview_header}</h3>
      <div class="notranslate material-symbols-outlined caret"/>`,
    popout: layer.dataviews.popout,
  });

  return drawer;
}

/**
@function populateTabview

@description
Adds show and hide methods for dataviews with a tabview target

@param {layer} dataview The dataview to add the show nad hide functions to.
*/
function populateTabview(dataview) {
  dataview.tabview = document.querySelector(`[data-id=${dataview.target}]`);

  // Return if the named tabview is not found in document.
  if (dataview.tabview) {
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
}
