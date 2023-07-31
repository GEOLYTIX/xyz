const logs = new Set(process.env.LOGS?.split(',') || [])

const { nanoid } = require('nanoid')

const process_nanoid = nanoid(6)

const logout = {
  logflare,
  postgresql
}

const dbs_connections = require('./dbs')()

const logger = process.env.LOGGER
  && Object.hasOwn(logout, process.env.LOGGER.split(':')[0])
  && logout[process.env.LOGGER.split(':')[0]]()

module.exports = (log, key) => {

  // The log key should not be written out.
  if (!logs.has(key)) return;

  // Write log to logger if configured.
  
  logger?.(log, key);

  console.log(log)
}

function logflare() {

  const params = Object.fromEntries(new URLSearchParams(process.env.LOGGER.split(':')[1]).entries())

  return log => {

    fetch(`https://api.logflare.app/logs/json?source=${params.source}`,
    {
      method: 'post',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-KEY': params.apikey,
      },
      body: JSON.stringify({
        [process_nanoid]: log
      })
    }).then(resp=>{
      console.log(resp)
    }).catch(err=>{
      console.error(err)
    })

  }    

}

function postgresql() {

  const params = Object.fromEntries(new URLSearchParams(process.env.LOGGER.split(':')[1]).entries())

  const dbs = dbs_connections[params.dbs]

  if (!dbs) console.warn(`Logger module unable to find dbs=${params.dbs}`)

  return async (log, key) => {

    const logstring = typeof log === 'string' ? log : JSON.stringify(log);

    await dbs(`
      INSERT INTO ${params.table} (process, datetime, key, log)
      SELECT $1 process, $2 datetime, $3 key, $4 log`, [process_nanoid, Date.now(), key, logstring])

  }
}