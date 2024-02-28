/**
@module /user/acl
*/

const { Pool } = require('pg');

const connection = process.env.PRIVATE?.split('|') || process.env.PUBLIC?.split('|')

if(!connection || !connection[1]) return

const acl_table = connection[1].split('.').pop()

const acl_schema = connection[1].split('.')[0] === acl_table ? 'public' : connection[1].split('.')[0]

const pool = new Pool({
  connectionString: connection[0]
})

module.exports = async (q, arr) => {

  try {

    const client = await pool.connect()

    const { rows } = await client.query(q.replace(/acl_table/g, acl_table).replace(/acl_schema/g, acl_schema), arr)

    client.release()

    return rows

  } catch (err) {
    console.error(err)
    return err
  }
}