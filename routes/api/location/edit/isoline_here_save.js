const env = require('../../../../mod/env');

const fetch = require('../../../../mod/fetch');

const sql_fields = require('../../../../mod/pg/sql_fields');

const date = require('../../../../mod/date.js');

module.exports = fastify => {

	fastify.route({
		method: 'POST',
		url: '/api/location/edit/isoline/here/save',
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
					meta: { type: 'string' },
					id: {type: 'string'}
				},
				required: ['id']
			}
		},
		preHandler: [
		    fastify.evalParam.token,
            fastify.evalParam.locale,
            fastify.evalParam.layer,
            fastify.evalParam.roles,
            (req, res, next) => {
            	fastify.evalParam.layerValues(req, res, next, ['table', 'field']);
            }
        ],
        handler: async (req, res) => {

        	var meta_json;

        	if(req.query.meta) meta_json = {
        		'Recent isoline': 'Here',
        		'Mode': req.body.mode || 'car',
        		'Range type': req.body.rangetype || 'time',
        		'Type': req.body.type || 'fastest',
        		'Range': req.body.minutes || req.body.distance,
        		'Created': date()
        	};

        	let 
        	    layer = req.params.layer,
        	    table = req.query.table;

        	var q = `
        	UPDATE ${table}
        	SET ${req.query.field} = ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(req.body.isoline)}'), 4326), ${layer.srid})
        	${req.query.meta ? `, ${req.query.meta} = '${JSON.stringify(meta_json)}'` : ''}
        	WHERE ${layer.qID} = $1;`;

        	var rows = await env.dbs[layer.dbs](q, [req.query.id]);

        	if (rows.err) return res.code(500).send('PostgreSQL query error - please check backend logs.');

        	// Query field for updated infoj
            const infoj = JSON.parse(JSON.stringify(layer.infoj));

            // The fields array stores all fields to be queried for the location info.
            fields = await sql_fields([], infoj, layer.qID);

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

            // Send the infoj object with values back to the client.
            return res.code(200).send(infoj);

        }
	});
}