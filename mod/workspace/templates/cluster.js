/**
### /workspace/templates/cluster

The cluster layer query template returns aggregated cluster features.

@module /workspace/templates/cluster
*/
export default (_) => {
  _.qID ??= _.layer.qID || null;
  _.geom ??= _.layer.geom;

  const fields = [];

  const aggFields = [];

  _.fieldsMap &&
    Array.from(_.fieldsMap.entries()).forEach((entry) => {
      const [key, value] = entry;
      fields.push(`(${value}) as ${key}`);

      aggFields.push(`
        CASE WHEN count(*)::int = 1 
        THEN (array_agg(${value}))[1] 
        END as ${key}`);
    });

  const where = _.viewport || `AND ${_.geom} IS NOT NULL`;

  // Calculate grid resolution (r) based on zoom level and resolution parameter.
  const r = parseInt((40075016.68 / Math.pow(2, _.z)) * _.resolution);

  return `
    SELECT
      ARRAY[x_round, y_round],
      count(*)::int,
      CASE
        WHEN count(*)::int = 1 THEN (array_agg(id))[1]::varchar
        ELSE CONCAT('!',(array_agg(id))[1]::varchar)
        END AS id
      
      ${fields.length ? ',' + aggFields.join() : ''}

    FROM (
      SELECT
        ${_.qID} as id,
        ${fields.length ? fields.join() + ',' : ''}
        round(ST_X(${_.geom}) / ${r}) * ${r} x_round,
        round(ST_Y(${_.geom}) / ${r}) * ${r} y_round
      FROM ${_.table}
      WHERE TRUE ${where} \${filter}) grid

    GROUP BY x_round, y_round;`;
};
