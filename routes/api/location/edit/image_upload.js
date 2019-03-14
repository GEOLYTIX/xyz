module.exports = fastify => {
  fastify.route({
    method: 'POST',
    url: '/api/location/edit/images/upload',
    preHandler: fastify.auth([fastify.authAPI]),
    handler: (req, res) => {

      const cloudinary = process.env.CLOUDINARY ? process.env.CLOUDINARY.split(' ') : [];

      var data = [];

      req.req.on('data', chunk => data.push(chunk));

      req.req.on('end', () => {

        req.body = Buffer.concat(data);

        let
          ts = Date.now(),
          sig = require('crypto').createHash('sha1').update(`folder=${cloudinary[3]}&timestamp=${ts}${cloudinary[1]}`).digest('hex');

        require('request').post({
          url: `https://api.cloudinary.com/v1_1/${cloudinary[2]}/image/upload`,
          body: {
            'file': `data:image/jpeg;base64,${req.body.toString('base64')}`,
            'api_key': cloudinary[0],
            'folder': cloudinary[3],
            'timestamp': ts,
            'signature': sig
          },
          json: true
        }, async (err, response, body) => {

          if (err) return console.error(err);

          const token = req.query.token ?
            fastify.jwt.decode(req.query.token) : { access: 'public' };

          let
            table = req.query.table,
            field = req.query.field,
            qID = req.query.qID ? req.query.qID : 'id',
            id = req.query.id;

          // Check whether string params are found in the settings to prevent SQL injections.
          if ([table, qID]
            .some(val => (typeof val === 'string' && val.length > 0 && global.workspace['admin'].values.indexOf(val) < 0))) {
            return res.code(406).send('Invalid parameter.');
          }

          var q = `
          UPDATE ${table} SET ${field} = array_append(${field}, '${body.secure_url}')
          WHERE ${qID} = $1;`;

          // add filename to images field
          await global.pg.dbs[req.query.dbs](q, [id]);

          res.code(200).send({
            'image_id': body.public_id,
            'image_url': body.secure_url
          });
        });

      });
    }

  });
};