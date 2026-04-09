/**
## /ui/layers/panels/gazetteer

The layer gazetteer panel module exports a method allowing to add a gazetteer search input to the layer view.

@module /ui/layers/panels/gazetteer
*/

export default (layer) => {
  const gazetteer = {
    layer: layer.key,
    mapview: layer.mapview,
    target: mapp.utils.html.node`<div>`,
    ...layer.gazetteer,
  };

  mapp.ui.Gazetteer(gazetteer);

  return gazetteer.target;
};
