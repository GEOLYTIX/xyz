const logs = new Set(process.env.LOGS?.split(',') || [])

// Errors should always be logged.
logs.add('err')

const { nanoid } = require('nanoid')

const process_nanoid = nanoid(6)

const logout = {
  logflare,
  postgresql
}

// Required to initialse PostgreSQL logger.
const { Pool } = require('pg');

const logger = process.env.LOGGER
  && Object.hasOwn(logout, process.env.LOGGER.split(':')[0])
  && logout[process.env.LOGGER.split(':')[0]]()

// The default key is 'err' which should always be logged.
module.exports = (log, key = 'err') => {

  // Check whether the log for the key should be logged.
  if (!logs.has(key)) return;

  // Write log to logger if configured.
  logger?.(log, key);

  if (key === 'err') {

    // Log errors as such.
    console.error(log)
    return
  }

  // Log to stdout.
  console.log(log)
}

function logflare() {

  const params = Object.fromEntries(new URLSearchParams(process.env.LOGGER.split(':')[1]).entries())

  return (log, key) => {

    fetch(`https://api.logflare.app/logs/json?source=${params.source}`,
    {
      method: 'post',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-KEY': params.apikey,
      },
      body: JSON.stringify({
        [process_nanoid]: log,
        key
      })
    }).catch(err=>{
      console.error(err)
    })

  }    

}

function postgresql() {

  const params = Object.fromEntries(new URLSearchParams(process.env.LOGGER.split(':')[1]).entries())

  const connectionString = process.env[`DBS_${params.dbs}`]

  if (!connectionString) {
    console.warn(`Logger module unable to find dbs=${params.dbs}`)
    return;
  }

  const pool = new Pool({
    connectionString,
    statement_timeout: 3000
  });

  return async (log, key) => {

    // Log messages can be string or objects
    // Objects must be parsed as string for the PostgreSQL log table schema.
    const logstring = typeof log === 'string' ? log : JSON.stringify(log);

    const client = await pool.connect()

    await client.query(`
    INSERT INTO ${params.table} (process, datetime, key, log)
    SELECT $1 process, $2 datetime, $3 key, $4 log`,
    [process_nanoid, Date.now(), key, logstring])

    client.release()
  }
}