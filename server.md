# Server

[server.js](https://github.com/GEOLYTIX/xyz/blob/master/server.js) starts an [Fastify](https://www.fastify.io/) web server on the specified port.

The startup procedure is as follows.

1. Declare the Fastify server object.
2. Register the Fastify Helmet module.
3. Register the Fastify Formbody module.
4. Register the Fastify Static module.
5. Register the Fastify Cookie module.
6. Register the Fastify Auth module.
7. Register the Fastify JWT module.
8. Decorate routes with the authToken function.
9. Setting [globals](https://github.com/GEOLYTIX/xyz/blob/master/globals.js) from environment settings.
10. Register [workspace](https://github.com/GEOLYTIX/xyz/blob/master/workspace.js) admin routes.
11. Load the admin workspace configuration into the global scope.
12. Remove admin workspace configuration for private access.
13. Remove private workspace confirguration for public access.
14. Load value array for SQL Injection and access lookup.
15. Register [auth](https://github.com/GEOLYTIX/xyz/blob/master/auth.js) routes.
16. Register all other [routes](https://github.com/GEOLYTIX/xyz/blob/master/routes.js).
17. Listen to incoming requests.

