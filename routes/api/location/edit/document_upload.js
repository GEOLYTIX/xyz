const env = require('../../../../mod/env');

const crypto = require('crypto');

const request = require('request');

const fs = require('fs');

module.exports = fastify => {

	fastify.route({
		method: 'POST',
		url: '/api/location/edit/documents/upload',
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
					field: { type: 'string' },
				}
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
		handler: (req, res) => {

		    let
		    layer = req.params.layer,
		    table = req.query.table,
            qID = layer.qID,
            id = req.query.id,
            field = req.query.field,
            ts = Date.now(),
            
            public_id_arr = decodeURIComponent(req.query.public_id).split('.'),
            public_id_name =`${public_id_arr[0]}_${ts}`,
            ext = public_id_arr.pop(),
            public_id = `${public_id_name}.${ext}`;
            
            sig = crypto.createHash('sha1').update(`folder=${env.cloudinary[3]}&public_id=${public_id}&timestamp=${ts}${env.cloudinary[1]}`).digest('hex');

            var data = [];

            req.req.on('data', chunk => data.push(chunk));

            req.req.on('end', () => {

            	req.body = Buffer.concat(data);

            	request.post({
            		url: `https://api.cloudinary.com/v1_1/${env.cloudinary[2]}/raw/upload`,
            		body: {
            			public_id: public_id,
            			file: req.body.toString(),
            		    resource_type: 'raw',
            		    api_key: env.cloudinary[0],
            		    folder: env.cloudinary[3],
            		    timestamp: ts,
            		    signature: sig 
            		},
            		json: true
            	}, async (err, response, body) => {

            		if (err) return console.error(err);
            		//console.log(body);

            		var q = `UPDATE ${table} SET ${field} = array_append(${field}, '${body.secure_url}')
                    WHERE ${qID} = $1;`;

                    await env.dbs[layer.dbs](q, [id]);

                    res.code(200).send({
                    	'doc_id': body.public_id,
                     	'doc_url': body.secure_url
                     });

            	});
            });
		}
	});

}