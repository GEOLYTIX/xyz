const fetch = require('node-fetch')

module.exports = msg => {

  if (!process.env.LOGS) return

  if (process.env.LOGS === 'console') return console.log(msg)

  if (process.env.LOGS === 'logflare') {

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

}