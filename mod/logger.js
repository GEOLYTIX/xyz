const fetch = require('node-fetch')

const logs = process.env.LOGS && new Set(process.env.LOGS.split(','))

module.exports = (msg, log) => {

  if (!logs) return

  if (!logs.has(log)) return

  if (process.env.KEY_LOGFLARE) {

    const keySource = process.env.KEY_LOGFLARE.split('|')

    fetch(`https://api.logflare.app/logs/json?source=${keySource[1]}`,
    {
      method: 'post',
      headers: { 
        'Content-Type': 'application/json',
        "X-API-KEY": keySource[0],
      },
      body: JSON.stringify({
        msg: msg
      })
    }).then(resp=>{
      !resp.ok && console.log(msg)
    }).catch(err=>{
      console.error(err)
    })

  }

  console.log(msg)

}