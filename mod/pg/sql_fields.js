const sql_filter = require('./sql_filter');

module.exports = async (fields, infoj, qID, roles, locale) => {

  // Iterate through infoj and push individual entries into fields array
  await infoj.forEach(async entry => {

    if (entry.columns) return;

    if(entry.type === 'key') return;

    //if (entry.withSelect) return;

    if (entry.clusterArea) {

      if (!qID
        || !entry.field
        || !entry.clusterArea.area
        || !entry.clusterArea.cluster
        || !entry.clusterArea.area_geom
        || !entry.clusterArea.cluster_geom) return;

      let q = `
      (
        SELECT b.${entry.fieldfx || entry.field}
        FROM
          ${entry.clusterArea.cluster} a,
          ${entry.clusterArea.area} b
        WHERE
          a.${qID} = $1
          AND
          ${entry.clusterArea.condition || 'ST_INTERSECTS'}(
            b.${entry.clusterArea.area_geom},
            a.${entry.clusterArea.cluster_geom}
          ) LIMIT 1
      ) AS ${entry.field}`;
        
      return fields.push(q);
    }

    if (entry.lookup) {
    
      if (!qID
        || !entry.field
        || !entry.lookup.table_a
        || !entry.lookup.table_b
        || !entry.lookup.geom_a
        || !entry.lookup.geom_b) return;

      let filter = {};

      if(roles) await roles.forEach(async role => {

        if (!entry.lookup.layer_roles) return;

        const layer_roles = locale.layers[entry.lookup.layer_roles].roles;

        if (!layer_roles) return;
   
        Object.assign(filter, layer_roles[role]);
    
      });

      const filter_sql = await sql_filter(filter);

      let q = `
      (
        SELECT ${entry.fieldfx || `${entry.lookup.aggregate || 'SUM'}(${entry.field})`}
        FROM
          ${entry.lookup.table_a} a,
          ${entry.lookup.table_b} b
        WHERE
          a.${qID} = $1
          AND
          ${entry.lookup.condition || 'ST_INTERSECTS'}(
            a.${entry.lookup.geom_a},
            b.${entry.lookup.geom_b}
          )
          ${typeof filter_sql !== 'undefined' ? filter_sql : ''}
      ) AS ${entry.field}`;
       
      return fields.push(q);
    
    }
    
    if (entry.field) return fields.push(`\n   ${entry.fieldfx || entry.field} AS ${entry.field}`);
    
  });

  return fields;

};

async function role_filter(locale, layer, roles) {

  if (!layer || !roles.length) return;
  
  const layer_roles = locale.layers[layer].roles;

  if (!Object.keys(layer_roles).some(
    role => roles.includes(role)
  )) return;

  let filter = {};

  await roles.forEach(async role => {
   
    filter = Object.assign(filter, layer_roles[role]);

  });

  const filter_sql = await sql_filter(filter);

  return filter_sql;

}
