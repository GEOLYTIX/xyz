const fs = require('fs');
const request = require('request');
const crypto = require('crypto');

const { Client } = require('pg');
const DBS = {};

Object.keys(process.env).map(function (key) {
    if (key.split('_')[0] === 'DBS') {
        DBS[key.split('_')[1]] = new Client({ connectionString: process.env[key] });
        DBS[key.split('_')[1]].connect();
    }
});

// Cloudinary
const cloudinary_options = {
    cloud_name: process.env.NAME_CLOUDINARY,
    api_key: process.env.KEY_CLOUDINARY,
    api_secret: process.env.SECRET_CLOUDINARY,
    upload_preset: process.env.UPLOAD_PRESET_CLOUDINARY
}

//const db = pgp(process.env.XYZ);

function save(req, res){
    
    req.setEncoding('binary');
    
    let dataURL = "data:image/jpeg;base64," + req.body.toString('base64');
        
    let url = "https://api.cloudinary.com/v1_1/" 
    + cloudinary_options.cloud_name 
    + "/image/upload/?upload_preset=" 
    + cloudinary_options.upload_preset;
    
    request.post({
        url: url,
        body: {"file": dataURL},
        json: true
    }, function(err, response, body){
        if(err){ 
            console.log(err);
        } else {
            
            let image_data = {
                "image_id": body.public_id,
                "image_url": body.secure_url
            },
                q = `UPDATE ${req.query.table} 
                     SET images = array_append(images, '${image_data.image_url}')
                     WHERE ${req.query.qID} = '${req.query.id}';`;
            
            // add filename to images field
            DBS[req.query.dbs].query(q)
                .then(result => {
                res.status(200).send(image_data);
            })
                .catch(err => console.log(err));
            
            req.on('error', function (err) {
                console.log(err);
            });
        }
    });
}

function remove(req, res){
    let image_src = decodeURIComponent(req.query.image_src),
        q = `UPDATE ${req.query.table} 
                SET images = array_remove(images, '${image_src}')
                WHERE ${req.query.qID} = '${req.query.id}';`,
        ts = Date.now(),
        param_str = "public_id=" + req.query.id + "&timestamp=" + ts + cloudinary_options.api_secret,
        
        url = "https://api.cloudinary.com/v1_1/" 
    + cloudinary_options.cloud_name + "/image/destroy?" 
    + "api_key=" + cloudinary_options.api_key 
    + "&public_id=" + req.query.id 
    + "&timestamp=" + ts 
    + "&signature=" + getSHA1(param_str);;
    
    DBS[req.query.dbs].query(q)
    .then(function(data){
        res.status(200);
        
        request.post({
            url: url
        }, function(err, response, body){
            if(err){
                console.log(err);
            } else {
                console.log(body);
            }
        });
    })
    .catch(function(err){ console.log(err);});
    
    req.on('error', function (err) {
        console.log(err);
    });
}

// generate signature for cloudinary API
function getSHA1(str){
    return crypto.createHash('sha1').update(str).digest('hex');
}


module.exports = {
    save: save,
    remove: remove
}