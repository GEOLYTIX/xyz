# Workspace configuration

Concepts own the workspace keys listed in their `x-xyz-keys` metadata. Look a
key up with `pnpm knowledge:find <key>`, eg. `pnpm knowledge:find layer.filter.default`.

`pnpm knowledge:schema` generates two JSON Schemas of workspaces from those
keys. Validate a generated workspace against
[workspace.strict.schema.json](workspace.strict.schema.json) before deploying:
it rejects keys no concept documents and missing required keys, except in
objects which merge a `template`. [workspace.schema.json](workspace.schema.json)
accepts every workspace the XYZ API accepts and only reports unknown keys.

- [Workspace and locales](locales.md) - Root keys, default and named locales, nested locales and layer defaults; the frame of every workspace.
- [Locale keys](locale/index.md) - View, extent, gazetteer and plugins of a locale.
- [Templates](templates.md) - Reusable layers and locales, SQL query templates and views.
- [Roles](roles.md) - Restricting locales, layers and entries to user roles, and role-specific configuration.
- [Layer keys](layer/index.md) - Keys of a layer object.
- [Dataviews](dataviews.md) - JSON, table and chart views of query results for a layer or location.
- [Location](location/index.md) - Location views: infoj entries, their types, display and editing.
- [Filter expressions](filter-expressions.md) - JSON filters turned into SQL conditions; use when writing a default or role filter.
