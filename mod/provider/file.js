/**
@module /file
*/

const { readFileSync } = require('fs')

const { join } = require('path')

const env = require('../utils/processEnv.js')

module.exports = async ref => {
  try {

    // Subtitutes {*} with env.SRC_* key values.
    const path = (ref.params?.url || ref).replace(/{(?!{)(.*?)}/g,
      matched => env[`SRC_${matched.replace(/(^{)|(}$)/g, '')}`])

    const file = readFileSync(join(__dirname, `../../${path}`))

    if (path.match(/\.json$/i)) {
      return JSON.parse(file, 'utf8')
    }

    return String(file)

  } catch (err) {
    console.error(err)
    return err;
  }
}