// Create workspace connection pool for PostgreSQL.
module.exports = async () => {

  // Load zero config workspace if workspace is not defined in environment settings.
  if (!process.env.WORKSPACE) {
    return await require(global.appRoot + '/mod/workspace/load')(
      await require(global.appRoot + '/mod/workspace/check')({})
    );
  }

  if (process.env.WORKSPACE.split(':')[0] === 'file') {
    return getWorkspaceFromFile(process.env.WORKSPACE.split(':').pop());
  }

  // Global workspace table name.
  const workspace_table = process.env.WORKSPACE.split('|')[1] || 'workspace';

  // Create PostgreSQL connection pool for workspace table.
  const pool = new require('pg').Pool({
    connectionString: process.env.WORKSPACE.split('|')[0]
  });

  const ws_query = async (q, arr) => {
    try {
      const { rows } = await pool.query(q, arr);
      return rows;

    } catch (err) {
      Object.keys(err).forEach(key => !err[key] && delete err[key]);
      console.error(err);
      return { err: err };
    }
  };

  const ws_schema = {
    _id: 'integer',
    settings: 'json'
  };

  let table_name = workspace_table.split('.').pop();

  let schema_name = workspace_table.split('.').shift();

  if (table_name === schema_name) schema_name = 'public';

  var schema = await ws_query(`
  SELECT column_name, data_type
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE table_name = '${table_name}'
  AND table_schema = '${schema_name}';`);

  if (schema.length === 0) {
    
    var create = await ws_query(`
    create table ${workspace_table}
    (
      "_id" serial not null,
      settings json not null
    );`);
    
    if (create.err) return await require(global.appRoot + '/mod/workspace/load')(
      await require(global.appRoot + '/mod/workspace/check')({})
    );

  } else if (schema.some(row => (!ws_schema[row.column_name] || ws_schema[row.column_name] !== row.data_type))) {
    console.log('There seems to be a problem with the WS configuration.');

    return await require(global.appRoot + '/mod/workspace/load')(
      await require(global.appRoot + '/mod/workspace/check')({})
    );
  }

  // Get workspace from PostgreSQL.
  global.pg.ws_get = async () => {

    var config = await ws_query(`SELECT * FROM ${workspace_table} ORDER BY _id DESC LIMIT 1`);

    // Return empty object as workspace if no rows are returned from Postgres query.
    if (config.err || config.length === 0) return {};

    return config[0].settings || {};
      
  };

  // Save workspace to PostgreSQL.
  global.pg.ws_save = async workspace => {
 
    await ws_query(`
    INSERT INTO ${workspace_table} (settings) SELECT $1 AS settings;`,
    [JSON.stringify(workspace)]);
 
  };

  // Check and load workspace.
  await require(global.appRoot + '/mod/workspace/load')(
    await require(global.appRoot + '/mod/workspace/check')(
      await global.pg.ws_get()
    )
  );

};

async function getWorkspaceFromFile(file){

  var workspace = {};
 
  // Attempt to read workspace from file in workspaces folder.
  try {
    workspace = await JSON.parse(require('fs').readFileSync('./workspaces/' + file), 'utf8');

  } catch (err) {
    Object.keys(err).forEach(key => !err[key] && delete err[key]);
    console.error(err);

  // Check and load the workspace from file into memory.
  } finally {
    await require(global.appRoot + '/mod/workspace/load')(
      await require(global.appRoot + '/mod/workspace/check')(workspace)
    );
  }
}