---
title: Plugins
tags: [develop]
layout: root.html
---

# Library plugins

Script plugins may be used to extend the XYZ Library.

The xyz.plugins() method will create promises for [plugins which have been defined in the locale workspace](/xyz/docs/workspace/locales/plugins). The promise method will add an event listener and a script tag to the window object. The event listener function will pass the XYZ Library object to method which has been defined as the [custom event's detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail). Thereafter the event listener will remove itself as well as the script tag from the window document.

xyz.plugins() will return a promise which will be resolved after all plugin promises have been resolved. The script for the default Mapp views will add plugins prior to loading layers.

Plugin script must dispatch a custom event to the document. The event name must match the plugin key in the locale configuration.

The event detail can be a function which will receive the XYZ Library object. Additional library methods may be created or existing methods can be re-assigned. The example below re-assigns the xyz.layers.view.create() method. The original method will be called first within the new method. The function will short circuit if a custom property flag `clusterPanel` is not assigned to the layers object which must be passed to xyz.layers.view.create(). Otherwise a panel for the control of cluster layer properies will be added the layer view node. The full script is in [public/js/plugins](https://github.com/GEOLYTIX/xyz/tree/development/public/js/plugins).

```javascript
document.dispatchEvent(new CustomEvent('cluster', {
  detail: _xyz => {

    const createView = _xyz.layers.view.create

    _xyz.layers.view.create = layer => {

      createView(layer)

      if (!layer.clusterPanel) return

      // create a cluster panel in the layer view.
  }
}))
```