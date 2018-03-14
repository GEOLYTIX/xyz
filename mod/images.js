const fs = require('fs');
const request = require('request');
const cloudinary = require('cloudinary');

const { Client } = require('pg');
const DBS = {};

Object.keys(process.env).map(function (key) {
    if (key.split('_')[0] === 'DBS') {
        DBS[key.split('_')[1]] = new Client({ connectionString: process.env[key] });
        DBS[key.split('_')[1]].connect();
    }
});

// Cloudinary settings
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CKEY,
    api_secret: process.env.CSECRET,
    upload_preset: process.env.CUPLOAD_PRESET,
    secure: true
});

//const db = pgp(process.env.XYZ);

function save(req, res){
    
    req.setEncoding('binary');
    
    let dataURL = "data:image/jpeg;base64," + req.body.toString('base64');
    
   /* cloudinary.uploader.unsigned_upload(dataURL, process.env.CLOUDINARY_UPLOAD_PRESET, function(error, result){
        if(errror){
            console.log(error);
        } else {
            let image_data = {
                'image_id': body.public_id,
                'image_url': body.secure_url
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
    });*/
        
    let url = "https://api.cloudinary.com/v1_1/" 
    + process.env.CLOUD_NAME 
    + "/image/upload/?upload_preset=" 
    + process.env.CUPLOAD_PRESET;
    
    request.post({
        url: url,
        body: {"file": dataURL},
        json: true
    }, function(err, response, body){
        if(err){ 
            console.log(err);
        } else { 
            //console.log(body);
            
            let image_data = {
                'image_id': body.public_id,
                'image_url': body.secure_url
            },
                q = `UPDATE ${req.query.table} 
                     SET images = array_append(images, '${image_data.image_url}')
                     WHERE ${req.query.qID} = '${req.query.id}';`;
            
            //console.log(image_data);
            
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



/*function save(req, res) {

    req.setEncoding('binary');

    let filename = `${req.query.id.replace('.', '+')}+${Date.now()}.jpg`;

    // save image to local drive
    fs.writeFile(process.env.IMAGES + filename, req.body, function (err) {
        if (err) throw err;
        console.log(filename + ' saved.');
    });

    let q = `UPDATE ${req.query.table} 
                SET images = array_append(images, '${filename}')
                WHERE ${req.query.qID} = '${req.query.id}';`;

    //console.log(q);

    // add filename to images field
    DBS[req.query.dbs].query(q)
        .then(result => {
            res.status(200).send({
                'image': filename
            });
        })
        .catch(err => console.log(err));

    req.on('error', function (err) {
        console.log(err);
    });

}*/

function remove(req, res){
    let image_src = decodeURIComponent(req.query.image_src);
    let q = `UPDATE ${req.query.table} 
                SET images = array_remove(images, '${image_src}')
                WHERE ${req.query.qID} = '${req.query.id}';`;
    
    //console.log(image_src);
    //console.log(q);
    
    // pop filename from images field
    /*DBS[req.query.dbs].query(q)
        .then(results => {
        //res.status(200).send(result);
        cloudinary.uploader.destroy(req.query.image_id, function(error, result){
            if(error){
                console.log(error);
            } else {
                //if(result.result === 'ok'){
                    res.status(200).send(result);
                //}
            }
    })
        .catch(err => console.log(err));
    });*/
    
    
    DBS[req.query.dbs].query(q)
    .then(function(data){
        res.status(200);
        cloudinary.uploader.destroy(req.query.image_id, function(error, result){
            if(error){
                console.log(error);
            } else {
                //res.status(200).send(result);
                console.log({"cloudinary_destroy": result});
            }
        })
    })
    .catch(function(err){ console.log(err);});
    
    //cloudinary.uploader.destroy(req.query.image_id, function(error, result){
    //    if(error){
    //        console.log(error);
    //    } else {
    //        if(result.result === 'ok'){
                // pop filename from images field

    //    }
    //});
    
    req.on('error', function (err) {
        console.log(err);
    });
}

/*function remove(req, res) {

    let q = `UPDATE ${req.query.table} 
                SET images = array_remove(images, '${req.query.filename.replace(/ /g, '+')}')
                WHERE ${req.query.qID} = '${req.query.id}';`;

    //console.log(q);

    // add filename to images field
    DBS[req.query.dbs].query(q)
        .then(result => {
            res.status(200).send({
                'image': req.query.filename.replace(/ /g, '+')
            });
        })
        .catch(err => console.log(err));

    req.on('error', function (err) {
        console.log(err);
    });

}*/

module.exports = {
    save: save,
    remove: remove
}