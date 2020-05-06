const { Pool } = require('pg');

module.exports = () => {

  const connection = process.env.PRIVATE && process.env.PRIVATE.split('|') || process.env.PUBLIC && process.env.PUBLIC.split('|');

  if(!connection) return;

  const acl_table = connection[1].split('.').pop();

  const acl_schema = connection[1].split('.')[0] === acl_table ? 'public' : connection[1].split('.')[0];

  // Create PostgreSQL connection pool for ACL table.
  const pool = new Pool({
    connectionString: connection[0]
  });
 
  // Method to query ACL. arr must be empty array by default.
  return async (q, arr) => {

    try {
      const { rows } = await pool.query(q.replace(/acl_table/g, acl_table).replace(/acl_schema/g, acl_schema), arr);
      return rows;
    
    } catch (err) {
      console.error(err);
      return err;
    }

  };

};