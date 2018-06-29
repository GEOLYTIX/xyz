const crypto = require('crypto');
const images = process.env.IMAGES ? process.env.IMAGES.split(' ') : [];

function save(req, res, fastify){

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

        if(err) return console.error(err);

        let table = req.query.table,
            qID = req.query.qID == 'undefined' ? 'id' : req.query.qID,
            id = req.query.id;
       
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

function remove(req, res, fastify){

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
    },
    async (err, response, body) => {

        if (err) return console.error(err);

        let table = req.query.table,
            qID = req.query.qID == 'undefined' ? 'id' : req.query.qID,
            id = req.query.id
            image_src = decodeURIComponent(req.query.image_src);

        var q = `
        UPDATE ${table} SET
            images = array_remove(images, '${image_src}')
        WHERE ${qID} = $1;`;

        var db_connection = await fastify.pg[req.query.dbs].connect();
        await db_connection.query(q, [id]);
        db_connection.release();

        res.code(200).send();
    });
}

module.exports = {
    save: save,
    remove: remove
}