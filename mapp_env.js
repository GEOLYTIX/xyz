process.env.PORT ??= 3000

process.env.COOKIE_TTL ??= 36000

process.env.TITLE ??= 'GEOLYTIX | XYZ'

process.env.DIR ??= ''


const env = {}

Object.entries(process.env).forEach(entry => {
    env[entry[0]] = entry[1]
})

module.exports = env