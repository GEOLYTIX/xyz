const env = require('../../../../mod/env');

const crypto = require('crypto');

const request = require('request');

module.exports = fastify => {
  
  fastify.route({
    method: 'GET',
    url: '/api/location/edit/images/delete',
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
        },
        required: ['locale', 'layer', 'table', 'id', 'field']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
      fastify.evalParam.layer,
      fastify.evalParam.roles,
      (req, res, next) => {
        fastify.evalParam.layerValues(req, res, next, ['table', 'field']);
      },
    ],
    handler: (req, res) => {

      let
        layer = req.params.layer,
        table = req.query.table,
        qID = layer.qID,
        id = req.query.id,
        field = req.query.field,
        image_src = decodeURIComponent(req.query.image_src),
        ts = Date.now(),
        sig = crypto.createHash('sha1').update(`public_id=${req.query.image_id}&timestamp=${ts}${env.cloudinary[1]}`).digest('hex');

      request.post({
        url: `https://api.cloudinary.com/v1_1/${env.cloudinary[2]}/image/destroy`,
        body: {
          'api_key': env.cloudinary[0],
          'public_id': req.query.image_id,
          'timestamp': ts,
          'signature': sig
        },
        json: true
      }, async (err, response, body) => {

        if (err) return console.error(err);

        var q = `
          UPDATE ${table}
          SET ${field} = array_remove(${field}, '${image_src}')
          WHERE ${qID} = $1;`;

        await env.dbs[layer.dbs](q, [id]);

        res.code(200).send('Image deleted.');
        
      });

    }

  });
};