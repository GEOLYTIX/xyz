/**
## reqHost

Exports the reqHost utility method.

@requires module:/utils/logger
@requires mapp_env

@module /utils/reqHost
*/

const env = require('../../mapp_env.js')

const logger = require('./logger')

/**
@function reqHost

@description
The reqHost utility method inspects the HTTP req[quest] object header to return the host as a string.

The host value can be logged with the `reqHost` logger key.

@param {Object} req HTTP request.

@returns {string} host
*/

module.exports = function reqHost(req) {

  let host

  if (req.headers.host.startsWith('localhost')) {

    host = `http://${req.headers.host}${env.DIR}`

  } else if (req.headers.host) {

    host = `https://${env.ALIAS||req.headers.host}${env.DIR}`

  } else if (req.headers.referer) {

    host = new URL(req.headers.referer).origin
  }

  logger(host, 'reqhost')

  return host
}