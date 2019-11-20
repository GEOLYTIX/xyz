module.exports = {

  port: process.env.PORT || 3000,

  acl_connection: (process.env.PRIVATE || process.env.PUBLIC) ?
    process.env.PRIVATE || process.env.PUBLIC : null,

  // Global dir expands the domain to create the root path for the application.
  path: process.env.DIR || '',

  // If set the alias will override the host header in notifications.
  alias: process.env.ALIAS ? process.env.ALIAS : null,

  desktop: process.env.DESKTOP_TEMPLATE ? process.env.DESKTOP_TEMPLATE : null,
  mobile: process.env.MOBILE_TEMPLATE ? process.env.MOBILE_TEMPLATE : null,

  // Assign Google Captcha site_key[0] and secret_key[1].
  captcha: process.env.GOOGLE_CAPTCHA && process.env.GOOGLE_CAPTCHA.split('|'),

  // Application access. Default is public.
  public: !process.env.PRIVATE,

  // Set the maximum number of failed login attempts before an account will be locked.
  failed_attempts: parseInt(process.env.FAILED_ATTEMPTS) || 3,

  // Additional logs will be written to console if env.logs is true.
  logs: process.env.LOG_LEVEL,

  keys: keys(),

  pg: {},

  dbs: {},

  _defaults: require('../workspaces/_defaults'),

  workspace_connection: process.env.WORKSPACE,

  workspace: {},

  CSP: {

    defaultSrc: process.env.CSP_defaultSrc && process.env.CSP_defaultSrc.split(','),

    baseURI: process.env.CSP_baseURI && process.env.CSP_baseURI.split(','),

    objectSrc: process.env.CSP_objectSrc && process.env.CSP_objectSrc.split(','),

    workerSrc: process.env.CSP_workerSrc && process.env.CSP_workerSrc.split(','),

    frameSrc: process.env.CSP_frameSrc && process.env.CSP_frameSrc.split(','),

    formAction: process.env.CSP_formAction && process.env.CSP_formAction.split(','),

    styleSrc: process.env.CSP_styleSrc && process.env.CSP_styleSrc.split(','),

    fontSrc: process.env.CSP_fontSrc && process.env.CSP_fontSrc.split(','),

    scriptSrc: process.env.CSP_scriptSrc && process.env.CSP_scriptSrc.split(','),

    imgSrc: process.env.CSP_imgSrc && process.env.CSP_imgSrc.split(','),

  },

  transport: process.env.TRANSPORT,

  http: process.env.HTTP,

  cloudinary: process.env.CLOUDINARY && process.env.CLOUDINARY.split(' '),

  secret: process.env.SECRET || 'ChinaCatSunflower',

  debug: process.env.DEBUG,

};

function keys() {

  const keys = {};

  Object.keys(process.env).forEach(key => {
    if (key.split('_')[0] === 'KEY') {
      keys[key.split('_')[1]] = process.env[key];
    }
  });

  return keys;

}