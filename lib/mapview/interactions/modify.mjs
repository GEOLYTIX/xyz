/**
## Mapview.interactions.modify()

Dictionary entries:
- delete_vertex

@requires /dictionary

@module /mapview/interactions/modify

@param {Object} params
The params object argument.
*/

export default function (params) {
  const mapview = this;

  // Finish the current interaction.
  mapview.interaction?.finish();

  mapview.interaction = {
    deleteCondition: (e) => {
      if (e.type === 'singleclick') {
        const geom = mapview.interaction.Feature.getGeometry();

        const geomType = geom.getType();

        if (geomType === 'Point') return;

        const coords = geom.getCoordinates();

        // Return on point or line with 2 vertices.
        if (geomType === 'LineString' && coords.length < 3) return;

        // Return on polygon with less than 3 vertices.
        if (geomType === 'Polygon' && coords[0].length <= 4) return;

        // Set popup to remove vertex.
        mapview.popup({
          content: mapp.utils.html.node`<ul>
            <li
              onclick=${() => {
                mapview.interaction.interaction.removePoint();
                mapview.interaction.vertices.push(
                  mapview.interaction.Feature.getGeometry().getClosestPoint(
                    e.coordinate,
                  ),
                );
              }}>${mapp.dictionary.delete_vertex}`,
          coords: geom.getClosestPoint(e.coordinate),
        });
      }
    },

    finish,

    format: new ol.format.GeoJSON(),

    getFeature,

    Layer: new ol.layer.Vector({
      zIndex: Infinity,
    }),

    modifyend: mapp.ui?.elements.contextMenu.modify.bind(this),

    Style: [
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          stroke: new ol.style.Stroke({
            color: '#3399CC',
            width: 1.25,
          }),
        }),
        stroke: new ol.style.Stroke({
          color: '#3399CC',
          width: 1.25,
        }),
      }),
      new ol.style.Style({
        geometry: mapp.utils.verticeGeoms,
        image: new ol.style.Circle({
          fill: new ol.style.Fill({
            color: '#eee',
          }),
          radius: 5,
          stroke: new ol.style.Stroke({
            color: '#3399CC',
            width: 1.25,
          }),
        }),
      }),
    ],

    source: new ol.source.Vector(),

    type: 'modify',

    vertices: [],

    // Spread params argument.
    ...params,
  };

  mapview.Map.getTargetElement().style.cursor = 'crosshair';

  mapview.interaction.source.addFeature(mapview.interaction.Feature);

  // Set mapview.interaction.Layer source.
  mapview.interaction.Layer.setSource(mapview.interaction.source);

  // Set mapview.interaction.Layer style
  mapview.interaction.Layer.setStyle(mapview.interaction.Style);

  // Add mapview.interaction.Layer to mapview.
  mapview.Map.addLayer(mapview.interaction.Layer);

  mapview.interaction.interaction = new ol.interaction.Modify(
    mapview.interaction,
  );

  // Will clear remove vertex popup.
  mapview.interaction.interaction.on('modifystart', (e) => {
    mapview.popup(null);
  });

  if (typeof mapview.interaction.modifyend === 'function') {
    mapview.interaction.interaction.on(
      'modifyend',
      mapview.interaction.modifyend,
    );
  }

  // Add OL interaction to mapview.Map
  mapview.Map.addInteraction(mapview.interaction.interaction);

  // Assign snap interaction.
  mapview.interactions.snap(mapview);

  function getFeature() {
    return JSON.parse(
      mapview.interaction.format.writeFeature(mapview.interaction.Feature, {
        dataProjection: 'EPSG:' + mapview.interaction.srid || mapview.srid,
        featureProjection: 'EPSG:' + mapview.srid,
      }),
    );
  }

  function finish(feature) {
    // Remove snap interaction.
    mapview.interaction.snap?.remove?.();

    // Reset the cursor style.
    mapview.Map.getTargetElement().style.cursor = 'default';

    // Remove popup from mapview.
    mapview.popup(null);

    // Remove interaction from mapview.Map.
    mapview.Map.removeInteraction(mapview.interaction.interaction);

    // Clear the modify source.
    mapview.interaction.source.clear();

    // Remove draw Layer from mapview.Map.
    mapview.Map.removeLayer(mapview.interaction.Layer);

    mapview.interaction.callback?.(feature);
  }
}
