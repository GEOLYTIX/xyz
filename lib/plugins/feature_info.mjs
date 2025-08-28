/**
## /plugins/feature_info

The feature_info plugin module exports the feature_info plugin method.

Dictionary entries:
- toolbar_current_location

@requires /dictionary
@requires /mapview/interactions/highlight
@requires /mapview/popup

@module /plugins/feature_info
*/

/**
@function feature_info
@description
The feature_info plugin method adds a button to the #mapButton element to call the toggleFeatureInfoHighlight method.

The plugin param will turned into an object if configured as true in the locale.

@param {Object} plugin The plugin config object from the locale.
@param {mapview} mapview The mapview for the highlight feature info interaction.
*/
export function feature_info(plugin, mapview) {
  const btnColumn = mapview.mapButton;

  if (!btnColumn) return;

  if (plugin === true) {
    plugin = {};
  }

  plugin.btn = mapp.utils.html.node`<button
    title=${mapp.dictionary.feature_info}
    data-id="feature_info"
    onclick=${() => toggleFeatureInfoHighlight(plugin, mapview)}>
    <span class="notranslate material-symbols-outlined">left_click`;

  btnColumn.append(plugin.btn);
}

/**
@function toggleFeatureInfoHighlight
@description
The meathod will toggle a highlight interaction with a custom getFeature callback method.

The getFeature method will log the feature properties to the dev console and create a mapview popup with the stringified feature properties object in a pre-code block.

@param {Object} plugin The plugin config object from the locale.
@param {mapview} mapview The mapview for the highlight feature info interaction.
@property {boolean} [plugin.features] Include the cluster features[] label in the output.
@property {string} [plugin.css] The css for the content element passed to the mapview popup.
*/
function toggleFeatureInfoHighlight(plugin, mapview) {
  // Toggle will return true if class is added.
  if (plugin.btn.firstElementChild.classList.toggle('active')) {
    mapview.interactions.highlight({
      callback: () => {
        plugin.btn.firstElementChild.classList.remove('active');
      },
      getFeature: (feature) => {
        const featureProperties = feature.F.getProperties();

        // The OL Styles array is meaningless for the feature_info popup.
        delete featureProperties.Styles;

        delete featureProperties.geometry;

        // Check for cluster feature.
        if (Array.isArray(featureProperties.features)) {
          // Reduce features to length or properties dependent on the flag.
          featureProperties.features = plugin.features
            ? featureProperties.features.map(
                (F) => F.getProperties()[feature.layer.cluster.label],
              )
            : featureProperties.features.length;
        }

        console.log(feature.F);

        const feature_info = {
          id: feature.id,
          layer: feature.layer.key,
          properties: featureProperties,
        };

        plugin.css ??= 'padding: 1em; max-width: 250px; overflow: auto;';

        const content = mapp.utils.html.node`<pre
          style=${plugin.css}
          >${JSON.stringify(feature_info, undefined, 2)}`;

        mapview.popup({
          content,
        });
      },
    });
  } else {
    // Will finish the feature_info highlight method.
    mapview.interactions.highlight();
  }
}
