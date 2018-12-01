module.exports = async startFastify => {

  // Store provider keys.
  global.KEYS = {};
  Object.keys(process.env).forEach(key => {
    if (key.split('_')[0] === 'KEY') {
      global.KEYS[key.split('_')[1]] = process.env[key];
    }
  });

  // global.pg stores all node postgres connection pools.
  global.pg = {};

  // Create PostGIS dbs connection pools.
  await require('./dbs')();

  // Create PostgreSQL ACL connection pool.
  await require('./acl')();

  // Create PostgreSQL Workspace connection pool.
  await require('./ws')();

  startFastify();

};