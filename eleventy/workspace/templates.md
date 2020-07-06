---
title: Templates
tags: [workspace]
layout: root.html
---

# Templates

The XYZ APIs use templates for Views, Queries, and Layer. Each template will have a render method which substitutes parameter in the template with values.

Default templates for common queries, as well as the MAPP and admin views are applied when the workspace is cached. It is possible to override the default templates by defining a template with the same key in the workspace configuration.

Following view template would override the default MAPP desktop view with a custom view where the initial width of the control panel is increased. The default view will be loaded from a public GitHub repository.

```
"_desktop_": {
  "src": "https://api.github.com/repos/GEOLYTIX/public/contents/_desktop_wide.html"
}
```