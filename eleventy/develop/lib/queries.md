---
title: Queries
tags: [develop]
layout: root.html
---

# Queries

SQL queries must never be sent directly from the client layer to the data source layer. For this reason queries can be cached as templates in the workspace.

## Params

The Query API will substitute template parameter with values received either in the payload of the request or as URL parameter.

With `viewport: true` the current **bounds** of the mapview will be sent as viewport params with the query. The bounds param is sent as an array [west, south, east, north, srid] to the query endpoint.

With `center: true` the current **lat**, **lng**, and **z** of the mapview will be sent as params with the query.

Common parameters to be sent with a query are **locale**, **layer**, **table**, **dbs**, and **id** (of location).

If provided the **queryparams** object will be assigned to the URL params object.