module.exports = _ => {

  const layer = _.workspace.locales[_.locale].layers[_.layer]

  const table = layer.table || Object.values(layer.tables).find(tab => !!tab);

  const geom = layer.geom || Object.values(layer.geoms).find(tab => !!tab);

  return `
          SELECT
          ${layer.qID} as id
          FROM ${table}
          WHERE ${geom} IS NOT NULL AND ${layer.qID} IS NOT NULL
          ORDER BY ${layer.qID} DESC
          LIMIT 1`
}