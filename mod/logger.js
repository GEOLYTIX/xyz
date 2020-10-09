const fetch = require('node-fetch')

module.exports = msg => {

  if (!process.env.LOGS) return

  if (process.env.LOGS === 'console') return console.log(msg)
  
  fetch(`https://api.logflare.app/logs/json?api_key=${process.env.KEY_LOGFLARE}&source=${process.env.SOURCE_TOKEN}`,
  {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      msg: msg
    })
  }).then(resp=>{
    !resp.ok && console.log(msg)
  }).catch(err=>{
    console.error(err)
  })

}