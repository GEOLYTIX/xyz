const acl = require('../auth/acl')()

const bcrypt = require('bcryptjs')

module.exports = async (req, res) => {

  const rows = await acl(`
  CREATE TABLE acl_schema.acl_table (
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
    '${bcrypt.hashSync('admin123', bcrypt.genSaltSync(8))}' AS password,
    true AS verified,
    true AS approved,
    true AS admin_user,
    true AS admin_workspace;`)

  if (rows instanceof Error) return res.status(500).send('Failed to create PostGIS table.')

  res.send('New ACL has been created.')

}