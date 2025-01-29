/**
## /view

The XYZ View API module export the view method required to request application views from the workspace.

View templates maybe localised and must be requested from the languageTemplates utility module.

@requires /utils/logger
@requires /utils/languageTemplates
@requires /utils/processEnv

@module /view
*/

const logger = require('./utils/logger');

const languageTemplates = require('./utils/languageTemplates');

/**
@function view
@async

@description
The View API method will request a view [template] from the languageTemplates module method.

The optional params.msg string property may have a languageTemplate which should be assigned to the params string before the substitution of template variables.

The view [template] is a HTML string. Template variables defined within a set of brackets `{{var}}` will be substituted with params property values before the view string is sent from the HTTP Response object.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} [req.params] Request params.
@property {string} [params.template="default_view"] The view template reference.
@property {string} [params.msg] The view template reference.
@property {Object} [params.user] Requesting user.
*/
module.exports = async function view(req, res) {
  logger(req.url, 'view-req-url');

  const params = {};

  Object.keys(req.params)
    .filter((key) => typeof req.params[key] === 'string')
    .forEach((key) => (params[key] = req.params[key]));

  // The default_view is assumed without an implicit template value.
  params.template ??= 'default_view';

  params.dir ??= xyzEnv.DIR;

  params.login ??= (xyzEnv.PRIVATE || xyzEnv.PUBLIC) && 'true';

  params.title ??= xyzEnv.TITLE;

  params.language ??= req.params.user?.language || 'en';

  const template = await languageTemplates(params);

  if (!template) {
    res.status(400).send(`Template undefined`);
    return;
  }

  if (req.params.msg) {
    // Check for languageTemplate for a message to be displayed in the template.
    params.msg = await languageTemplates({
      template: req.params.msg,
      language: req.params.language,
    });
  }

  // Susbtitute template variables with string properties in params.
  const view = template.replace(
    /{{2}([A-Za-z][A-Za-z0-9]*)}{2}/g,
    (matched) => {
      // regex matches {{ or }}
      return params[matched.replace(/(^{{)|(}}$)/g, '')] || '';
    },
  );

  res.send(view);
};
