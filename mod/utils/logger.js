const logs = new Set(process.env.LOGS?.split(',') || [])

const { nanoid } = require('nanoid')

const process_nanoid = nanoid(6)

module.exports = (msg, log) => {

  if (!logs.has(log)) return;

  // Append the process_nanoid to the log msg.
  if (typeof msg === 'object') {

    msg.process_nanoid = process_nanoid
  } else {

    msg = `${process_nanoid} - ${msg}`
  }

  // Send log to logflare if configured.
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