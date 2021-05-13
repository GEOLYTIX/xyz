const { Pool } = require('pg');

const dbs = {};

module.exports = () => {

  Object.keys(process.env)
    .filter(key => key.split('_')[0] === 'DBS')
    .filter(key => !dbs[key.split('_')[1]])
    .forEach(key => {

      if (process.env[key].match(/^postgres/)) return postgres(key.split('_')[1], process.env[key])

      if (process.env[key].match(/^aurora/)) return aurora(key.split('_')[1], process.env[key])

    })

  function postgres(key, connectionString) {

    // Create connection pool.
    const pool = new Pool({
      connectionString: connectionString,
      statement_timeout: parseInt(process.env.STATEMENT_TIMEOUT) || 10000
    });

    dbs[key] = async (q, arr, timeout) => {

      // Request which accepts q and arr and will return rows or rows.err.
      try {
        timeout && await pool.query(`SET statement_timeout = ${timeout}`)

        const { rows } = await pool.query(q, arr)

        timeout && await pool.query(`SET statement_timeout = 10000`)

        return rows

      } catch (err) {
        console.error(err)
        return err
      }

    }

  }

  function aurora(key, connectionString) {

    const keyValueArr = connectionString.split('|')
    
    const apiclient = require('data-api-client')({
      engine: 'pg',
      options: {
        accessKeyId: keyValueArr[1],
        secretAccessKey: keyValueArr[2],
        region: keyValueArr[3],
      },
      resourceArn: keyValueArr[4],
      secretArn: keyValueArr[5],
      database: keyValueArr[6]
    })

    dbs[key] = async (q) => {

      // Request which accepts q and arr and will return rows or rows.err.
      try {
  
        const { records } = await apiclient.query(q);
  
        return records
  
      } catch (err) {
        console.error(err)
        return err
      }
  
    }

  }

  return dbs

};