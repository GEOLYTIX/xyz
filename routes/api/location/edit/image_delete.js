module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/location/edit/images/delete',
    beforeHandler: fastify.auth([fastify.authAPI]),
    handler: (req, res) => {

      const cloudinary = process.env.CLOUDINARY ? process.env.CLOUDINARY.split(' ') : [];

      let
        ts = Date.now(),
        sig = require('crypto').createHash('sha1').update(`public_id=${req.query.image_id}&timestamp=${ts}${cloudinary[1]}`).digest('hex');

      require('request').post({
        url: `https://api.cloudinary.com/v1_1/${cloudinary[2]}/image/destroy`,
        body: {
          'api_key': cloudinary[0],
          'public_id': req.query.image_id,
          'timestamp': ts,
          'signature': sig
        },
        json: true
      }, async (err, response, body) => {

        if (err) return console.error(err);

        const token = req.query.token ?
          fastify.jwt.decode(req.query.token) : { access: 'public' };

        let
          layer = global.workspace[token.access].config.locales[req.query.locale].layers[req.query.layer],
          table = req.query.table,
          field = req.query.field,
          qID = layer.qID ? layer.qID : 'id',
          id = req.query.id,
          image_src = decodeURIComponent(req.query.image_src);

        // Check whether string params are found in the settings to prevent SQL injections.
        if ([table, qID]
          .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
          return res.code(406).send('Invalid parameter.');
        }

        var q = `
        UPDATE ${table} SET ${field} = array_remove(${field}, '${image_src}')
        WHERE ${qID} = $1;`;

        await global.pg.dbs[layer.dbs](q, [id]);

        res.code(200).send('Image deleted.');
      });

    }
  });
};