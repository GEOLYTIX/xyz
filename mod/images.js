const crypto = require('crypto');
const images = process.env.IMAGES ? process.env.IMAGES.split(' ') : [];

function save(req, res, fastify) {

  let ts = Date.now(),
    sig = crypto.createHash('sha1').update(`folder=${images[4]}&timestamp=${ts}${images[2]}`).digest('hex');

  require('request').post({
    url: `https://api.cloudinary.com/v1_1/${images[3]}/image/upload`,
    body: {
      'file': `data:image/jpeg;base64,${req.body.toString('base64')}`,
      'api_key': images[1],
      'folder': images[4],
      'timestamp': ts,
      'signature': sig
    },
    json: true
  },
  async (err, response, body) => {

    if (err) return console.error(err);

    const token = req.query.token ?
      fastify.jwt.decode(req.query.token) : { access: 'public' };            

    let table = req.query.table,
      qID = req.query.qID ? req.query.qID : 'id',
      id = req.query.id;

    // Check whether string params are found in the settings to prevent SQL injections.
    if ([table, qID]
      .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
      return res.code(406).send('Parameter not acceptable.');
    }

    var q = `
        UPDATE ${table} SET
            images = array_append(images, '${body.secure_url}')
        WHERE ${qID} = $1;`;

    // add filename to images field
    var db_connection = await fastify.pg[req.query.dbs].connect();
    await db_connection.query(q, [id]);
    db_connection.release();

    res.code(200).send({
      'image_id': body.public_id,
      'image_url': body.secure_url
    });
  });
}

function remove(req, res, fastify) {

  let ts = Date.now(),
    sig = crypto.createHash('sha1').update(`public_id=${req.query.image_id}&timestamp=${ts}${images[2]}`).digest('hex');

  require('request').post({
    url: `https://api.cloudinary.com/v1_1/${images[3]}/image/destroy`,
    body: {
      'api_key': images[1],
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
      qID = layer.qID ? layer.qID : 'id',
      id = req.query.id,
      image_src = decodeURIComponent(req.query.image_src);

    // Check whether string params are found in the settings to prevent SQL injections.
    if ([table, qID]
      .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
      return res.code(406).send('Parameter not acceptable.');
    }

    var q = `
        UPDATE ${table} SET
            images = array_remove(images, '${image_src}')
        WHERE ${qID} = $1;`;

    var db_connection = await fastify.pg[layer.dbs].connect();
    await db_connection.query(q, [id]);
    db_connection.release();

    res.code(200).send();
  });
}

module.exports = {
  save: save,
  remove: remove
};