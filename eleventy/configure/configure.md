---
title: Configure
tags: [configure, root]
layout: root.html

---

Instances can be configured by providing JSON object which defines locales, layer, and locations. This object can be provided as a file, from a connected PostgreSQL table, or via GitHub. The configuration object is referred to as workspace.

## Workspaces

A workspace is a configuration of services, locales, layers and locations which are used in a deployment.

Layers are defined within locales. A locale is defined by its extent \(bounds and zoom level\). A locale may have services itself. e.g. The gazetteer geolocation service.

Locations are defined by an InfoJ schema on the layer through which a location can be accessed.

**Workspaces are served from memory.** During startup a workspace will be loaded into memory from either a file or a PostgreSQL tables. A minimum configuration will be loaded into memory if no workspace is defined or if the backend is not able to parse a valid JSON document.

The workspace can be loaded through workspace admin views. The workspace admin views allow to upload workspace files and load the workspace into the instances memory.