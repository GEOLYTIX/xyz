/**
## /mapview/interactions/modify

The module exports the modify interaction method which is bound to a mapview in the [decorator]{@link module:/mapview~decorate} method.

@requires /dictionary
@module /mapview/interactions/modify
*/

/**
@function modify
Defines the behaviour for a modification interaction performed on the map.

@param {Object} params Extra parameters for the mapview.interaction.
@param {mapview} mapview The mapview object to which the interaction will be added.
*/
export default function modify(params, mapview = this) {
  // Finish the current interaction.
  mapview.interaction?.finish();

  mapview.interaction = {
    deleteCondition: (e) => {
      if (e.type === 'singleclick') {
        const params = {};

        params.geom = mapview.interaction.Feature.getGeometry();

        params.geomType = params.geom.getType();

        if (params.geomType === 'Point') return;

        params.coords = params.geom.getCoordinates();

        // Return on point or line with 2 vertices.
        if (params.geomType === 'LineString' && params.coords.length < 3)
          return;

        params.ringLength =
          params.geomType === 'Polygon' ? params.coords[0].length : 0;
        params.clickedPolyIndex = -1;

        params.minDist = Infinity;
        params.polygons = params.geom.getPolygons();

        params.polygons.forEach((poly, idx) => {
          const closest = poly.getClosestPoint(e.coordinate);
          const dx = closest[0] - e.coordinate[0];
          const dy = closest[1] - e.coordinate[1];
          const dist = dx * dx + dy * dy;

          if (dist < params.minDist) {
            params.minDist = dist;
            params.clickedPolyIndex = idx;
            params.ringLength = poly.getCoordinates()[0].length;
          }
        });

        // Initialize empty list for popup content
        params.content = mapp.utils.html.node`<ul></ul>`;

        // Call the vertexRemoval function to handle standard vertex removal
        vertexRemoval(mapview, e, params);

        // Call the multipolygonPartRemoval function to handle MultiPolygon part removal
        multipolygonPartRemoval(mapview, e, params);

        // Set popup
        mapview.popup({
          content: params.content,
          coords: params.geom.getClosestPoint(e.coordinate),
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

  //End the modification on escape key.
  document.addEventListener('keyup', escape);

  /**
   * @function vertexRemoval
   * @description Adds the option to delete a vertex to the popup content if the geometry has more than 3 vertices.
   * @param {Object} mapview The mapview object.
   * @param {Object} e The event object.
   * @param {Object} params The parameters object containing geometry information.
   */
  function vertexRemoval(mapview, e, params) {
    // Return if the shape has less than 4 vertices as you cannot remove a vertex from a triangle or line.
    if (params.ringLength < 4) return;

    params.content.appendChild(mapp.utils.html.node`<li
            onclick=${() => {
              mapview.interaction.interaction.removePoint();
              mapview.interaction.vertices.push(
                mapview.interaction.Feature.getGeometry().getClosestPoint(
                  e.coordinate,
                ),
              );
              mapview.popup(null);

              mapview.interaction.interaction.dispatchEvent({
                type: 'modifyend',
                features: new ol.Collection([mapview.interaction.Feature]),
              });
            }}>${mapp.dictionary.delete_vertex}</li>`);

    return params.content;
  }

  /**
   * @function multipolygonPartRemoval
   * @description Adds the option to delete a polygon part to the popup content if the geometry is a MultiPolygon.
   * @param {Object} mapview The mapview object.
   * @param {Object} e The event object.
   * @param {Object} params The parameters object containing geometry information.
   */
  function multipolygonPartRemoval(mapview, e, params) {
    if (params.geomType !== 'MultiPolygon') return;

    // Add the option to delete the polygon part to the popup content
    params.content.appendChild(mapp.utils.html.node`<li
            onclick=${() => {
              mapview.popup(null);

              const polygons = params.geom.getPolygons();
              const remaining = polygons.filter(
                (_, idx) => idx !== params.clickedPolyIndex,
              );

              if (remaining.length === 0) {
                // If they deleted the last part, end the interaction and nullify
                mapview.interaction.finish();
                mapview.interaction.callback?.(null);
              } else {
                // Apply the filtered coordinates back to the geometry
                params.geom.setCoordinates(
                  remaining.map((p) => p.getCoordinates()),
                );

                // Refresh the visual display
                mapview.interaction.source.clear();
                mapview.interaction.source.addFeature(
                  mapview.interaction.Feature,
                );

                mapview.interaction.interaction.dispatchEvent({
                  type: 'modifyend',
                  features: new ol.Collection([mapview.interaction.Feature]),
                });
              }
            }}>
        ${mapp.dictionary.delete_polygon_part}</li>`);

    return params.content;
  }

  /**
   * @function escape
   * @description Ends the modification interaction when the Escape key is pressed.
   * @param {Object} e The event object.
   */
  function escape(e) {
    e.key === 'Escape' && mapview.interaction.finish();
  }

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

  /**
   * @function getFeature
   * @description Returns the modified feature as a GeoJSON object.
   * @returns {Object} The modified feature in GeoJSON format.
   */
  function getFeature() {
    return JSON.parse(
      mapview.interaction.format.writeFeature(mapview.interaction.Feature, {
        dataProjection: 'EPSG:' + mapview.interaction.srid || mapview.srid,
        featureProjection: 'EPSG:' + mapview.srid,
      }),
    );
  }

  /**
   * @function finish
   * @description Ends the modification interaction, cleans up event listeners, and removes the interaction from the map.
   * @param {Object} feature The modified feature to be passed to the callback function.
   */
  function finish(feature) {
    //Remove the escape key event listener
    document.removeEventListener('keyup', escape);

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
