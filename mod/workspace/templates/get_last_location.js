module.exports = _ => {

  const table = _.layer.table || Object.values(_.layer.tables).find(tab => !!tab);

  const geom = _.layer.geom || Object.values(_.layer.geoms).find(tab => !!tab);

  return `
          SELECT
          ${_.layer.qID} as id
          FROM ${table}
          WHERE ${geom} IS NOT NULL AND ${_.layer.qID} IS NOT NULL
          ORDER BY ${_.layer.qID} DESC
          LIMIT 1`
}