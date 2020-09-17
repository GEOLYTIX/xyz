const pino = require('pino')

const pinoLogflare = require('pino-logflare')

module.exports = () => {
  
  try {

    const { stream } = pinoLogflare.logflarePinoVercel({
      apiKey: process.env.KEY_LOGFLARE,
      sourceToken: process.env.SOURCE_TOKEN
    })

    console.log(stream)
 
    return pino({
      level: "debug",
      base: {
        revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
      }
    }, stream)

  } catch (err) {

    console.log(err)

  }

}