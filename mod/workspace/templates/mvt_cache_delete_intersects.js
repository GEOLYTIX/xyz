module.exports = `
DELETE 
    FROM \${mvt_cache}
    WHERE ST_Intersects(tile, (
      SELECT \${geom}
      FROM \${table}
      WHERE \${qID} = %{id}));`