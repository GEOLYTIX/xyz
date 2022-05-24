module.exports = {
    render: _ => {

        const layer = _.workspace.locales[_.locale].layers[_.layer]

        const table = layer.table || Object.values(layer.tables).find(tab => !!tab);

        return `
          SELECT
          ${layer.qID} as id
          FROM ${table}
          WHERE ${layer.geom} IS NOT NULL AND ${layer.qID} IS NOT NULL
          ORDER BY ${layer.qID} DESC
          LIMIT 1`
    }
}