process.env.PORT ??= 3000

process.env.DIR ??= ''

process.env.TITLE ??= 'GEOLYTIX | XYZ'

// Assign default age in ms.
process.env.WORKSPACE_AGE ??= 3600000

process.env.COOKIE_TTL ??= 36000

process.env.FAILED_ATTEMPTS ??= 3


const env = {}

Object.entries(process.env).forEach(entry => {
    env[entry[0]] = entry[1]
})

module.exports = env