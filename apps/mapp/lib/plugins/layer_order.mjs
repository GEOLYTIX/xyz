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
@module /plugins/layer_order
*/

/**
@function layer_order

@description
The function sorts mapview.locale.layers based on the order specified in layer_order array.
It accesses each layer key and checks its index in the layer_order array.

Layers are added to the map in the order of the layers array with an increasing zIndex, so a layer later in the array is drawn on top. A layer with a key which is not referenced in the layer_order array is sorted to the end of the array and drawn on top.
@param {Array} plugin An array listing layers to be reordered.
@param {Object} mapview The mapview object
*/
export function layer_order(plugin, mapview) {
  if (!Array.isArray(plugin)) return;

  // An unreferenced key returns -1 from indexOf and must sort to the end, so the layer is drawn on top.
  // plugin.length is past every referenced index, and two unreferenced layers compare as 0 so the stable sort keeps their order.
  const order = (layer) => {
    const index = plugin.indexOf(layer.key);
    return index === -1 ? plugin.length : index;
  };

  mapview?.locale?.layers?.sort((a, b) => order(a) - order(b));
}
