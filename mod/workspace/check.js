module.exports = async workspace => {
  
  // Set global workspace.
  global.workspace = {
    _defaults: await JSON.parse(require('fs').readFileSync('./workspaces/_defaults.json'), 'utf8')
  };

  console.log(' ');
  console.log('------Checking Workspace------');
  
  // Check whether workspace keys are valid or missing.
  await chkOptionals(workspace, global.workspace._defaults.ws);
  
  // Check locales.
  await chkLocales(workspace.locales);

  console.log('-----------------------------');
  console.log(' ');

  global.workspace.current = workspace;

  global.workspace.lookupValues = await createLookup(workspace); 
  
  return workspace;
};

async function createLookup(workspace) {
  
  // store all workspace string values in lookup arrays.
  const lookupValues = ['', 'geom', 'geom_3857', 'id', 'ST_asGeoJson(geom)', 'ST_asGeoJson(geom_4326)'];
  (function objectEval(o) {
    Object.keys(o).forEach((key) => {
      if (typeof key === 'string') lookupValues.push(key);
      if (typeof o[key] === 'string') lookupValues.push(o[key]);
      if (o[key] && typeof o[key] === 'object') objectEval(o[key]);
    });
  })(workspace);

  return lookupValues;
  
}

async function chkOptionals(chk, opt) {

  // Check defaults => workspace first.
  Object.keys(opt).forEach(key => {

    // Return if the object is optional.
    if (typeof opt[key] === 'object' && opt[key].optional) return;

    // Non optional keys will be written from the defaults to the workspace
    // if not already defined !(key in chk)
    if (!(key in chk) && opt[key] !== 'optional') {
      chk[key] = opt[key];
    }
  });
  
  // Check workspace => defaults second.
  Object.keys(chk).forEach(key => {
  
    // Optional may have been introduced as entries of default objects.
    if (chk[key] === 'optional') {
      return delete chk[key];
    }
  
    // Workspace key does not exist in defaults.
    if (!(key in opt)) {
  
      // Prefix key with double underscore and delete original.
      // Double underscore invalidates a key!
      chk['__' + key] = chk[key];
      delete chk[key];
    }
  });
  
}

async function chkLocales(locales) {   
  
  // Iterate through locales.
  for (const key of Object.keys(locales)) {
  
    // Set default locale.
    const
      locale = locales[key],
      _locale = global.workspace._defaults.locale;
  
    // Invalidate locale if it is not an object.
    if (typeof locale !== 'object') {
      locales['__' + key] = locale;
      return delete locales[key];
    }
  
    // Check whether locale keys are valid or missing.
    await chkOptionals(locale, _locale);
  
    // Check bounds.
    await chkOptionals(locale.bounds, _locale.bounds);
  
    // Check gazetteer.
    if (locale.gazetteer) await chkOptionals(locale.gazetteer, _locale.gazetteer);
  
    // Check layers in locale.
    await chkLayers(locale.layers, key);
  
  }

}

async function chkLayers(layers, locale_key) {

  // Iterate through loayers.
  for (const key of Object.keys(layers)) {

    const layer = layers[key];

    // Invalidate layer if it is not an object or does not have a valid layer format.
    if (typeof layer !== 'object'
        || !layer.format
        || !global.workspace._defaults.layers[layer.format]) {
      layers['__' + key] = layer;
      return delete locale.layers[key];
    }

    // Assign layer default from layer and format defaults.
    const _layer = Object.assign({},
      global.workspace._defaults.layers.default,
      global.workspace._defaults.layers[layer.format]
    );

    // Set layer key and name.
    layer.key = key;
    layer.name = layer.name || key;
    layer.locale = locale_key;

    // Check whether layer keys are valid or missing.
    await chkOptionals(layer, _layer);

    // Check whether layer.style keys are valid or missing.
    if (layer.style) await chkOptionals(layer.style, _layer.style);

    // Check whether the layer connects.
    await chkLayerConnect(layer, layers);

  }

}

// Checks PostGIS geometries, tile caches or 3rd party URL.
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
  uri = `${uri[0]}${uri[1] ? global.KEYS[uri[1]] : ''}`;

  // Replace subdomain (a) and x,y,z (0) location.
  uri = uri.replace(/\{s\}/i,'a').replace(/\{.\}/ig,'0');

  // Fetch results from Google maps places API.
  const fetched = await require(global.appRoot + '/mod/fetch')(uri, 'no_log');

  if (fetched._err) {

    console.log(`!!! ${layer.locale}.__${layer.key} (${layer.format}) => '¡No bueno!'`);

    // Make layer invalid if tiles service is not readable.
    layers['__'+layer.key] = layer;
    return delete layers[layer.key];
  }

  // Remove invalidation flag from layer if test is passed.
  layer.key = layer.key.replace(/^__/, '');
  layers[layer.key] = layer;
  delete layers['__'+layer.key];

  console.log(`${layer.locale}.${layer.key} (${layer.format}) => 'A-ok'`);
  
}

