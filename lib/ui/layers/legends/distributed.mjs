/**
### /ui/layers/legends/distributed

The distributed theme legend module exports the distributedTheme to the `ui.layers.legend{}` library object.

Dictionary entries:
- layer_style_switch_caption
- layer_style_switch_all
- layer_style_cluster

@requires /dictionary 

@requires /ui/elements/legendIcon
@requires /ui/elements/themeLegendSwitch

@module /ui/layers/legends/distributed
*/

/**
@function distributedTheme

@description
The distributedTheme method creates and returns a distributed theme legend for the current layer.style.theme.

@param {layer} layer The decorated mapp layer.

@returns {HTMLElement} The distributed theme legend element.
*/
export default function distributedTheme(layer) {
  const theme = layer.style.theme;

  Object.keys(theme.lookup || {}).map((key) => {
    const cat = theme.lookup[key];
    cat.field ??= theme.field;
    cat.label ??= key;
    cat.value ??= key;

    return cat;
  });

  return mapp.ui.layers.legends.categorized(layer);
}
