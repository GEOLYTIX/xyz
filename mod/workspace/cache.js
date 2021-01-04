const file = require('./file')

const http = require('./http')

const cloudfront = require('../provider/cloudfront')

const github = require('../provider/github')

const getFrom = {
  'http': ref => http(ref),
  'https': ref => http(ref),
  'file': ref => file(`../../public/workspaces/${ref.split(':')[1]}`),
  'cloudfront': ref => cloudfront(ref.split(':')[1]),
  'github': ref => github(ref.split(':')[1]),
}

const assignTemplates = require('./assignTemplates')

const assignDefaults = require('./assignDefaults')

let workspace = null

module.exports = async req => {

  let timestamp = Date.now()

  // If the workspace is empty or older than 1hr it needs to be cached.
  if (!workspace || ((timestamp - workspace.timestamp) > 3600000)) {

    if (!workspace) {
      req.params.logger(`workspace is empty ${timestamp}`)
    } else if ((timestamp - workspace.timestamp) > 3600000) {
      req.params.logger(`workspace has expired ${workspace.timestamp} | new timestamp is ${timestamp}`)
    }

    workspace = process.env.WORKSPACE && await getFrom[process.env.WORKSPACE.split(':')[0]](process.env.WORKSPACE) || {}

    if (workspace instanceof Error) return workspace

    await assignTemplates(workspace)

    await assignDefaults(workspace)

    workspace.timestamp = timestamp

  } else {

    req.params.logger(`workspace cached ${workspace.timestamp} | age ${timestamp - workspace.timestamp}`)

  }

  return workspace
}