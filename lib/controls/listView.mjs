/**
 The listview module exports the listViewPanel function which will create a panel with a listview inside.

@module /controls/listViewPanel
@requires /ui/layers/listView
*/

/**
 @function listViewPanel
 Creates a listview panel, which will get appended to the the ctrl-panel element or specified target.

 @param {Object} params The configuration options for the listview panel.
 @property {HTMLElement} params.target The target for the listview.
 @property {Object} params.mapview The current mapview.
*/
export default function listViewPanel(params) {
  console.log(this);
  // Create the listview.
  const listViewParams = {
    target: params.target,
    mapview: params.mapview,
    layers: params.mapview.layers,
  };

  mapp.ui[params.functionKey].listview(listViewParams);
}
