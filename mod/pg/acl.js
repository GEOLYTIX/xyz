const env = require('../env');

module.exports = async () => {

  if (!env.acl_connection) return;

  env.acl_connection = env.acl_connection.split('|');

  if(!env.acl_connection[1]) return;

  if (!env.secret) {
    console.log('No secret provided for JWT. Process will be killed now!');
    return process.exit();
  }

  const acl_table = env.acl_connection[1].split('.').pop();

  const acl_schema = env.acl_connection[1].split('.')[0] === acl_table ? 'public' : env.acl_connection[1].split('.')[0];

  // Create PostgreSQL connection pool for ACL table.
  const pool = new require('pg').Pool({
    connectionString: env.acl_connection[0]
  });
  
  // Method to query ACL. arr must be empty array by default.
  env.acl = async (q, arr) => {

    try {

      const { rows } = await pool.query(q.replace(/acl_table/g, acl_table).replace(/acl_schema/g, acl_schema), arr);
      return rows;
    
    } catch (err) {
      Object.keys(err).forEach(key => !err[key] && delete err[key]);
      console.error(err);
      return { err: err };
    }

  };
    
  // Check ACL
  const user_schema = {
    _id: 'integer',
    email: 'text',
    password: 'text',
    verified: 'boolean',
    approved: 'boolean',
    admin_user: 'boolean',
    admin_workspace: 'boolean',
    verificationtoken: 'text',
    approvaltoken: 'text',
    failedattempts: 'integer',
    password_reset: 'text',
    api: 'text',
    approved_by: 'text',
    access_log: 'ARRAY',
    blocked: 'boolean',
    roles: 'ARRAY',
  };
    
  const users = await env.acl(`
  SELECT column_name, data_type
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE table_name = 'acl_table'
    AND table_schema = 'acl_schema';`);
    
  if (users.length === 0) {

    // Set the default password for the admin user.
    const password = require('bcrypt-nodejs').hashSync('admin123', require('bcrypt-nodejs').genSaltSync(8));
    
    const new_acl = await env.acl(`
    CREATE TABLE IF NOT EXISTS acl_schema.acl_table (
      "_id" serial not null,
      email text not null,
      password text not null,
      verified boolean default false,
      approved boolean default false,
      verificationtoken text,
      approvaltoken text,
      failedattempts integer default 0,
      password_reset text,
      api text,
      approved_by text,
      access_log text[] default '{}'::text[],
      blocked boolean default false,
      roles text[] default '{}'::text[],
      admin_workspace boolean default false,
      admin_user boolean default false
    );
    
    INSERT INTO acl_schema.acl_table (email, password, verified, approved, admin_user, admin_workspace)
    SELECT
      'admin@geolytix.xyz' AS email,
      '${password}' AS password,
      true AS verified,
      true AS approved,
      true AS admin_user,
      true AS admin_workspace;
    `);

    if (new_acl && new_acl.err) {
      return process.exit();
    }

    console.log('A new ACL has been created');  

  } else if (users.some(
    row => user_schema[row.column_name] !== row.data_type
  )) console.log('There seems to be a problem with the ACL configuration.');

};