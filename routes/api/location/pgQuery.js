const env = require('../../../mod/env');

const fetch = require('node-fetch');

module.exports = fastify => {

	fastify.route({
		method: "GET",
		url: "/api/location/pgquery",
		preValidation: fastify.auth([
			(req, res, next) => fastify.authToken(req, res, next, {
				public: true
			})
		]),
		schema: {
			querystring: {
				type :'object',
				properties: {
					token: { type: "string" },
					locale: { type: "string" },
					layer: { type: 'string' },
					pgquery: { type: 'string' },
					id: { type: 'string' },
					filter: { type: 'string' }
				},
				required: ['locale', 'layer', 'pgquery', 'id']
			}
		},
		preHandler: [
		   fastify.evalParam.token,
		   fastify.evalParam.locale,
		   fastify.evalParam.layer,
		   fastify.evalParam.roles,
      ],
		handler: async (req, res) => {

			let query;

			if (req.query.pgquery.toLowerCase().includes('api.github')) {

				const response = await fetch(
				  req.query.pgquery,
				  { headers: new fetch.Headers({ Authorization: `Basic ${Buffer.from(env.keys.GITHUB).toString('base64')}` }) });
		
				const b64 = await response.json();
				const buff = await Buffer.from(b64.content, 'base64');
				query = await buff.toString('utf8');
			}

			const layer = req.params.layer;

			const rows = await env.dbs[layer.dbs](query, [req.query.id]);

			if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

			res.code(200).send(rows);

		}
	});
}