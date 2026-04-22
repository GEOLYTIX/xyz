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
  Object.assign(req.params || {}, req.query || {});

  // User is a restricted parameter.
  delete req.params.user;

  // URL parameter keys must match white listed letters and numbers only.
  if (Object.keys(req.params).some((key) => !/^[A-Za-z0-9_-]*$/.exec(key))) {
        res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send('URL parameter key validation failed.');
    return;
  }

  // URL parameter keys must match white listed letters and numbers only.
  if (Object.keys(req.params).some((key) => key === 'user')) {
    res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send('user is a restricted request parameter.');
    return;
  }

  // Language param will default to english [en] is not explicitly set.
  req.params.language ??= 'en';

  // Assign from _template if provided as path param.
  req.params.template ??= req.params._template;

  for (const key in req.params) {
    // Delete param keys with undefined values.
    if (req.params[key] === undefined) {
      delete req.params[key];
      continue;
    }

    // Delete param keys with empty string value.
    if (req.params[key] === '') {
      delete req.params[key];
      continue;
    }

    // Parse lowerCase object value.
    switch (req.params[key].toLowerCase()) {
      case 'null':
        req.params[key] = null;
        continue;

      case 'false':
        req.params[key] = false;
        continue;

      case 'true':
        req.params[key] = true;
        continue;
    }

    // Check whether the params value begins and ends with square braces.
    if (req.params[key].match(/^\[.*\]$/)) {
      // Match the string between square brackets and split into an array with undefined array values filtered out.
      req.params[key] = req.params[key]
        .match(/^\[(.*)\]$/)[1]
        .split(',')
        .filter(Boolean);
    }
  }

  //next();
}
