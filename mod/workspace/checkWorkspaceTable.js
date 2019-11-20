const env = require('../env');

module.exports = async table => {
 
  let
    table_name = table.split('.').pop(),
    table_schema = table.split('.').shift();
  
  if (table_name === table_schema) table_schema = 'public';
  
  var records = await env.pg.workspace(`
      SELECT column_name, data_type
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = '${table_name}'
      AND table_schema = '${table_schema}';`);
  
  // Attempt to create new workspace table if no records are found;
  if (records.length === 0) {
      
    await env.pg.workspace(`
    create table ${table} (
    "_id" serial not null,
    settings json not null);`);
  }

  const schema = {
    _id: 'integer',
    settings: 'json'
  };
  
  if (records.some(
    row => (!schema[row.column_name] || schema[row.column_name] !== row.data_type)
  )) console.log('There seems to be a problem with the workspace table configuration.');

};