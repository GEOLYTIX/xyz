/**
### /ui/layers/legends/distributed

The distributed theme legend module exports the distributedTheme to the `ui.layers.legend{}` library object.

@requires /ui/layers/legends/utils

@module /ui/layers/legends/distributed
*/

import {
  catElement,
  clusterLegend,
  renderLegend,
  themeLegend,
} from './utils.mjs';

/**
The pendingRedraw WeakSet holds the layers for which a postrender listener to redraw the distributed legend is registered. Only a single listener must be registered for a layer, no matter how often the legend is drawn.
*/
const pendingRedraw = new WeakSet();

/**
The drawnValues WeakMap holds the number of category values for which the legend of a distributed theme was last drawn.
*/
const drawnValues = new WeakMap();

/**
@function distributedTheme

@description
The distributedTheme method creates and returns a distributed theme legend for the current layer.style.theme.

The category values are assigned by the distributed theme method as features are rendered. Only categories with values assigned from the layer data are drawn in the legend, and only the icons of these categories are created.

The legend is redrawn after a render only if values have been assigned to categories since the legend was last drawn.

@param {layer} layer The decorated mapp layer.

@returns {HTMLElement} The distributed theme legend element.
*/
export default function distributedTheme(layer) {
  //Apply filterOnly so the filtering action on the theme is only visual.
  layer.style.theme.filterOnly = true;
  const theme = layer.style.theme;

  themeLegend(theme);

  // If the legend is set to be hidden, exit the function.
  if (theme.hideLegend) return;

  theme.legend.grid = [];

  // For each category in the theme.categories array
  for (const cat of theme.categories) {
    cat.label = cat.values?.join(', ');

    // Only create a legend item if the category has a label defined
    // If no label, it means that category is not being used.
    if (cat.label !== undefined) {
      theme.legend.grid.push(catElement(cat, theme, layer));
    }
  }

  if (layer.style.cluster) {
    theme.legend.grid.push(clusterLegend(layer));
  }

  theme.legend.node = mapp.utils.html.node`
    <div class="legend">
      <div class=${theme.legend.classList}>
        ${theme.legend.grid}`;

  renderLegend(layer, theme.legend.node);

  drawnValues.set(theme, valuesCount(theme));

  redrawOnRender(layer, theme);

  return theme.legend.node;
}

/**
@function redrawOnRender

@description
The redrawOnRender method registers a single postrender listener for the layer. The legend is redrawn once the render is complete if values have been assigned to the theme categories since the legend was last drawn.

The listener is registered again after each render for as long as the distributed theme is the current layer theme.

@param {layer} layer The decorated mapp layer.
@param {Object} theme The distributed theme for which the legend was drawn.
*/
function redrawOnRender(layer, theme) {
  if (pendingRedraw.has(layer)) return;

  pendingRedraw.add(layer);

  layer.L.once('postrender', () => {
    pendingRedraw.delete(layer);

    // The theme may have been changed. A theme without a key would pass a comparison of theme keys.
    if (theme !== layer.style.theme) return;

    if (valuesCount(theme) === drawnValues.get(theme)) {
      redrawOnRender(layer, theme);
      return;
    }

    distributedTheme(layer);
  });
}

/**
@function valuesCount

@description
The valuesCount method returns the number of values assigned to the categories of a distributed theme.

@param {Object} theme The distributed theme.

@returns {number} The number of assigned category values.
*/
function valuesCount(theme) {
  return theme.categories.reduce(
    (count, cat) => count + (cat.values?.length || 0),
    0,
  );
}
