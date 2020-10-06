---
title: Plugins
tags: [workspace]
layout: root.html
---

# Plugins

The plugins object entry in the locale workspace configuration can be used to define which addon scripts should be loaded.

```json
"plugins": {
  "cluster": "/js/plugins/cluster.js"
}
```

The key must match the event name which is defined in the module code. The entry value defines the source for the script tag which added to the application window document.

Additional information in regard to building XYZ Library plugins can be found [here](/xyz/docs/develop/lib/plugins/).