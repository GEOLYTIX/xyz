/**
## /utils/validateRequestParams

@module /utils/validateRequestParams
*/

/**
@function validateRequestParams

@description
The method assigns a params object from the request params and query objects.

The restricted params.user will be deleted. The params.user can only be assigned from a user object returned from the [user/auth]{@link module:/user/auth} module.

The method will return an error if some params key contains non whitelisted character or if the restricted user param is detected.

The template param will be set from _template if not explicit. This is required for the vercel router logic which does not allow to use URL path parameter to have the same key as request parameter.

The params object will have a language property which is set to `en` if not explicit.

The params object properties will be iterated through to parse Object values [eg null, boolean, array], and remove undefined parameter properties.

@param {req} req HTTP request.
@property {Object} req.params The request params object.
@property {Object} req.query The request query object.

@returns {Object} Returns a validated params object.
*/
export default function validateRequestParams(req, res, next) {
  // Assign request query [params] to req.params.
  const params = Object.assign(req.params || {}, req.query || {});

  // User is a restricted parameter.
  delete params.user;

  // URL parameter keys must match white listed letters and numbers only.
  if (Object.keys(params).some((key) => !/^[A-Za-z0-9_-]*$/.exec(key))) {
    res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send('URL parameter key validation failed.');
    return;
  }

  // URL parameter keys must match white listed letters and numbers only.
  if (Object.keys(params).includes((key) => key === 'user')) {
    res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send('user is a restricted request parameter.');
    return;
  }

  // Language param will default to english [en] is not explicitly set.
  params.language ??= 'en';

  // Assign from _template if provided as path param.
  params.template ??= params._template;

  for (const key in params) {
    // Delete param keys with undefined values.
    if (params[key] === undefined) {
      delete params[key];
      continue;
    }

    // Delete param keys with empty string value.
    if (params[key] === '') {
      delete params[key];
      continue;
    }

    // Parse lowerCase object value.
    switch (params[key].toLowerCase()) {
      case 'null':
        params[key] = null;
        continue;

      case 'false':
        params[key] = false;
        continue;

      case 'true':
        params[key] = true;
        continue;
    }

    // Check whether the params value begins and ends with square braces.
    if (params[key].match(/^\[.*\]$/)) {
      // Match the string between square brackets and split into an array with undefined array values filtered out.
      params[key] = params[key]
        .match(/^\[(.*)\]$/)[1]
        .split(',')
        .filter(Boolean);
    }
  }

  req._params = params;

  next();
}
