---
type: Guide
title: Terminology
description: The terms used across XYZ, MAPP and the workspace, each with a short definition and the concept that owns it; use when a word in an issue, workspace or concept is unclear.
tags: [terminology, glossary]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Terminology/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - resource: ../apps/mapp/lib/mapp.mjs
  - resource: ../apps/ui/lib/ui.mjs
  - resource: ../apps/xyz/router.js
---
# Terminology

## Applications

- **XYZ** - The Node.js API in `apps/xyz`. It serves views, workspaces,
  queries and users; see [XYZ API](architecture/xyz-api.md).
- **MAPP** - The browser library in `apps/mapp`, the `mapp` global. It
  creates mapviews, layers and locations on OpenLayers; see
  [MAPP](architecture/mapp.md).
- **MAPP.UI** - The interface library in `apps/ui`, `mapp.ui`: panels,
  location views, dataviews and ui plugins; see [MAPP.UI](architecture/mapp-ui.md).
- **Monorepo** - The pnpm workspace with the apps `xyz`, `mapp`, `ui`,
  `auth` and `saml` and the `devdb`, `testhost` and `testview` packages;
  see [monorepo](architecture/monorepo.md).
- **OpenLayers** - The open source map library MAPP is built on, loaded as
  the `ol` global before MAPP.

## Workspace

- **Workspace** - The JSON which defines the templates, locales and layers
  of an XYZ instance; see [workspace and locales](workspace/locales.md).
- **Locale** - The configuration of one mapview: its view, extent, plugins
  and layers. A workspace has many locales; a mapview loads one. Locales can
  be nested.
- **Template** - A reusable entry in `workspace.templates`: a layer or
  locale to merge, a SQL query, or an HTML view; see
  [templates](workspace/templates.md).
- **Query template** - SQL with `${name}` identifiers and `%{name}` values,
  run by the query API. Requests name it; they never send SQL.
- **View template** - An HTML page served by the [view API](views/view-api.md).
- **Language template** - A template with one value per language code; see
  [language](views/language.md).
- **Role** - A name in a user's roles which unlocks locales, layers,
  templates and entries; see [roles](workspace/roles.md).
- **Plugin** - A function in `mapp.plugins` run by a locale or layer key of
  its name; see [plugins](plugins.md).

## Map

- **Mapview** - A map in a view: an OpenLayers `Map` with the locale, its
  layers and locations. A locale is required to create one; see
  [custom views](views/custom-views.md).
- **View, viewport** - The view is the map centre and zoom (`lat`, `lng`,
  `z`); the viewport is the visible extent; see [locale view](workspace/locale/view.md).
- **Extent** - A bounding box (`north`, `east`, `south`, `west`) which limits
  the map or a query.
- **SRID** - The EPSG code of a coordinate system, eg. `4326` for longitude
  and latitude, `3857` for the web map projection.
- **Layer** - Features from one data source shown on a mapview. The **JSON
  layer** is its configuration in the workspace; the **mapview layer** is
  the object MAPP decorates from it; see [layer keys](workspace/layer/index.md).
- **Format** - How a layer gets its features: `wkt`, `geojson`, `mvt`,
  `cluster`, `tiles`, `maplibre` and others; see [layer formats](workspace/layer/formats.md).
- **MVT** - Mapbox Vector Tiles, a tiled vector format the XYZ API generates
  from PostGIS. `mvt_cache` tile tables are no longer used.
- **Feature** - An OpenLayers object with a geometry and properties.
- **Geometry, geom** - The shape of a feature. `geom` names the geometry
  column of a layer table; see [data source](workspace/layer/data-source.md).
- **Cluster** - Several nearby point features drawn as one; see
  [cluster](workspace/layer/cluster.md).
- **Theme** - Styles by a field value: categorized, graduated or
  distributed; see [themes](workspace/layer/style/themes.md).
- **Filter** - Conditions which limit the features of a layer; see
  [layer filter](workspace/layer/filter.md) and
  [filter expressions](workspace/filter-expressions.md).
- **Gazetteer** - The search box which finds places and locations; see
  [gazetteer](workspace/locale/gazetteer.md).
- **Dataview** - A JSON view, table or chart of query results for a layer
  or location; see [dataviews](workspace/dataviews.md).
- **Tabview** - The tab bar below the map in the default view, a dataview
  target.

## Location

- **Location** - One selected feature with its record, shown in a location
  view; see [location infoj](workspace/location/infoj.md).
- **qID** - The unique ID column of a layer table. Locations are requested
  by it; new locations need a serial or default value.
- **infoj** - The array of entries which defines a location view.
- **Entry** - One item of an infoj: a field, a group title, a dataview, a
  geometry and more; see [entry types](workspace/location/entry-types.md).

## Views and URLs

- **View** - An HTML page which loads MAPP and builds mapviews, eg. the
  default view or a report; see [views](views/index.md).
- **Hooks** - URL params kept in `mapp.hooks.current`, which restore a map
  from a link; see [URL hooks](views/url-hooks.md).
- **Dictionary** - The interface texts of one language; see
  [language](views/language.md).

## Access

- **ACL** - The PostgreSQL table of users, set by `PUBLIC` or `PRIVATE`;
  see [user accounts](security/accounts.md).
- **SAML, SSO** - Single sign-on with an identity provider through the
  `saml` app; see [authentication](security/authentication.md).
- **Token** - A signed key which authenticates a request instead of a
  cookie, eg. an API key.

## General

- **Key, value** - In `{ "foo": "bar" }`, `foo` is a key and `bar` its value.
- **Root** - The first level of an object; a nested key is inside another
  key's object.
- **Flag** - A boolean key, eg. `"display": true`.
- **Interpolation** - Replacing `${name}` placeholders in a string, used in
  query templates and `src` URLs.

The Wiki defined **MVT clone**, an MVT layer themed from a lookup; the
`mvt_clone` entry type is now a legacy alias of `layer`. Its **MVT cache**
and **GraphHopper** entries are not part of the core.
