module.exports = fastify => {
  
  fastify.route({
    method: 'GET',
    url: '/api/location/edit/images/delete',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: global.public
      })
    ]),
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

        let
          layer = global.workspace.current.locales[req.query.locale].layers[req.query.layer],
          table = req.query.table,
          field = req.query.field,
          qID = layer.qID ? layer.qID : 'id',
          id = req.query.id,
          image_src = decodeURIComponent(req.query.image_src);


        var q = `
        UPDATE ${table} SET ${field} = array_remove(${field}, '${image_src}')
        WHERE ${qID} = $1;`;

        await global.pg.dbs[layer.dbs](q, [id]);

        res.code(200).send('Image deleted.');
      });

    }
  });
};