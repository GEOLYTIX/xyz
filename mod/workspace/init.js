const env = require(global.__approot + '/mod/env');

const setWorkspace = require(global.__approot + '/mod/workspace/set');

const checkTable = require(global.__approot + '/mod/workspace/checkTable');

module.exports = async () => {

  // Load zero config workspace if workspace is not defined in environment settings.
  if (!env._workspace) return await setWorkspace({});

  // Load workspace from file.
  if (env._workspace.split(':')[0] === 'file') {

    let workspace = {};
   
    try {
      workspace = await JSON.parse(
        require('fs').readFileSync('./workspaces/' + env._workspace.split(':').pop()), 'utf8');
  
    } catch (err) {
      Object.keys(err).forEach(key => !err[key] && delete err[key]);
      console.error(err);
  
    } finally {
      return await setWorkspace(workspace);
    }
  }

  // Load workspace from file.
  if (env._workspace.split(':')[0] === 'postgres') {

    // Global workspace table name.
    const table = env._workspace.split('|')[1];

    if (!table) return setWorkspace({});

    // Create PostgreSQL connection pool for workspace table.
    const pool = new require('pg').Pool({
      connectionString: env._workspace.split('|')[0]
    });

    env.pg.workspace = async (q, arr) => {
      try {
        const { rows } = await pool.query(q, arr);
        return rows;

      } catch (err) {
        Object.keys(err).forEach(key => !err[key] && delete err[key]);
        console.error(err);
        return { err: err };
      }
    };

    if (env.debug) checkTable(table);

    var config = await env.pg.workspace(`
    SELECT * FROM ${table}
    ORDER BY _id DESC LIMIT 1`);

    // Return empty object as workspace if no rows are returned from Postgres query.
    if (config.err || config.length === 0) return setWorkspace({});

    // Check and load workspace.
    setWorkspace(config[0].settings || {});

  }

};