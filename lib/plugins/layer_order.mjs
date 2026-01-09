/**
### /plugins/layer_order

The plugin sorts the mapview.locale.layers[] array according to the order of layer object keys in the layer_order locale property.

Layer with keys not referenced in the layer order will be on top.

```js
"layer_order": [
  "urban_areas",
  "admin",
  "retail_places"
]
```
@module plugins/layer_order
*/

/**
@function layer_order

@description
The function sorts mapview.locale.layers based on the order specified in layer_order array.
It accesses each layer key and checks its index in the layer_order array.
@param {Array} plugin An array listing layers to be reordered.
@param {Object} mapview The mapview object
*/
export function layer_order(plugin, mapview) {
  if (!Array.isArray(plugin)) return;
  mapview?.locale?.layers.sort(
    (a, b) => plugin.indexOf(a.key) - plugin.indexOf(b.key),
  );
}
