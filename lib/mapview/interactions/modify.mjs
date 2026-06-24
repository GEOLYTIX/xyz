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
    deleteCondition: (e) => deleteCondition(e, mapview),

    finish: finish.bind(mapview),

    format: new ol.format.GeoJSON(),

    getFeature: getFeature.bind(mapview),

    Layer: new ol.layer.Vector({
      zIndex: Infinity,
    }),

    modifyend: mapp.ui?.elements.contextMenu.modify.bind(mapview),

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

  /**
  @function escape
  @description 
  Ends the modification interaction when the Escape key is pressed.
  @param {Object} e The event object.
  */
  function escape(e) {
    e.key === 'Escape' && mapview.interaction.finish();
  }

  //End the modification on escape key.
  document.addEventListener('keyup', escape);

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
}

/**
@function finish
@description
Ends the modification interaction, cleans up event listeners, and removes the interaction from the map.
@param {Object} feature The modified feature to be passed to the callback function.
*/
function finish(feature) {
  //Remove the escape key event listener
  document.removeEventListener('keyup', escape);

  // Remove snap interaction.
  this.interaction.snap?.remove?.();

  // Reset the cursor style.
  this.Map.getTargetElement().style.cursor = 'default';

  // Remove popup from mapview.
  this.popup(null);

  // Remove interaction from mapview.Map.
  this.Map.removeInteraction(this.interaction.interaction);

  // Clear the modify source.
  this.interaction.source.clear();

  // Remove draw Layer from mapview.Map.
  this.Map.removeLayer(this.interaction.Layer);

  this.interaction.callback?.(feature);
}

/**
@function getFeature
@description Returns the modified feature as a GeoJSON object.
@returns {Object} The modified feature in GeoJSON format.
*/
function getFeature() {
  return JSON.parse(
    this.interaction.format.writeFeature(this.interaction.Feature, {
      dataProjection: 'EPSG:' + this.interaction.srid || this.srid,
      featureProjection: 'EPSG:' + this.srid,
    }),
  );
}

/**
@function deleteCondition
@description
@param {object} e The interaction event object.
@param {mapview} mapview
*/
function deleteCondition(e, mapview) {
  if (e.type !== 'singleclick') return;

  const params = {};

  params.geom = mapview.interaction.Feature.getGeometry();

  params.geomType = params.geom.getType();

  if (params.geomType === 'Point') return;

  params.coords = params.geom.getCoordinates();

  // Initialize empty list for popup content
  params.content = [];

  // Only allow to remove vertex on linestring with more than 2.
  if (params.geomType === 'LineString' && params.coords.length > 2) {
    params.content.push(mapp.utils.html`<li
      onclick=${() => removeVertex(e, mapview)}>
      ${mapp.dictionary.delete_vertex}`);
  }

  // Only allow to delete vertex on polygon with more than 3.
  if (params.geomType === 'Polygon' && params.coords[0].length > 3) {
    params.content.push(mapp.utils.html`<li
      onclick=${() => removeVertex(e, mapview)}>
      ${mapp.dictionary.delete_vertex}`);
  }

  multipolygon(e, mapview, params);

  // Set popup
  mapview.popup({
    content: mapp.utils.html.node`<ul>${params.content}`,
    coords: params.geom.getClosestPoint(e.coordinate),
  });
}

function removeVertex(e, mapview) {
  mapview.interaction.interaction.removePoint();
  mapview.interaction.vertices.push(
    mapview.interaction.Feature.getGeometry().getClosestPoint(e.coordinate),
  );
  mapview.popup(null);

  // Display save/cancel popup.
  mapview.interaction.interaction.dispatchEvent({
    type: 'modifyend',
    features: new ol.Collection([mapview.interaction.Feature]),
  });
}

/**
@function multipolygon
@description 

@param {Object} mapview The mapview object.
@param {Object} e The event object.
@param {Object} params The parameters object containing geometry information.
*/
function multipolygon(e, mapview, params) {
  if (params.geomType !== 'MultiPolygon') return;

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

  if (params.ringLength > 4) {
    params.content.push(mapp.utils.html`<li
    onclick=${() => removeVertex(e, mapview)}>
    ${mapp.dictionary.delete_vertex}`);
  }

  // Add the option to delete the polygon part to the popup content
  params.content.push(mapp.utils.html`<li
    onclick=${onclick}>
    ${mapp.dictionary.delete_polygon_part}`);

  function onclick() {
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
      params.geom.setCoordinates(remaining.map((p) => p.getCoordinates()));

      // Refresh the visual display
      mapview.interaction.source.clear();
      mapview.interaction.source.addFeature(mapview.interaction.Feature);

      mapview.interaction.interaction.dispatchEvent({
        type: 'modifyend',
        features: new ol.Collection([mapview.interaction.Feature]),
      });
    }
  }
}
