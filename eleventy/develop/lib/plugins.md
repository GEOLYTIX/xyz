---
title: Plugins
layout: root.html
---

# Plugins

The plugins script [lib/plugins](https://github.com/GEOLYTIX/xyz/tree/development/lib/plugins) allows to load a list of plugins defined in the [locale configuration of the workspace](/xyz/docs/workspace/locales/#plugins).

Plugins are loaded async as promises. The plugins method is a promise itself which will resolve once all plugins are loaded. The locale must be loaded prior to loading plugins. Layers should be loaded after plugins in order for layer plugins to be available when the layer is loaded.

```js
xyz.plugins()
  .then(() => xyz.layers.load())
  .then(() => mappUI())
  .catch(error => console.error(error))
```

Plugins are loaded from a source defined as the value of plugins configuration. The key being the name of the plugin which must match the custom event which is dispatched once the script tag is loaded into the document by the plugins method. The custom

```js
// MyPlugin_script.js
document.dispatchEvent(new CustomEvent('MyPlugin', {
  detail: _xyz => {

    // This is executed when the plugin is loaded.

  }
})
```

The plugin tag itself will be removed from the document once the plugin is loaded.

Plugins can be loaded from the [public/js/plugins](https://github.com/GEOLYTIX/xyz/tree/development/public/js/plugins) folder which is hosted as static files like so:

```js
// In a workspace locale
plugins: {
  MyPlugin: "/js/plugins/MyPlugin_script.js
}
```

It is possible to assign a named plugin method to the tabview, dataviews, locations, or layer `.plugins` object. The plugin will then be executed by passing either the tab, dataview, layer, or location object to the plugin method if the plugin is configured for the relevant object in the workspace configuration.

If assigned to the layers plugins the CustomStyle method would be called if the plugin is assigned in the layer configuration.

Layer plugins are called from the layer view method.

```js
// In layer configuration
"plugins": [
  "CustomStyle"
]

// In plugin script
document.dispatchEvent(new CustomEvent('MyPlugin', {
  detail: _xyz => {

    _xyz.layers.plugins.CustomStyle = async layer => {

      // My layer plugin code
    }
  }
})
```

It is also possible to modify existing library methods. The example below re-assigns the `.layers.view.create()` method. The original method will be called first within the new method. The function will short circuit if a custom property flag `clusterPanel` is not assigned to the layers object. Otherwise the code after the short circuit will execute.

``` js
document.dispatchEvent(new CustomEvent('cluster_panel', {
  detail: _xyz => {

    const createView = _xyz.layers.view.create

    _xyz.layers.view.create = layer => {

      createView(layer)

      if (!layer.clusterPanel) return

      // create a cluster panel in the layer view.
  }
}))
```