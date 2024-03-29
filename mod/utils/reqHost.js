const logger = require('./logger')

module.exports = req => {

  let host

  if (req.headers.host.startsWith('localhost')) {

    host = `http://${req.headers.host}${process.env.DIR}`
  } else if (req.headers.host) {

    host = `https://${process.env.ALIAS||req.headers.host}${process.env.DIR}`
  } else if (req.headers.referer) {

    host = new URL(req.headers.referer).origin
  }

  logger(host, 'reqhost')

  return host
}