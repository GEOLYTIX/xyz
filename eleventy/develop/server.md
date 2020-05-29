---
title: Server
tags: [develop]
layout: root.html

---

Running [server.js](https://github.com/GEOLYTIX/xyz/blob/master/server.js) as a node will initialise a [Fastify](https://www.fastify.io/) web server.

The startup procedure is as follows.

1. Inspect the environment settings provided to the process.
2. Setup node-postgres connection pools.
3. Load workspace into memory.
4. Declare Fastify web server.
5. Register Fastify modules and routes.
6. Start listening for requests.