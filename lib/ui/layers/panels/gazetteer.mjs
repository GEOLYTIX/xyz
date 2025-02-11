export default (layer) => {
  const gazetteer = Object.assign(
    {
      mapview: layer.mapview,
      target: mapp.utils.html.node`<div>`,
      layer: layer.key,
    },
    layer.gazetteer,
  );

  mapp.ui.Gazetteer(gazetteer);

  return gazetteer.target;
};
