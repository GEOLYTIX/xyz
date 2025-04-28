/**
## /mapview/interactions/highlight

The module exports the highlight interaction method which is bound to a mapview in the [decorator]{@link module:/mapview~decorate} method.

@requires /location/get
@requires /location/nnearest
@requires /mapview/allFeatures

@module /mapview/interactions/highlight
*/

/**
@typedef {Object} interaction The highlight interaction object.
@property {Function} getFeature Method to return a feature from the highlight or click event methods.
@property {Function} longClickMethod Defaults to [mapview.allFeatures()]{@link module:/mapview/allFeatures}
@property {Number} longClickTimeout Timeout for the execution of the longClickMethod.
@property {Integer} longClickMS Milliseconds for longClickTimeout. Defaults to 500ms.
@property {Boolean} longClick Execute longClick method.
@property {Number} hitTolerance Pixel distance for detection of features on pixel. Defaults to 5pixel.
@property {Set} candidateKeys A set of candidate features under the cursor.
@property {Object} current The current highlighted feature.
@property {Function} Click The click method for the interaction. This will shortcircuit the getFeature method.
@property {Function} noLocationClick The noLocationClick method for the interaction, this is only ran if there is no current highlight interaction, and Click method is not available. This will shortcircuit the getFeature method.
@property {Boolean} clicked The click method was recently called.
*/

