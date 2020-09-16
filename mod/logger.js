const pino = require('pino')

const pinoLogflare = require('pino-logflare')

module.exports = () => {
  
  try {

    const { stream } = pinoLogflare.logflarePinoVercel({
      apiKey: process.env.KEY_LOGFLARE,
      sourceToken: process.env.SOURCE_TOKEN
    })
  
    return pino({
      level: "debug",
      base: {
        env: process.env.ENV || "ENV not set",
        revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
      }
    }, stream)

  } catch (err) {

    return err

  }

}