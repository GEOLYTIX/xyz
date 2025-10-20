/**
### /ui/layers/legends/categorized

The categorized theme legend module exports the categorizedTheme to the `ui.layers.legend{}` library object.

Dictionary entries:
- layer_style_switch_caption
- layer_style_switch_all
- layer_style_cluster

@requires /dictionary 

@requires /ui/elements/legendIcon
@requires /ui/elements/themeLegendSwitch

@module /ui/layers/legends/categorized
*/

/**
@function categorizedTheme

@description
The categorizedTheme method creates and returns a categorized theme legend for the current layer.style.theme.

@param {layer} layer The decorated mapp layer.

@returns {HTMLElement} The categorized theme legend element.
*/
export default function distributedTheme(layer) {
  const theme = layer.style.theme;

  theme.filterOnly ??= layer.style.filterOnly;

  theme.legend ??= {};

  theme.legend.grid = [];

  // If the theme does not have showLegend true, set theme.legend.node to null and return.
  if (!theme.showLegend) {
    theme.legend.node = mapp.utils.html.node`
    <div class="legend">
    </div>`;

    layer.style.legend ??= theme.legend.node;

    if (layer.style.legend) {
      layer.style.legend.replaceChildren(...theme.legend.node.children);
    }

    return theme.legend.node;
  }

  // Make 'left' default alignment.
  theme.legend.alignContents ??= 'left';
  if (!theme.legend.alignContents.includes('contents'))
    theme.legend.alignContents += ' contents';

  // Switch all control
  theme.legend.switch =
    theme.field && layer.filter && mapp.ui.elements.themeLegendSwitch();

  for (const key of Object.keys(theme.lookup || {})) {
    const cat = theme.lookup[key];
    cat.value = key;
    cat.label = key;

    mapp.ui.layers.legends.popLegend(cat, theme, layer);
  }

  // Attach row for cluster locations.
  if (layer.style.cluster) {
    // Create cluster icon.
    const icon = mapp.utils.html`
      <div
        style="height: 40px; width: 40px;">
        ${mapp.ui.elements.legendIcon({
          height: 40,
          icon: layer.style.cluster.icon,
          width: 40,
        })}`;

    // Create cluster label.
    const label = mapp.utils.html`
      <div
        class="label">
        ${mapp.dictionary.layer_style_cluster}`;

    // Push icon and label into legend grid.
    theme.legend.grid.push(mapp.utils.html`<div 
      data-id="cluster"
      class=${theme.legend.alignContents}>
      ${icon}${label}`);
  }

  const classList = `contents-wrapper ${theme.legend?.layout || 'grid'} ${
    theme.legend?.nowrap ? 'nowrap' : ''
  }`;

  // if nowrap is set, we need to allow overflow scroll in case of too many items
  const style = theme.legend?.nowrap ? 'overflow: scroll;' : '';

  theme.legend.node = mapp.utils.html.node`
    <div class="legend">
      ${theme.legend.switch || ''}
      <div class=${classList} style=${style}>
        ${theme.legend.grid}`;

  layer.style.legend ??= theme.legend.node;

  if (layer.style.legend) {
    layer.style.legend.replaceChildren(...theme.legend.node.children);
  }

  //Determine whether to show the legend based on layer.display
  if (theme.distribution === 'count') {
    const displayStyle = layer.display ? 'block' : 'none';

    //Hide distribution count themes on load.
    theme.legend.node.style.setProperty('display', displayStyle);

    //Set themes to show in style panel on layer show.
    layer.showCallbacks.push(() => {
      layer.style.legend.style.removeProperty('display');
      theme.meta_node?.style.removeProperty('display');
    });

    //Hide distribution count themes when the layer is hidden.
    layer.hideCallbacks.push(() => {
      //Only hide the distribution count theme legend.
      if (theme.key === layer.style.theme.key) {
        layer.style.legend.style.setProperty('display', 'none');
        theme.meta_node?.style.setProperty('display', 'none');
      }
    });

    //Set the legend display to match layer show.
    layer.style.legend.style.setProperty('display', displayStyle);

    //Hide/Show meta tag.
    theme.meta_node?.style.setProperty('display', displayStyle);

    return theme.legend.node;
  }

  //Display legend for other cases.
  layer.style.legend.style.removeProperty('display');

  return theme.legend.node;
}
