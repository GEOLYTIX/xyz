/**
### map.layer.featureStlye()
This module exports a style function for a layer
@module /layer/featureStyle
*/

/**
Creates a style function for a layer.
@function featureStyle
@description
Returns a style function for OL vector layers.

@param {Object} layer The layer object.
@property {layer-style} layer.style The layer style config.
@property {Boolean} [style.cache] The feature style should be retrieved from the feature 'Styles' property.

@returns {function} The style function for the layer.
*/
export default function featureStyle(layer) {
  /**
  @function Style
  @description
  Style functions process [vector] features and return an OL style to the layer render.
  */

  return function Style(feature) {
    // Style caching must be enabled with flag.
    if (layer.style.cache === true) {
      // Check for and return existing Styles object.
      const Styles = feature.get('Styles');

      if (Styles) return Styles;
    }

    // Assign feature properties.
    featureProperties(feature);

    if (feature.properties === null) {
      // The feature will not be visible.
      return null;
    }

    // Set style.default as feature.style.
    feature.style = layer.style.default;

    if (Object.hasOwn(mapp.layer.themes, layer.style.theme?.type)) {
      // Apply theme style to style object.
      mapp.layer.themes[layer.style.theme?.type]?.(layer.style.theme, feature);
    }

    // The feature must not be displayed.
    if (feature.style === null) return;

    // Style cluster point features.
    clusterStyle(feature);

    // Assign highlight style if required.
    highlightStyle(feature);

    // Assign label style if required.
    labelStyle(feature);

    // Assign selected style if required.
    selectedStyle(feature);

    // IconScalingStyle will scale icons based on the feature properties
    iconScalingStyle(feature);

    return mapp.utils.style(feature.style, feature);
  };

  /**
  @function featureProperties
  @description
  Assigns feature properties based on layer configuration.

  @param {Object} feature The feature object.
  */
  function featureProperties(feature) {
    feature.properties = feature.getProperties();

    if (
      layer.featureSet?.size &&
      !layer.featureSet.has(feature.properties.id)
    ) {
      feature.properties = null;
      return;
    }

    // Assign MVT feature properties from the layer featuresObject.
    if (layer.featuresObject) {
      if (Object.hasOwn(layer.featuresObject, feature.properties.id)) {
        Object.assign(
          feature.properties,
          layer.featuresObject[feature.properties.id],
        );
      } else {
        feature.properties = null;
        return;
      }
    }

    // Check whether feature is in lookup.
    if (Array.isArray(layer.featureLookup)) {
      // Find feature with matching ID property in the featureLookup
      const lookupFeature = layer.featureLookup.find(
        (f) => f[layer.featureLookupId || 'id'] === feature.properties.id,
      );

      // Do not style features not found in the lookup array.
      if (!lookupFeature) {
        feature.properties = null;
        return;
      }

      // Assign feature.properties from the lookupFeature for subsequent styling
      Object.assign(feature.properties, lookupFeature);
    }

    // Geojson / WKT features may have a properties property
    if (feature.properties?.properties) {
      // This shouldn't happen anymore.
      console.warn(`Feature with properties.properties`);
      Object.assign(feature.properties, feature.properties.properties);
      delete feature.properties.properties;
    }
  }

  /**
  @function clusterStyle
  @description
  Applies cluster style to the feature based on layer configuration.

  @param {Object} feature - The feature object.
  */
  function clusterStyle(feature) {
    if (!feature.properties?.count) return;

    if (feature.properties.count === 1) return;

    if (!layer.style.cluster) return;

    const clusterScale = parseFloat(layer.style.cluster.clusterScale);

    // Spread cluster style into feature.style.
    feature.style = {
      ...feature.style,
      ...layer.style.cluster,
    };

    // Cluster icons will NOT scale different to single locations if the clusterScale is not set in the cluster style.
    if (clusterScale) {
      // The clusterScale will be added to the icon scale.
      feature.style.clusterScale = layer.style.cluster.logScale
        ? // A natural log will be applied to the cluster scaling.
          (Math.log(clusterScale) / Math.log(layer.cluster?.max_size)) *
          Math.log(feature.properties.size || feature.properties.count)
        : // A fraction of the icon clusterScale will be added to the items scale for all but the biggest cluster location.
          1 +
          (clusterScale / layer.cluster?.max_size) *
            (feature.properties.size || feature.properties.count);
    }

    // Setting a zoomInScale will INCREASE the scale of icons on higher zoom levels.
    if (layer.style.cluster.zoomInScale) {
      feature.style.zoomInScale =
        layer.style.cluster.zoomInScale * layer.mapview.Map.getView().getZoom();
    }

    // Setting a zoomOutScale will DECREASE the scale of icons on higher zoom levels.
    if (layer.style.cluster.zoomOutScale) {
      feature.style.zoomOutScale =
        layer.style.cluster.zoomOutScale /
        layer.mapview.Map.getView().getZoom();
    }
  }

  /**
  @function highlightStyle
  @description
  Applies highlight style to the feature based on layer configuration.

  @param {Object} feature The feature object.
  */
  function highlightStyle(feature) {
    // Layer must have a highlight style.
    if (!layer.style.highlight) return;

    // Layer must have a highlighted feature stored as layer.highlighted.
    if (!layer.highlight) return;

    // The layer.highlight must be a match for the feature ID.
    if (layer.highlight !== (feature.get('id') || feature.getId())) return;

    feature.style = {
      ...feature.style,
      ...layer.style.highlight,
    };
  }

  /**
  @function labelStyle
  @description
  Applies label style to the feature based on layer configuration.

  @param {Object} feature The feature object.
  */
  function labelStyle(feature) {
    // A feature requires properties to create a label.
    if (!feature.properties) return;

    // Only styled features can be labelled.
    if (!feature.style) return;

    // The label must be displayed.
    if (!layer.style.label?.display) {
      delete feature.style.label;
      return;
    }

    feature.style.label = structuredClone(layer.style.label);

    // Assign count value as text if label.count is truthy.
    feature.style.label.text =
      (feature.style.label.count &&
        feature.properties.count > 1 &&
        feature.properties.count) ||
      undefined;

    feature.style.label.text ??=
      feature.properties[feature.style.label.field] || feature.properties.label;

    // Delete style.label if minZoom exceeds current zoom.
    feature.style.label?.minZoom > layer.mapview.Map.getView().getZoom() &&
      delete feature.style.label;

    // Delere style.label if current zoom exceeds maxZoom.
    feature.style.label?.maxZoom < layer.mapview.Map.getView().getZoom() &&
      delete feature.style.label;
  }

  /**
  @function selectedStyle
  @description
  Applies selected style to the feature based on layer configuration.

  @param {Object} feature The feature object.
  */
  function selectedStyle(feature) {
    // Return before lookup in mapview.locations object.
    if (layer.style.selected === undefined) return;

    // Check whether the feature referenced in mapview.locations
    if (layer.mapview?.locations[`${layer.key}!${feature.properties.id}`]) {
      feature.style = layer.style.selected;
    }
  }

  /**
  @function iconScalingStyle
  @description
  Applies the icon scale based on the value of the field supplied in layer.style.icon_scaling.field

  @param {Object} feature The feature object.
  */
  function iconScalingStyle(feature) {
    if (!layer.style.icon_scaling?.field) return;

    let fieldValue = Number(feature.properties[layer.style.icon_scaling.field]);

    if (feature.properties.features?.length > 1) {
      // Do not scale cluster feature icons.
      if (!layer.style.icon_scaling.cluster) return;

      fieldValue = 0;

      feature.properties.features.forEach((f) => {
        // Add field value of each feature in cluster.
        fieldValue += Number(f.getProperties()[layer.style.icon_scaling.field]);
      });

      if (layer.style.icon_scaling.cluster === 'avg') {
        // Average fieldValue by dividing the cluster size.
        fieldValue /= feature.properties.features.length;
      }
    }

    if (isNaN(fieldValue)) return;

    // fieldValue cannot be negative, so we will set it to 0 (no scaling).
    // This is to prevent negative scaling which would shrink the icon.
    if (fieldValue < 0) fieldValue = 0;

    const factor =
      layer.style.icon_scaling.scaleFactor || layer.style.icon_scaling.max || 1;

    // fieldScale must be bigger than 1 to prevent shrinking.
    feature.style.fieldScale = 1 + fieldValue / factor;
  }
}
