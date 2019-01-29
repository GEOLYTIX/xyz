module.exports = async (fields, infoj, qID) => {

  // Iterate through infoj and push individual entries into fields array.
  await infoj.forEach(entry => {

    if (entry.lookup) {
    
      if (!qID
        || !entry.field
        || !entry.lookup.table_a
        || !entry.lookup.table_b
        || !entry.lookup.geom_a
        || !entry.lookup.geom_b) return;
        
      return fields.push(`
        CASE WHEN (
          SELECT ${entry.lookup.aggregate || 'SUM'}(${entry.fieldfx || entry.field})
          FROM
            ${entry.lookup.table_a} a,
            ${entry.lookup.table_b} b
          WHERE
            a.${qID} = $1
            AND
            ${entry.lookup.condition || 'ST_INTERSECTS'}(a.
            ${entry.lookup.geom_a},
            b.${entry.lookup.geom_b}) ) > 0 THEN
            (
            SELECT ${entry.lookup.aggregate || 'SUM'}(${entry.fieldfx || entry.field})
            FROM
              ${entry.lookup.table_a} a,
              ${entry.lookup.table_b} b
            WHERE
              a.${qID} = $1
            AND
              ${entry.lookup.condition || 'ST_INTERSECTS'}(a.
              ${entry.lookup.geom_a},
              b.${entry.lookup.geom_b}) 
        ) ELSE NULL END AS "${entry.field}"
      `);
    
    }
    
    if (entry.field) return fields.push(`\n   ${entry.fieldfx || entry.field} AS ${entry.field}`);
    
  });

  return fields;

};
