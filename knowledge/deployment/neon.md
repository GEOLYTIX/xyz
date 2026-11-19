---
type: Guide
title: Neon serverless Postgres
description: Create a PostGIS table on a hosted Neon database, connect it as a DBS_* connection and add an editable layer; use for a first database-backed layer.
tags: [deployment, database, postgis, neon, tutorial]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Neon-Serverless-Postgres
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: dbs
    resource: ../../apps/xyz/mod/utils/dbs.js
  - id: varlock
    resource: ../../varlock/README.md
  - id: style
    resource: ../../apps/mapp/lib/layer/styleParser.mjs
---
# Neon serverless Postgres

[Neon](https://neon.tech) hosts serverless Postgres with the PostGIS extension
and has a free tier. Any PostGIS database works the same way; for a local one
see the devdb in [local development](local-development.md#databases-and-authentication).[^wiki]

## 1. Create a project and enable PostGIS

Sign up at <https://console.neon.tech> (GitHub or Google sign-in) and create a
project. In the SQL Editor of the dashboard, create the extension:

```sql
create extension postgis;
```

## 2. Create a table with a spatial index

A serial `id` gives every location created through MAPP a unique id for
selection, see [layer data source](../workspace/layer/data-source.md):

```sql
create table locations (
  id serial not null primary key,
  geom geometry,
  name varchar,
  notes text
);

create index locations_geom on locations using gist (geom);
```

Add fields later with eg. `alter table locations add column number_field numeric;`.

## 3. Connect XYZ

Copy the connection string from **Dashboard → Connect to your database**. Drop
the leading `psql '`; the value starts with `postgresql://`. Each
[`DBS_<id>` variable](../environment/databases.md) creates the connection
`<id>`, so a layer with `"dbs": "NEON"` uses `DBS_NEON`:

```dotenv
DBS_NEON="postgresql://..."
```

How the variable reaches the process depends on the launch:

- `pnpm dev` runs through Varlock, which reads `.env`. Declare the variable in
  `.env.schema` as sensitive so Varlock redacts it from logs and responses:

  ```
  # @sensitive=true
  DBS_NEON=
  ```

  The Wiki said a variable missing from `.env.schema` is unavailable to the
  process. That was not checked against Varlock; declare it either way.[^varlock]
- A VS Code program launch of `apps/xyz/server.js` reads no `.env` unless it
  sets `envFile`; otherwise put the connection in its `env` block. See
  [running locally](running-locally.md#vs-code-launch-configurations).
- On Vercel, see [Vercel environment](vercel-environment.md). Keep the
  connection string in a secret store, not in `vercel.json`.

## 4. Add the layer

Add the layer to `locale.layers` of the workspace, or load it as a
[template](../workspace/templates.md). Users can draw polygons as new
locations and edit the name of a selected location:

```json
"locations": {
  "format": "geojson",
  "dbs": "NEON",
  "table": "locations",
  "srid": "4326",
  "geom": "geom",
  "qID": "id",
  "draw": { "polygon": true },
  "style": {
    "default": { "fillColor": "#d57120", "strokeColor": "#d57120" }
  },
  "infoj": [
    { "type": "geometry", "display": true, "field": "geom",
      "fieldfx": "ST_asGeoJSON(geom)", "edit": true },
    { "type": "pin", "label": "ST_PointOnSurface", "field": "pin",
      "fieldfx": "ARRAY[ST_X(ST_PointOnSurface(geom)),ST_Y(ST_PointOnSurface(geom))]" },
    { "title": "ID", "field": "id", "inline": true },
    { "title": "Name", "field": "name", "inline": true, "edit": true },
    { "title": "Notes", "field": "notes", "inline": true, "edit": true }
  ]
}
```

The Wiki added `notes` and `style.default` in a second step: without a
`style.default` the browser console logs a warning for the layer.[^style] The keys
are documented in [layer drawing](../workspace/layer/draw.md),
[feature styles](../workspace/layer/style/feature-style.md) and
[location infoj](../workspace/location/infoj.md). The layer edits data, so
restrict it to the intended [roles](../workspace/roles.md) before using it
beyond a trial.

[^wiki]: Wiki Neon-Serverless-Postgres page.
[^varlock]: varlock/README.md: new variables must be added to the env and schema.
[^style]: apps/mapp/lib/layer/styleParser.mjs warns when `style.default` is missing.
