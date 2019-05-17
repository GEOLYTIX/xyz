module.exports = {

  port: process.env.PORT || 3000,

  acl_connection: (process.env.PUBLIC || process.env.PRIVATE) ?
    (process.env.PUBLIC || process.env.PRIVATE).split('|') : null,

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

  // Assign logrocket key.
  logrocket: process.env.LOG_ROCKET,

  // Additional logs will be written to console if env.logs is true.
  logs: process.env.LOG_LEVEL,

  keys: keys(),

  pg: {},

  dbs: {},

  _defaults: require('../workspaces/_defaults'),

  _workspace: process.env.WORKSPACE,

  workspace: {},

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