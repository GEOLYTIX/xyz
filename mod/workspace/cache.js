const file = require('../provider/file')

const cloudfront = require('../provider/cloudfront')

const mongodb = require('../provider/mongodb')

const http = require('./httpsAgent')

const getFrom = {
  'https': ref => http(ref),
  'file': ref => file(ref.split(/:(.*)/s)[1]),
  'cloudfront': ref => cloudfront(ref.split(/:(.*)/s)[1]),
  'mongodb': ref => mongodb(JSON.parse(ref.split(/:(.*)/s)[1]))
}

const assignTemplates = require('./assignTemplates')

const defaults = require('./defaults')

const assignDefaults = require('./assignDefaults')

let workspace = null

const logger = require('../utils/logger')

module.exports = async () => {

  const timestamp = Date.now()

  // Cache workspace if empty.
  if (!workspace) {
    await cache()
    logger(`Workspace empty; Time to cache: ${Date.now()-timestamp}`, 'workspace')
  }

  // Logically assign timestamp.
  workspace.timestamp = workspace.timestamp || timestamp

  // Cache workspace if expired.
  if ((timestamp - workspace.timestamp) > (+process.env.WORKSPACE_AGE || 3600000)) {
    
    await cache()
    logger(`Workspace cache expired; Time to cache: ${Date.now()-timestamp}`, 'workspace')
    workspace.timestamp = timestamp
  }

  return workspace
}

async function cache() {

  // Get workspace from source.
  workspace = process.env.WORKSPACE
    && await getFrom[process.env.WORKSPACE.split(':')[0]](process.env.WORKSPACE)
    || {}

  // Return error if source failed.
  if (workspace instanceof Error) return workspace

  // Assign default locale as locales if missing.
  workspace.locales = workspace.locales || { zero: defaults.locale }

  await assignTemplates(workspace)

  await assignDefaults(workspace)

  // Substitute all SRC_* variables in locales.
  workspace.locales = JSON.parse(
    JSON.stringify(workspace.locales).replace(/\$\{(.*?)\}/g,
      matched => process.env[`SRC_${matched.replace(/\$|\{|\}/g, '')}`] || matched)
  )
}