/**
@function highlight

@description
The highlight interaction method is bound to a mapview object [this].

The highlight interaction method will call the finish() method of the mapview.interaction before assigning a highlight interaction object as mapview.interaction.

The configuration params are spread into the interaction configuration overriding any of the defaults.

The highlight interaction works by assigning mousedown, touchstart, mouseup, and mouseleave events to the mapview.Map object.

The optional getLocation function property will be executed the [mapp.location.get()]{@link module:/location/get~get} method.

@param {object} params The params object is spread into the interaction defaults.
@property {Function} [getLocation] Will be executed after the getFeature method.
*/
export default function highlight(params) {
  const mapview = this;

  // Finish the current interaction.
  mapview.interaction?.finish();

  mapview.interaction = {
    candidateKeys: new Set(),

    candidates: {},

    finish,

    getFeature,

    hitTolerance: 5,

    layerFilter,

    longClickMethod: mapview.allFeatures,

    longClickMS: 500,

    // Filter for layers which have a highlight style.
    type: 'highlight',

    // Spread params argument.
    ...params,
  };

  // pointerMove will highlight features.
  mapview.Map.on('pointermove', pointerMove);

  // click will select the highlighted feature.
  mapview.Map.on('click', click);

  mapview.Map.getTargetElement().addEventListener('mousedown', mouseDown);

  mapview.Map.getTargetElement().addEventListener('touchstart', touchStart);

  mapview.Map.getTargetElement().addEventListener('mouseup', mouseUp);

  mapview.Map.getTargetElement().addEventListener('mouseleave', mouseleave);

  /**
  @function layerFilter

  @description
  The layerFilter method filters mapview layers with a qID.
  
  @param {Object} L Openlayers layer.
  */
  function layerFilter(L) {
    return Object.values(mapview.layers).some(
      (layer) => layer.qID && layer.L === L,
    );
  }

  /**
  @function mouseleave

  @description
  The mouseleave event method will be triggered when the cursor leaves the mapview.Map element.

  The method will empty the interaction.candidateKeys set and call the clear method.
  */
  function mouseleave() {
    // Reset candidateKeys Set
    mapview.interaction.candidateKeys = new Set();
    clear();
  }

  /**
  @function touchStart

  @description
  The touchStart event prevents the mouseDown event on touch input.
  */
  function touchStart(e) {
    e.preventDefault();
  }

  /**
  @function mouseDown

  @description
  The mouseDown event method enables the longClickMethod.

  The cursor is set to wait after the longClickTimeout event.

  The longClickTimeout is cleared in the pointerMove and click event methods.
  */
  function mouseDown() {
    // Short circuit the mouseDown event method if the longClickMethod is falsy.
    if (!mapview.interaction.longClickMethod) return;

    delete mapview.interaction.longClick;

    mapview.interaction.longClickTimeout &&
      clearTimeout(mapview.interaction.longClickTimeout);

    mapview.interaction.longClickTimeout = setTimeout(() => {
      mapview.interaction.longClick = true;
      mapview.Map.getTargetElement().style.cursor = 'wait';
    }, mapview.interaction.longClickMS);
  }

  /**
  @function mouseUp

  @description
  The mouseUp event method reset the cursor to auto.
  */
  function mouseUp() {
    mapview.Map.getTargetElement().style.cursor = 'auto';
  }

  /**
  @function pointerMove

  @description
  The pointerMove event method will clear the interaction.longClickTimeout number before assigning each feature intersecting with the event [pixel] location.

  Each feature is stored in the candidates object in the forEachFeatureAtPixel callback method.

  The interaction.layerFilter method is assigned as an option to filter feature from relevant feature layer.

  A candidate object consists of a key, the Openlayers layer object L, and the feature object F itself.

  The method checks whether a Set candidates objects keys is different from the interaction.candidateKeys set to determine whether the highlight feature has changed.

  The interaction.candidateKeys set will be cleared and the clear method is called if there are no candidate features.

  The method will shortcircuit if the are no candidates or the highlight stays the same.

  Otherwise a feature is chosen which is not in the interaction.candidateKeys set.

  The method will shortcircuit if the chosen feature key is the same as the interaction.current [feature] key.

  Otherwise the clear method is called and the feature is assigned as the interaction.current thereafter.

  The pointerMove method will be called from a touch click event in order to select features on a touch screen. However there is no cursor and the highlight style should not be applied nor should the hover method be called. The pointerMove method will shortcircuit if called with a touch event.

  Otherwise the cursor will check to a pointer if selection is possible.

  The feature will be passed as argument to a feature.layer.hover method.

  Finally the layer.L change event will be called to trigger the featureStyle render.

  @param {Object} e The pointerMove event.
  @property {Object} e.pixel The pixel object for the current pointer location.
  */
  function pointerMove(e) {
    // Clear longClick timeout.
    mapview.interaction.longClickTimeout &&
      clearTimeout(mapview.interaction.longClickTimeout);

    const candidates = {};

    const callback = (F, L) => {
      // get layerKey from key property or ol object L Uid.
      const layerKey = L.get('key') || ol.util.getUid(L);

      // get featureID from id property, getId method or ol object F Uid.
      const featureID = F.get('id') || F.getId() || ol.util.getUid(F);

      // Compose candidate key from layerKey and featureID.
      const key = `${layerKey}!${featureID}`;

      candidates[key] = { F, key, L };
    };

    const options = {
      hitTolerance: mapview.interaction.hitTolerance,
      layerFilter: mapview.interaction.layerFilter,
    };

    mapview.Map.forEachFeatureAtPixel(e.pixel, callback, options);

    if (!Object.keys(candidates).length) {
      // There is no candidate to highlight.
      mapview.interaction.candidateKeys.clear();
      clear();
      return;
    }

    if (
      mapp.utils.areSetsEqual(
        mapview.interaction.candidateKeys,
        new Set(Object.keys(candidates)),
      )
    ) {
      // The highlight hasn't changed.
      return;
    }

    // Find feature from key which is not in candidates set.
    const feature =
      candidates[
        Object.keys(candidates).find(
          (key) => !mapview.interaction.candidateKeys.has(key),
        )
      ] ||
      // Or assign candidate from first key
      (mapview.interaction.current?.key &&
        candidates[mapview.interaction.current?.key]) ||
      candidates[Object.keys(candidates)[0]];

    // Assign new Set of candidate keys to mapview.interaction.
    mapview.interaction.candidateKeys = new Set(Object.keys(candidates));

    // Return if feature is current.
    if (mapview.interaction.current?.key === feature.key) return;

    // Clear highlight before assigning feature.
    clear();

    // Assign feature.layer from mapview.layer
    feature.layer = mapview.layers[feature.L.get('key')];

    // Assign feature.id from id property or getId method.
    feature.id = feature.F.get('id') || feature.F.getId();

    // Required for featureStyle() styling of highlight feature.
    feature.layer.highlight = feature.id;

    // Assign feature as current.
    mapview.interaction.current = feature;

    if (e.originalEvent.pointerType !== 'mouse') {
      // The pointMove() method maybe called from touch/click event.
      e.type !== 'pointermove' && mapview.interaction.getFeature(feature);

      // Touch events should not highlight style features or call hover method since there is no cursor.
      clear();
      return;
    }

    if (feature.layer.infoj) {
      // Change cursor if the highlight is selectable.
      mapview.Map.getTargetElement().style.cursor = 'pointer';
    }

    if (typeof feature.layer.style?.hover?.method === 'function') {
      // Execute hover method assigned to the current feature layer.
      feature.layer.style.hover.method(feature.F, feature.layer);
    }

    mapview.interaction.current.layer.L.changed();
  }

  /**
  @function click

  @description
  The click() method is assigned to the mapview.Map element click event listener.
  The method will reset the cursor and check for execution of the interaction.longClickMethod.

  The method is debounced to 600ms with interaction.clicked flag.

  The pointerMove method will be called with the click event [location] to get a feature without a cursor.

  The interaction.Click method will be called if it exists. This will shortcircuit the getFeature method.

  The interaction.noLocationClick method will be called if no current location is available.

  Otherwise the interaction.current feature is passed to the interaction.getFeature method.

  @param {Object} e The calling event.
  */
  function click(e) {
    // Reset cursor.
    mapview.Map.getTargetElement().style.cursor = 'auto';

    clearTimeout(mapview.interaction.longClickTimeout);

    if (mapview.interaction.longClick) {
      mapview.interaction.longClickMethod(e, mapview);
      return;
    }

    // Limit click event to 600ms
    if (mapview.interaction.clicked) return;

    mapview.interaction.clicked = setTimeout(() => {
      mapview.interaction.clicked = null;
    }, 600);

    // There is no current highlighted feature without pointerMove.
    // Simulate pointermove on the touch click coordinates.
    if (e.originalEvent.pointerType === 'touch') {
      mapview.interaction.candidateKeys = new Set();
      e.type = 'touchClick';
      pointerMove(e);
      return;
    }

    // Remove any existing popup. e.g. Cluster select dialogue.
    mapview.popup(null);

    // if there's a mapview.interaction.Click method, execute it.
    if (typeof mapview.interaction.Click === 'function') {
      // Execute the Click method
      mapview.interaction.Click(e);
      return;
    }

    // if there's a mapview.interaction.noLocationClick method
    if (
      !mapview.interaction.current &&
      typeof mapview.interaction.noLocationClick === 'function'
    ) {
      // Execute the noLocationClick method
      mapview.interaction.noLocationClick(e);
      return;
    }

    // Get the feature from the current highlight.
    if (mapview.interaction.current) {
      mapview.interaction.getFeature(mapview.interaction.current);
    }
  }

  /**
  @function clear

  @description
  The clear method will clear the current feature and shortcircuit if there is no current feature.

  The infotip object [eg. hover] will be removed.

  The cursor will be reset.

  The layer.L change event will be called to trigger the featureStyle render.
  */
  function clear() {
    // Highlight has already been cleared.
    if (!mapview.interaction.current) return;

    mapview.infotip(null);

    mapview.Map.getTargetElement().style.cursor = 'auto';

    // Prevent highlight render.
    delete mapview.interaction.current.layer.highlight;

    mapview.interaction.current.layer.L.changed();

    // Delete the current highlight feature after render.
    // The [feature] current.layer object is required for the featureStyle render.
    delete mapview.interaction.current;
  }

  /**
  @function getFeature

  @description
  The getFeature method deals with cluster features.

  A dialog to select a cluster feature will be presented.

  The interaction.getFeature method can be overwritten in the params passed to the highlight interaction.

  The nnearest method is called for cluster features which are not created from a vector source.

  @param {Object} feature The feature to get.
  */
  function getFeature(feature) {
    // Get the properties of the current highlight feature.
    const featureProperties = feature.F.getProperties();

    // The feature is a cluster feature.
    if (featureProperties.count > 1) {
      const features = feature.F.get('features');

      // Features are clustered in source.
      if (Array.isArray(features)) {
        // Get list of cluster feature label and id.
        const featuresList = features.map((F) => {
          const featureProperties = F.getProperties();
          return {
            id: featureProperties.id,
            label: featureProperties[feature.layer.cluster?.label],
          };
        });

        // Create list for cluster features.
        const list = featuresList.map(
          (li) => mapp.utils.html.node`<li
          onpointerup=${(e) => {
            mapview.popup(null);
            mapp.location.get({
              id: li.id,
              layer: feature.layer,
              table: feature.layer.table || feature.layer.tableCurrent(),
            });
          }}>${li.label || li.id}`,
        );

        const content = mapp.utils.html.node`<ul class="list">${list}`;

        // Display the popup to select cluster feature.
        mapview.popup({
          autoPan: true,
          content,
          coords: feature.F.getGeometry().getCoordinates(),
        });

        return;
      }

      // Features are not clustered in source.
      mapp.location.nnearest({
        feature: feature.F,
        layer: feature.layer,
        mapview,
        table: feature.layer.table || feature.layer.tableCurrent(),
      });
      return;
    }

    // Get feature location.
    mapp.location.get({
      id: feature.id,
      layer: feature.layer,
      table: feature.layer.table || feature.layer.tableCurrent(),
    });
  }

  /**
  @function finish

  @description
  The [highlight] interaction will be cleared.
  
  Any popup will be removed from mapview.

  Event listener will be removed the mapview.Map element.
  */
  function finish() {
    // Clear must be called before interaction is nulled.
    clear();

    // Remove popup from mapview.
    mapview.popup(null);

    // Remove event listener from mapview.
    mapview.Map.un('pointermove', pointerMove);
    mapview.Map.un('click', click);
    mapview.Map.getTargetElement().removeEventListener('mousedown', mouseDown);
    mapview.Map.getTargetElement().removeEventListener(
      'touchstart',
      touchStart,
    );
    mapview.Map.getTargetElement().removeEventListener('mouseup', mouseUp);
    mapview.Map.getTargetElement().removeEventListener(
      'mouseleave',
      mouseleave,
    );

    mapview.interaction.callback?.();
  }
}
