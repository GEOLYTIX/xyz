# SQL Injections

All queries to the PostgreSQL database are parsed through the node-postgres module. [Queries](https://node-postgres.com/features/queries) use a battle-tested parameter substitution code.

Additionally all field and table names are checked against a lookup table which includes values from the current application settings only. A query to a table or a query with a fieldname which is not defined in the application settings is not acceptable \([http code 406](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/406)\).

