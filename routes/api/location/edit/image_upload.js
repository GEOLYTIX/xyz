const env = require('../../../../mod/env');

const crypto = require('crypto');

const request = require('request');

module.exports = fastify => {

  fastify.route({
    method: 'POST',
    url: '/api/location/edit/images/upload',
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
        ts = Date.now(),
        sig = crypto.createHash('sha1').update(`folder=${env.cloudinary[3]}&timestamp=${ts}${env.cloudinary[1]}`).digest('hex');

      var data = [];

      req.req.on('data', chunk => data.push(chunk));

      req.req.on('end', () => {

        req.body = Buffer.concat(data);

        request.post({
          url: `https://api.cloudinary.com/v1_1/${env.cloudinary[2]}/image/upload`,
          body: {
            'file': `data:image/jpeg;base64,${req.body.toString('base64')}`,
            'api_key': env.cloudinary[0],
            'folder': env.cloudinary[3],
            'timestamp': ts,
            'signature': sig
          },
          json: true
        }, async (err, response, body) => {

          if (err) return console.error(err);

          var q = `
            UPDATE ${table}
            SET ${field} = array_append(${field}, '${body.secure_url}')
            WHERE ${qID} = $1;`;

          // add filename to images field
          await env.dbs[layer.dbs](q, [id]);

          res.code(200).send({
            'image_id': body.public_id,
            'image_url': body.secure_url
          });
        });

      });
      
    }

  });
};