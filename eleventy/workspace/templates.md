---
title: Templates
tags: [workspace]
layout: root.html
---

# Templates

The XYZ APIs use templates for Views, Queries, and Layer. Each template will have a render method which substitutes parameter in the template with values.

Default templates for common queries, as well as the MAPP and admin views are applied when the workspace is cached. It is possible to override the default templates by defining a template with the same key in the workspace configuration.

Following view template would override the default MAPP desktop view with a custom view where the initial width of the control panel is increased. The default view will be loaded from a public GitHub repository.

```json
"_desktop_": {
  "src": "https://api.github.com/repos/GEOLYTIX/public/contents/_desktop_wide.html"
}
```

Templates are useful for queries which can be shared across layers, locales or apps.
The example above uses a template hosted with Github. For simple content templates can use explicit statements:

```json
"global_cities_query": {
	"template": "select id, city_name, country from citiesoftheworld WHERE true ${viewport} limit 99;"
}
```

Templates can be imported as modules in order to include functions of parameters:

```json
"pl_population": {
	"type": "module", // or "module": true
	"src": "https://geolytix.github.io/public/mapp/layers/poland/pl_population.js"
}
```

The template above can be shared across layers since query parameters are substituted with current layer properties.

