const env = require('../../../../mod/env');

const sql_fields = require('../../../../mod/pg/sql_fields');

module.exports = fastify => {

    fastify.route({
        method: 'GET',
        url: '/api/location/select/isoline',
        preValidation: fastify.auth([
            (req, res, next) => fastify.authToken(req, res, next, {
                public: true
            })
        ]),
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    token: { type: 'string' },
                    locale: { type: 'string' },
                    layer: { type: 'string' },
                    table: { type: 'string' },
                    id: { type: 'string' },
                },
                required: ['locale', 'layer', 'table', 'id']
            }
        },
        preHandler: [
            fastify.evalParam.token,
            fastify.evalParam.locale,
            fastify.evalParam.layer,
            fastify.evalParam.roles
        ],
        handler: async (req, res) => {

            let
                layer = req.params.layer,
                table = req.query.table;

            // Query field for updated infoj
            const infoj = JSON.parse(JSON.stringify(layer.infoj));

            // The fields array stores all fields to be queried for the location info.
            const fields = await sql_fields([], infoj, layer.qID);

            var q = `
            SELECT ${fields.join()}
            FROM ${table}
            WHERE ${layer.qID} = $1;`;

            var rows = await env.dbs[layer.dbs](q, [req.query.id]);

            if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

            // Iterate through infoj entries and assign values returned from query.
            infoj.forEach(entry => {
                if (rows[0][entry.field]) entry.value = rows[0][entry.field];
            });

            return res.code(200).send(infoj);

        }
    });
};