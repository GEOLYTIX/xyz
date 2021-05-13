---
title: Query
layout: root.html
---

# Query API

The [Query API module](https://github.com/GEOLYTIX/xyz/blob/development/mod/query.js) securely conveys API requests are parameterized queries to connected PostgreSQL data sources. Data source connections are configured as process environment variables to protect credentials once the API has been deployed to the cloud.

**DDL (Data Definition Language) must never be processed from a request to protect against SQL injections.**

Queries must be stored as templates in the workspace. 

## Template Strings

[PostgreSQL does not support parameters for identifiers.](https://node-postgres.com/features/queries)

In order to enabled substitution of any parameter the keys must defined within curly braces, prefixed by a dollar sign, eg. `${table}`

A key in the template string will be replaced with a value from the request params object in the query string. Keys are replaced with an empty string if the key is not found in the params object.

```javascript
// Replace parameter for identifiers, e.g. table, schema, columns
.replace(/\$\{(.*?)\}/g, matched => {

  // Remove template brackets from matched param.
  const param = matched.replace(/\$|\{|\}/g, "")

  // Get param value from request params object.
  const change = req.params[param] || ""
  
  // Change value may only contain a limited set of whitelisted characters.
  if (!reserved.has(param) && !/^[A-Za-z0-9._-]*$/.test(change)) {

  // Err and return empty string if the change value is invalid.
    console.error("Change param no bueno")
    return ""
  }
  
  return change
})
```

PostgreSQL provides battle-tested parameter substitution code within the server itself. Placeholder in the query string ($1, $2, $n) will be substituted with parameter values which are submitted as an array with the query.

Values provided in the params array may be typed as objects, arrays, numeric, or text strings.

Parameter keys defined in curly braces prefixed with a percentage sign, eg. `%{id}` are replaced with placeholders and the value will be pushed to the params array from the request params object.

```javascript
// Replace params with placeholder, eg. $1, $2
.replace(/\%\{(.*?)\}/g, matched => {

  // Remove template brackets from matched param.
  const param = matched.replace(/\%|\{|\}/g, "")

  var val = req.params[param] || ""

  try {

    // Try to parse val if the string begins and ends with either [] or {}
    val = /^[\[\{].*[\]\}]$/.test(val) && JSON.parse(val) || val

  } catch(err) {
    console.error(err)
  }

  // Push value from request params object into params array.
  params.push(req.params[val] || "")
  
  return `\$${params.length}`
})
```

### Parameter parsing
In order to provide URL parameter as either array or object we check whether it is possible to parse the parameter value prior to pushing the parsed value into the SQL params array. The string must begin and end with brackets in order for the parsing to be attempted.

`api/query/array_any_id?ids=[10,3]` will provide an array of integer to the sample query array_any_id (`SELECT count(1) from dev.scratch where id = ANY(%{ids})`).


## Template Modules

It is possible to generate SQL from a template module. The module's render method must return a template string which will then be rendered into the queryString which is passed as a query to [node-pg pool](https://node-postgres.com/api/pool).

The $ sign must be escaped if the template string is returned as a template literal from the module's render method.

```javascript
module.exports = `
  SELECT count(1)
  FROM \${table}
  WHERE true \${filter};`
```

More complex modules allow for the safe substitution of parameter within the render script before returning a template string.

## Layer queries

The layer object will be retrived from the workspace if a layer key is provided as the layer URL request parameter. Access roles and filter will be applied to the reserved `${filter}` parameter. A request will terminate with a 403 status if the credentials provided with the request do not allow for access to the layer.

## Post queries

The `%{body}` parameter is reserved to be substituted with the post request body. If defined as an URL request parameter, `req.params.body` will replaced with the request body.