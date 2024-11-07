/**
## /user/acl

The acl module provides access to the ACL table for all User API methods.

@requires pg

@module /user/acl
*/

const { Pool } = require('pg');

const connection = process.env.PRIVATE?.split('|') || process.env.PUBLIC?.split('|') || []
const connection = process.env.PRIVATE?.split('|') || process.env.PUBLIC?.split('|')

// Early return if connection is not properly defined
if (!connection[1]) {
  console.warn('ACL connection not properly defined. PRIVATE or PUBLIC environment variable is missing or invalid.')
  module.exports = {}
  return
}

const acl_table = connection[1].split('.').pop()
const acl_table = connection[1]?.split('.').pop()

const acl_schema = connection[1].split('.')[0] === acl_table ? 'public' : connection[1].split('.')[0]
const acl_schema = connection[1]?.split('.')[0] === acl_table ? 'public' : connection[1]?.split('.')[0]

const pool = new Pool({
  connectionString: connection[0]
})

// The acl module will export an empty require object instead of a function if no ACL connection has been defined.
  /**
  @function acl
  
  @description
  The acl method will connect to pg pool and query the ACL with a provided query template. The `/acl_table/` and `/acl_schema/` in the query template will be replaced with values provided as `PRIVATE` or `PUBLIC` environment variable.
  
  @param {string} q 
  Query template.
  @param {array} arr 
  Parameters to be substrituted in query template.
  */

  module.exports = async function acl(q, arr) {

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
}