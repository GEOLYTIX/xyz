const env = require(global.__approot + '/mod/env');

module.exports = async workspace => {
  
  console.log(' ');
  console.log('------Checking Layers------');
   
  // Iterate through locales.
  for (const key of Object.keys(workspace.locales)) {
  
    // Set default locale.
    const locale = workspace.locales[key];
  
    // Invalidate locale if it is not an object.
    if (typeof locale !== 'object') {
      workspace.locales['__' + key] = locale;
      return delete locales[key];
    }
  
    // Check layers in locale.
    await chkLayers(locale.layers);
  }

  console.log('-----------------------------');
  console.log(' ');
};

async function chkLayers(layers) {

  // Iterate through loayers.
  for (const key of Object.keys(layers)) {

    const layer = layers[key];

    // Check whether the layer connects.
    await chkLayerConnect(layer, layers);

  }
}

async function chkLayerConnect(layer, layers) {

  if (layer.format === 'tiles') await chkLayerURL(layer, layers);

  if (layer.format === 'cluster') await chkLayerGeom(layer, layers);

  if (layer.format === 'geojson') await chkLayerGeom(layer, layers);

  if (layer.format === 'grid') await chkLayerGeom(layer, layers);

  if (layer.format === 'mvt') await chkLayerGeom(layer, layers);
}

async function chkLayerURL(layer, layers) {

  // Get uri from layer and split at provider definition.
  let uri = layer.URI.split('&provider=');

  // Replace provider definition with provider key.
  uri = `${uri[0]}${uri[1] ? env.keys[uri[1]] : ''}`;

  // Replace subdomain (a) and x,y,z (0) location.
  uri = uri.replace(/\{s\}/i,'a').replace(/\{.\}/ig,'0');

  // Fetch results from Google maps places API.
  const fetched = await require(global.__approot + '/mod/fetch')(uri, 'no_log');

  if (fetched._err) {

    console.log(`!!! ${layer.locale}.__${layer.key} (${layer.format}) => '¡No bueno!'`);

    return invalidateLayer(layer, layers);
  }

  console.log(`${layer.locale}.${layer.key} (${layer.format}) => 'A-ok'`);
}

async function chkLayerGeom(layer, layers) {

  let tables = layer.tables ? Object.values(layer.tables) : [layer.table];

  for (const table of tables){

    // Don't invalidate layer with null in tables array.
    if (!table && tables.length > 1) continue;

    // Invalidate layer without table.
    if (!table) return invalidateLayer(layer, layers);

    // Invalidate layer if no dbs has been defined.
    if (!layer.dbs || !env.pg.dbs[layer.dbs]) {
      console.log(`!!! ${layer.locale}.__${layer.key} | ${table}.${layer.geom_3857 || layer.geom} (${layer.format}) => Missing or invalid DBS connection`);
      return invalidateLayer(layer, layers);
    }

    // Check whether table has layer geom or geom_3857 field.
    let rows = await env.pg.dbs[layer.dbs](`SELECT ${layer.geom_3857 || layer.geom} FROM ${table} LIMIT 1`, null, 'no_log');

    if (rows.err) {
      console.log(`!!! ${layer.locale}.${layer.key} | ${table}.${layer.geom_3857 || layer.geom} (${layer.format}) => ${rows.err.message}`);
      return invalidateLayer(layer, layers);
    }

    console.log(`${layer.locale}.${layer.key} | ${table}.${layer.geom_3857 || layer.geom} (${layer.format}) => 'A-ok'`);

    // Check whether the defined qID is returned.
    if (layer.qID) await chkLayerSelect(layer);

    // Check or create mvt_cache table.
    if (layer.mvt_cache) await chkMVTCache(layer);
  }

  function invalidateLayer(layer, layers) {
    layers['__'+layer.key] = layer;
    delete layers[layer.key];
  }

}

async function chkMVTCache(layer) {
  
  // Get all MVT tables defined in layer tables.
  let tables = layer.tables ? Object.values(layer.tables) : [layer.table];

  for (const table of tables){

    // Table may be null in tables array.
    if (!table && tables.length > 1) continue;

    // Get a sample MVT from the cache table.
    let rows = await env.pg.dbs[layer.dbs](`SELECT z, x, y, mvt, tile FROM ${layer.mvt_cache} LIMIT 1`, null, 'no_log');

    if (rows && rows.err) return await createMVTCache(layer);

    // Check sample MVT.
    if (rows.length > 0) {

      const VectorTile = require('@mapbox/vector-tile').VectorTile;
      const Protobuf = require('pbf');
      const tile = new VectorTile(new Protobuf(rows[0].mvt));

      // MVT cache without fields.
      if (!layer.mvt_fields) return;

      // Check if all mvt_fields are contained in cached MVT.
      for (const field of layer.mvt_fields){

        // Truncate cache table if field is not in sample MVT.
        if (Object.keys(tile.layers).length > 0 && tile.layers[layer.key]._keys.indexOf(field.split(' as ').pop()) < 0) {

          // Truncate the cache table.
          rows = await env.pg.dbs[layer.dbs](`TRUNCATE ${layer.mvt_cache};`);

          if (rows.err) {
            return console.log(`!!! ${layer.locale}.${layer.key} | ${layer.mvt_cache} (mvt cache) => Failed to truncate cache table`);
          }

          return console.log(`${layer.locale}.${layer.key} | ${layer.mvt_cache} (mvt cache) => Cache table has been truncated`);
        }
      }

      return console.log(`${layer.locale}.${layer.key} | ${layer.mvt_cache} (mvt cache) => 'A-ok'`);

    }

    console.log(`${layer.locale}.${layer.key} | ${layer.mvt_cache} (mvt cache) => 'Huh? Cache table seems to be empty.'`);

  }
  
}

async function createMVTCache(layer){

  let rows = await env.pg.dbs[layer.dbs](`
    create table ${layer.mvt_cache}
    (
      z integer not null,
      x integer not null,
      y integer not null,
      mvt bytea,
      tile geometry(Polygon,3857),
      constraint ${layer.mvt_cache.replace(/\./,'_')}_z_x_y_pk
        primary key (z, x, y)
    );
    
    create index ${layer.mvt_cache.replace(/\./,'_')}_tile on ${layer.mvt_cache} (tile);`);

  if (rows && rows.err) {
    console.log(`!!! ${layer.locale}.${layer.key} | ${layer.mvt_cache} (mvt cache) => Failed to create cache table`);
    return delete layer.mvt_cache;
  }

  console.log(`${layer.locale}.${layer.key} | ${layer.mvt_cache} (mvt cache) => Cache table created`);
}

async function chkLayerSelect(layer) {

  // Create default infoj if non exist on selectable layer.
  if (!layer.infoj) {
    layer.infoj = [
      {
        field: layer.qID,
        label: 'qID',
        type: 'text',
        inline: true
      }
    ];
  }

  let tables = layer.tables ? Object.values(layer.tables) : [layer.table];

  for (const table of tables){

    if (!table) return;

    let rows = await env.pg.dbs[layer.dbs](`SELECT ${layer.qID} FROM ${table} LIMIT 1`, null, 'no_log');

    if (rows.err) {
      console.log(`!!! ${layer.locale}.${layer.key} | ${table}.__${layer.qID} (${layer.format}) => '¡No bueno!'`);

      layer['__qID'] = layer.qID;
      return delete layer.qID;
    }

    console.log(`${layer.locale}.${layer.key} | ${table}.${layer.qID} (${layer.format}) => 'A-ok'`);
  }
}