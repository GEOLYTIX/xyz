---
title: Templates
tags: [workspace]
layout: root.html
---

# Templates

The XYZ API uses templates for Views, Queries, and Layer.

Templates are available to all locales in a workspace.

Templates are **not** used in XYZ client applications.

Queries will never be sent as literal from client to host but may only be executed by [api/queries](/xyz/docs/develop/api/query/) *via* parameter reference.

Available templates may be examined with [api/workspace](/xyz/docs/develop/api/workspace/) methods.

Defining a template with the same key will overwrite a default template.

For example; The default MAPP Desktop view template can be set by defining a view template with the key `_desktop`.

```json
"_desktop": {
  "src": "https://api.github.com/repos/GEOLYTIX/public/contents/_desktop_wide.html"
}
```

Templates may be loaded as string from a valid [ressource link; "src"](/xyz/docs/workspace/workspaces/src).

## Template Literals

Templates may also be defined as literals.

```json
"global_cities_query": {
  "template": "select id, city_name, country from citiesoftheworld WHERE true ${viewport} limit 99;"
}
```

## Query Modules

Query templates may be compiled from string by way of literal or ressource link with `module` paramater flag set as true in the template definition:

```json
"pl_population": {
  "module": true,
  "src": "https://geolytix.github.io/public/mapp/layers/poland/pl_population.js"
}
```

Detailed information for query templates and modules are in the [api/workspace](/xyz/docs/develop/api/workspace/) developer documentation.