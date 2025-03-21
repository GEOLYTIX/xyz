/**
### mapp.layer.featureHover()

@module /layer/featureHover
*/

/**
@function featureHover

@description
The featureHover method will send an xhr request for the provided feature argument. The returned string value will be displayed in an infotip element in the feature layer mapview.

@param {object} feature 
@param {layer} layer A decorated mapp layer object.
*/
export default function featureHover(feature, layer) {
  // The hover method must only execute if the display flag is set.
  if (!layer.style.hover.display) return;

  // Store current highlight (feature) key.
  const featureKey = layer.mapview.interaction?.current?.key?.toString();

  if (!featureKey) return;

  const table = layer.tableCurrent();

  if (!table) return;

  const paramString = mapp.utils.paramString({
    locale: layer.mapview.locale.key,
    layer: layer.key,
    layer_template: layer.params?.layer_template,
    filter: feature.properties.count > 1 && layer.filter?.current,
    template: layer.style.hover.query || 'infotip',
    qID: layer.qID,
    id: feature.properties.id,
    table,
    geom: layer.geom,
    field: layer.style.hover.field,
    coords:
      feature.properties.count > 1 &&
      ol.proj.transform(
        feature.getGeometry().getCoordinates(),
        `EPSG:${layer.mapview.srid}`,
        `EPSG:${layer.srid}`,
      ),
  });

  mapp.utils
    .xhr(`${layer.mapview.host}/api/query?${paramString}`)
    .then((response) => {
      // Check whether there is a response to display.
      if (!response) return;

      if (typeof layer.style.hover.render === 'function') {
        const content = layer.style.hover.render(response);
        layer.mapview.infotip(content);
        return;
      }

      // Check whether the response label field has a value.
      if (response.label == '') return;

      // Check whether highlight feature is still current.
      if (layer.mapview.interaction?.current?.key !== featureKey) return;

      // Display the response label as infotip.
      layer.mapview.infotip(response.label);
    });
}
