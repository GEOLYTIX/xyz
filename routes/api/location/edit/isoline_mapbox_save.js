const env = require('../../../../mod/env');

const date = require('../../../../mod/date.js');

const infoj_values = require('../select/infoj_values.js');

module.exports = fastify => {

	fastify.route({
		method: 'POST',
		url: '/api/location/edit/isoline/mapbox/save',
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
                'Recent isoline': 'Mapbox',
                'Mode': req.body.profile || 'driving',
                'Minutes': req.body.minutes || 10,
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

			var rows = await infoj_values({
				locale: req.query.locale,
				layer: layer,
				table: table,
				id: req.query.id,
				roles: req.params.token.roles || []
			})

			if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

			// return 204 if no record was returned from database.
			if (rows.length === 0) return res.code(202).send('No rows returned from table.');

			// Send the infoj object with values back to the client.
			res.code(200).send(rows[0]);

        }
	});
}