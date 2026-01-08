/**
### /plugins/layer_order

This plugin alters initial layer creation order defined within locale.
Reusing existing templates may result in fixed layer ordering in the list. 
This plugin makes it possible to change ordering for custom context.

Enable the plugin by setting `locale.layer_order` definition with your preferred order of layer keys.
Keys missing from the layer_order array will move to the top. 
Here's an example:
```js
"my_locale": {
      "name": "My Locale",
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
  if (!mapview?.locale?.plugin?.length) return;
  mapview?.locale?.layers.sort(
    (a, b) => plugin.indexOf(a.key) - plugin.indexOf(b.key),
  );
}
