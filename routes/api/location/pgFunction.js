const env = require('../../../mod/env');

module.exports = fastify => {

	fastify.route({
		method: "GET",
		url: "/api/location/pgfunction",
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
					pgFunction: { type: 'string' },
					id: { type: 'string' },
					filter: { type: 'string' }
				},
				required: ['locale', 'layer', 'pgFunction', 'id']
			}
		},
		preHandler: [
		   fastify.evalParam.token,
		   fastify.evalParam.locale,
		   fastify.evalParam.layer,
		   fastify.evalParam.roles,
		   fastify.evalParam.pgFunction
      ],
		handler: async (req, res) => {

			const layer = req.params.layer;

			const entry = layer.infoj.find(entry => entry.pgFunction === decodeURIComponent(req.query.pgFunction));

			const q = `SELECT * FROM ${entry.pgFunction}($1);`;

			const rows = await env.dbs[layer.dbs](q, [req.query.id]);

			if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

			res.code(200).send(rows);

		}
	});
}