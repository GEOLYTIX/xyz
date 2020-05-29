---
title: SQL injections
tags: [develop]
layout: root.html

---

All queries to the PostgreSQL database are parsed through the node-postgres module. [Queries](https://node-postgres.com/features/queries) use a battle-tested parameter substitution code.

Parameter are also checked against the workspace which is loaded into the backend process memory. Requests with parameter not found in the workspace result in a [406](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/406) response.