const env = require('../../../../mod/env');

const sql_fields = require('../../../../mod/pg/sql_fields');

module.exports = async params => {

    // Clone the infoj from the memory workspace layer.
    const infoj = params.layer.infoj && JSON.parse(JSON.stringify(params.layer.infoj));

    // The fields array stores all fields to be queried for the location info.    
    const fields = (infoj && await sql_fields([], infoj, params.layer.qID, params.roles, params.locale)) || [];

    // Push JSON geometry field into fields array.
    fields.push(`\n   ST_asGeoJson(${params.layer.geom},4) AS geomj`);

    var q = `
        SELECT ${fields.join()}
        FROM ${params.table}
        WHERE ${params.layer.qID} = $1`;

    var rows = await env.dbs[params.layer.dbs](q, [params.id]);

    return rows;

};