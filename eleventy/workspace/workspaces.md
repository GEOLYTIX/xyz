---
title: Workspace
tags: [workspace, root]
layout: root.html
orderPath: /workspace/_workspaces
---

# XYZ Workspace

The XYZ workspace is a compiled configuration object. The workspace is available to most XYZ APIs as well as the XYZ library once requested from the Workspace API.

The workspace is seperated into templates and locales.

**Templates** maybe markup, script, or queries which can be rendered by either the XYZ View or Query APIs to extend the functionality of the XYZ API and Library.

**Locales** define a region to be loaded by the XYZ Library. A locale is defined by its bounds, layers and their location schemas, as well as configurations for requests to the Gazetteer API.

**Layers** are configuration objects used as input parameter to create layer objects in the XYZ control library. Layers are comprised of **locations** as defined in the layer's InfoJ schema. Either layers or locations may have associated **dataviews** in their configuration.