async function chkLayerGeom(layer, layers) {

  let tables = layer.tables ? Object.values(layer.tables) : [layer.table];

  for (const table of tables){

    // Don't invalidate layer with null in tables array.
    if (!table && tables.length > 1) continue;

    // Invalidate layer without table.
    if (!table) return invalidateLayer();

    // Invalidate layer if no dbs has been defined.
    if (!layer.dbs || !global.pg.dbs[layer.dbs]) {
      console.log(`!!! ${layer.locale}.__${layer.key} | ${table}.${layer.geom_3857 || layer.geom} (${layer.format}) => Missing or invalid DBS connection`);
      return invalidateLayer();
    }

    // Check whether table has layer geom or geom_3857 field.
    let rows = await global.pg.dbs[layer.dbs](`SELECT ${layer.geom_3857 || layer.geom} FROM ${table} LIMIT 1`, null, 'no_log');

    if (rows.err) {
      console.log(`!!! ${layer.locale}.${layer.key} | ${table}.${layer.geom_3857 || layer.geom} (${layer.format}) => ${rows.err.message}`);
      return invalidateLayer();
    }

    // Remove invalidation flag from layer if test is passed.
    layer.key = layer.key.replace(/^__/, '');
    layers[layer.key] = layer;
    delete layers['__'+layer.key];

    console.log(`${layer.locale}.${layer.key} | ${table}.${layer.geom_3857 || layer.geom} (${layer.format}) => 'A-ok'`);

    // Check whether the defined qID is returned.
    if (layer.qID) await chkLayerSelect(layer);

    // Check or create mvt_cache table.
    if (layer.mvt_cache) await chkMVTCache(layer);

  }

  function invalidateLayer() {
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
    let rows = await global.pg.dbs[layer.dbs](`SELECT z, x, y, mvt, tile FROM ${table}__mvts LIMIT 1`, null, 'no_log');

    if (rows && rows.err) await createMVTCache(layer, table);

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
          rows = await global.pg.dbs[layer.dbs](`TRUNCATE ${table}__mvts;`);

          if (rows.err) {
            return console.log(`!!! ${layer.locale}.${layer.key} | ${table}__mvts (mvt cache) => Failed to truncate cache table`);
          }

          return console.log(`${layer.locale}.${layer.key} | ${table}__mvts (mvt cache) => Cache table has been truncated`);
        }
      }

      return console.log(`${layer.locale}.${layer.key} | ${table}__mvts (mvt cache) => 'A-ok'`);

    }

    console.log(`${layer.locale}.${layer.key} | ${table}__mvts (mvt cache) => 'Huh? Cache table seems to be empty.'`);

  }
  
}

async function createMVTCache(layer, table){

  let rows = await global.pg.dbs[layer.dbs](`
    create table ${table}__mvts
    (
      z integer not null,
      x integer not null,
      y integer not null,
      mvt bytea,
      tile geometry(Polygon,3857),
      constraint ${table.replace(/\./,'_')}__mvts_z_x_y_pk
        primary key (z, x, y)
    );
    
    create index ${table.replace(/\./,'_')}__mvts_tile on ${table}__mvts (tile);`);

  if (rows && rows.err) {
    console.log(`!!! ${layer.locale}.${layer.key} | ${table}__mvts (mvt cache) => Failed to create cache table`);
    return layer.mvt_cache = false;
  }

  console.log(`${layer.locale}.${layer.key} | ${table}__mvts (mvt cache) => Cache table created`);

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

    let rows = await global.pg.dbs[layer.dbs](`SELECT ${layer.qID} FROM ${table} LIMIT 1`, null, 'no_log');

    if (rows.err) {
      console.log(`!!! ${layer.locale}.${layer.key} | ${table}.__${layer.qID} (${layer.format}) => '¡No bueno!'`);

      layer['__qID'] = layer.qID;
      return delete layer.qID;
    }

    console.log(`${layer.locale}.${layer.key} | ${table}.${layer.qID} (${layer.format}) => 'A-ok'`);

  }

}