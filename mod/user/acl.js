/** ## /user/acl

The acl module provides access to the ACL table for all User API methods.

The module will split either the PRIVATE or PUBLIC xyzEnv variables as an array of connection strings.

The module will export null if neither a PRIVATE or PUBLIC xyzEnv are provided.

@requires pg
@requires module:/utils/processEnv

@module /user/acl
*/

import pg from 'pg';

const { Pool } = pg;

const connection = xyzEnv.PRIVATE?.split('|') || xyzEnv.PUBLIC?.split('|');

// These variables can only be reassigned if the connection is an array.
let acl_table, acl_schema, pool;

// The acl module will export an empty require object instead of a function if no ACL connection has been defined.
export default !connection?.[1]
  ? null
  : (() => {
      acl_table = connection[1]?.split('.').pop();

      acl_schema =
        connection[1]?.split('.')[0] === acl_table
          ? 'public'
          : connection[1]?.split('.')[0];

      pool = new Pool({
        connectionString: connection[0],
      });

      return acl;
    })();

/**
@function acl
 
@description
The acl method will connect to pg pool and query the ACL with a provided query template. The `/acl_table/` and `/acl_schema/` in the query template will be replaced with values provided as `PRIVATE` or `PUBLIC` environment variable.
 
@param {string} q Query template.
@param {array} arr Parameters to be substrituted in query template.
*/
async function acl(q, arr) {
  try {
    const client = await pool.connect();

    const { rows } = await client.query(
      q.replace(/acl_table/g, acl_table).replace(/acl_schema/g, acl_schema),
      arr,
    );

    client.release();

    return rows;
  } catch (err) {
    console.error(err);
    return err;
  }
}
