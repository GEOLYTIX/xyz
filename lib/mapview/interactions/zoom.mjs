/**
## /mapview/interactions/zoom

The module exports the zoom interaction method which is bound to a mapview in the [decorator]{@link module:/mapview~decorate} method.

@module /mapview/interactions/zoom
*/

/**
@function zoom

@description
Defines the behaviour for a zoom interaction performed on the map.

@param {object} params The params object is spread into the interaction defaults.
@param {mapview} mapview The mapview object to which the interaction will be added.
*/
export default function zoom(params, mapview = this) {
  // Finish the current interaction.
  mapview.interaction?.finish();

  mapview.interaction = {
    finish: finish,

    Layer: new ol.layer.Vector({
      source: new ol.source.Vector(),
    }),

    // Spread params argument.
    ...params,
  };

  mapview.interaction.Layer.getSource().clear();

  mapview.Map.addLayer(mapview.interaction.Layer);

  mapview.Map.getTargetElement().style.cursor = 'zoom-in';

  mapview.interaction.interaction = new ol.interaction.Draw({
    geometryFunction: ol.interaction.Draw.createBox(),
    source: mapview.interaction.Layer.getSource(),
    style: {
      'fill-color': '#fff9',
      'stroke-color': '#ddd',
    },
    type: 'Circle',
  });

  mapview.interaction.interaction.on('drawend', (e) => {
    mapview.fitView(e.feature.getGeometry().getExtent());

    finish();
  });

  mapview.Map.addInteraction(mapview.interaction.interaction);

  function finish() {
    mapview.Map.getTargetElement().style.cursor = 'auto';

    mapview.Map.removeInteraction(mapview.interaction.interaction);

    mapview.Map.removeLayer(mapview.interaction.Layer);

    mapview.interaction.Layer.getSource().clear();

    mapview.interaction.callback?.();
  }
}
