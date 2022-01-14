const { readFileSync } = require('fs')

const { join } = require('path')

module.exports = async ref => {
  try {

    const path = (ref.params?.url || ref).replace(/\{(.*?)\}/g,
      matched => process.env[`SRC_${matched.replace(/\{|\}/g, '')}`] || matched)

    const file = readFileSync(join(__dirname, `../../${path}`))

    if (path.match(/\.json$/i)) {
      return JSON.parse(file, 'utf8')
    }

    return String(file)

  } catch (err) {
    console.error(err)
    return err
  }
}