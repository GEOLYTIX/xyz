const cloudfront = require('../provider/cloudfront')

const file = require('../provider/file')

const https = require('https')

const httpsAgent = new https.Agent({
    keepAlive: true,
    maxSockets: parseInt(process.env.CUSTOM_AGENT) || 1
})

const mongodb = require('../provider/mongodb')

module.exports = {
    _https: async ref => {
        try {

            const response = await fetch(ref, {
                agent: process.env.CUSTOM_AGENT && httpsAgent
            })

            if (response.status >= 300) return new Error(`${response.status} ${ref}`)

            if (ref.match(/\.json$/i)) {
                return await response.json()
            }

            return await response.text()

        } catch (err) {
            console.error(err)
            return err
        }
    },
    https: async url => {

        try {

            const response = await fetch(url)

            logger(`${response.status} - ${url}`, 'fetch')

            if (url.match(/\.json$/i)) {
                return await response.json()
            }

            return await response.text()

        } catch (err) {
            console.error(err)
            return;
        }

    },
    file: ref => file(ref.split(':')[1]),
    cloudfront: ref => cloudfront(ref.split(':')[1]),
    mongodb: ref => mongodb(ref.split(/:(.*)/s)[1])
}