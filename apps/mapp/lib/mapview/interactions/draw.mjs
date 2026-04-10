/**
## Mapview.interactions.draw()

@module /mapview/interactions/draw

@param {Object} params
The params object argument.
*/

export default function (params) {
  const mapview = this;

  // Finish the current interaction.
  mapview.interaction?.finish();

  // Assign params onto the defaults as mapview.interaction.
  mapview.interaction = {
    condition: (e) => {
      if (mapview.interaction.wait) return false;

      // Right click
      if (e.originalEvent.buttons === 2) {
        // Remove last vertex.
        mapview.interaction.interaction.removeLastPoint();
        mapview.interaction.vertices.pop();

        const moveEvent = new ol.MapBrowserEvent(
          'pointermove',
          mapview.Map,
          e.originalEvent,
        );
        mapview.interaction.interaction.handleEvent(moveEvent);

        mapview.interaction.conditions?.forEach(
          (fn) => typeof fn === 'function' && fn(e),
        );
        return false;
      }

      // Left click.
      if (e.originalEvent.buttons === 1) {
        mapview.interaction.vertices.push(e.coordinate);
        mapview.popup(null);

        mapview.interaction.conditions?.forEach(
          (fn) => typeof fn === 'function' && fn(e),
        );
        return true;
      }
    },

    drawend: mapp.ui?.elements.contextMenu.draw.bind(this),

    finish,

    format: new ol.format.GeoJSON(),

    getFeature,

    // The Layer is required for generated features such as isolines.
    Layer: new ol.layer.Vector({
      zIndex: params.layer?.zIndex || 99,
    }),

    // Bind context menu from mapp ui elements.
    source: new ol.source.Vector(),

    style: [
      new ol.style.Style({
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

    // Whether the draw interaction event should be handled.
    type: 'draw',

    // OL Style for sketch feature.
    vertices: [],

    // Spread params argument.
    ...params,
  };

  // Change cursor style over mapview element.
  mapview.Map.getTargetElement().style.cursor = 'crosshair';

  // Set mapview.interaction.Layer source.
  mapview.interaction.Layer.setSource(mapview.interaction.source);

  // Add mapview.interaction.Layer to mapview.
  mapview.Map.addLayer(mapview.interaction.Layer);

  document.addEventListener('keyup', escape);

  function escape(e) {
    e.key === 'Escape' && mapview.interaction.finish();
  }

  // Create OL draw interaction.
  mapview.interaction.interaction = new ol.interaction.Draw(
    mapview.interaction,
  );

  // Set drawstart event method.
  mapview.interaction.interaction.on('drawstart', (e) => {
    // Get the draw feature geometry.
    const geometry = e.feature.getGeometry();

    async function onChange() {
      mapview.popup({
        content: mapp.utils.html.node`
          <div style="padding: 5px">
          ${await mapp.utils.convert(
            // Get the geometry metric figure.
            mapview.metrics[mapview.interaction.tooltip.metric](geometry),

            // Options argument for conversion.
            mapview.interaction.tooltip,
          )}`,
      });
    }

    // Assign an onchange method to the geometry for the tooltip.
    mapview.interaction.tooltip &&
      geometry.on('change', mapview.interaction.tooltip.onChange || onChange);

    // Clear the source
    mapview.interaction.source.clear();

    // Remove the popup.
    mapview.popup(null);
  });

  if (typeof mapview.interaction.drawend === 'function') {
    mapview.interaction.interaction.on('drawend', mapview.interaction.drawend);
  }

  // Add OL interaction to mapview.Map
  mapview.Map.addInteraction(mapview.interaction.interaction);

  // Assign snap interaction.
  mapview.interactions.snap(mapview);

  // Get first feature from mapview.interaction.source as GeoJSON.
  function getFeature() {
    // Return feature as geojson.
    return JSON.parse(
      mapview.interaction.format.writeFeature(
        // Get first OL feature from source.
        mapview.interaction.source.getFeatures()[0],
        {
          // Use mapview.interaction.srid as dataProjection if defined in params.
          dataProjection:
            'EPSG:' + mapview.interaction.layer?.srid ||
            mapview.interaction.srid ||
            mapview.srid,
          featureProjection: 'EPSG:' + mapview.srid,
        },
      ),
    );
  }

  function finish(feature) {
    document.removeEventListener('keyup', escape);

    // Remove snap interaction.
    mapview.interaction.snap?.remove?.();

    // Reset the cursor style.
    mapview.Map.getTargetElement().style.cursor = 'default';

    // Remove popup from mapview.
    mapview.popup(null);

    // Remove interaction from mapview.Map.
    mapview.Map.removeInteraction(mapview.interaction.interaction);

    // Remove draw Layer from mapview.Map.
    mapview.Map.removeLayer(mapview.interaction.Layer);

    mapview.interaction.callback?.(feature);
  }
}
