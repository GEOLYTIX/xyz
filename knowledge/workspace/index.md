# Workspace configuration

Concepts own the workspace keys listed in their `x-xyz-keys` metadata. Look a
key up with `pnpm knowledge:find <key>`, eg. `pnpm knowledge:find layer.filter.default`.

`pnpm knowledge:schema` generates two JSON Schemas of workspaces from those
keys. Validate a generated workspace against
[workspace.strict.schema.json](workspace.strict.schema.json) before deploying:
it rejects keys no concept documents and missing required keys, except in
objects which merge a `template`. [workspace.schema.json](workspace.schema.json)
allows unknown keys, but still checks the JSON types, `enum` values and
patterns of documented keys. These are strict JSON constraints, so a value
the XYZ API coerces or ignores can still fail it.

- [Workspace and locales](locales.md) - Root keys, default and named locales, nested locales and layer defaults; the frame of every workspace.
- [Locale keys](locale/index.md) - View, extent, gazetteer and plugins of a locale.
- [Templates](templates.md) - Reusable layers and locales, SQL query templates and views.
- [Roles](roles.md) - Restricting locales, layers and entries to user roles, and role-specific configuration. See [fine-grained authorization](../security/fine-grained-authorization.md) for the overall model.
- [Layer keys](layer/index.md) - Keys of a layer object.
- [Dataviews](dataviews.md) - JSON, table and chart views of query results for a layer or location.
- [Location](location/index.md) - Location views: infoj entries, their types, display and editing.
- [Filter expressions](filter-expressions.md) - JSON filters turned into SQL conditions; use when writing a default or role filter.
