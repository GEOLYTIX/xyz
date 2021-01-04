const { readFileSync } = require('fs')

const { join } = require('path')

module.exports = async ref => {
  try {

    const file = readFileSync(join(__dirname, ref))

    if (ref.match(/\.json$/i)) {
      return JSON.parse(file, 'utf8')
    }

    return String(file)

  } catch (err) {
    console.error(err)
    return err
  }
}