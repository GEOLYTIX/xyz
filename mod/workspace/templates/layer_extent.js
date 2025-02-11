module.exports = `
  SELECT
    Box2D(
      ST_Transform(
        ST_SetSRID(
          ST_Extent(\${geom}),
          \${proj}),
        \${srid}))
  FROM \${table}
  WHERE true \${filter};`;
