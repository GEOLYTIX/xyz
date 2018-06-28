const utils = require('./utils');

function addImages(record, images) {

    // create image container
    let img_container = utils.createElement('div', {
        className: 'img-container'
    })

    // image table row which holds the image array
    let img_tr = document.createElement('tr');
    img_container.appendChild(img_tr);

    // add image picker
    let img_td = utils.createElement('td', {
        className: 'addImageCell',
    });
    img_tr.appendChild(img_td);

    let add_img_label = utils.createElement('label', {
        htmlFor: 'addImage_' + record.letter,
    });
    img_td.appendChild(add_img_label);

    let add_img_icon = utils.createElement('i', {
        className: 'material-icons cursor noselect',
        textContent: 'add_a_photo'
    });
    add_img_label.appendChild(add_img_icon);

    let add_img = utils.createElement('input', {
        id: 'addImage_' + record.letter,
        type: 'file',
        accept: 'image/*;capture=camera'
    });
    
    img_td.appendChild(add_img);

    // add images if there are any
    for (let image of images) {
        img_td = document.createElement('td');
        img_tr.appendChild(img_td);
        let _img = utils.createElement('img', {
            id: image.replace(/.*\//, '').replace(/\.([\w-]{3})/, ''),
            src: image
        });
        _img.style.border = '3px solid #EEE';

        // add delete button / control
        let btn_del = utils.createElement('button', {
            title: 'Delete image',
            className: 'btn_del',
            innerHTML: '<i class="material-icons">delete_forever</i>'
        });
        btn_del.addEventListener('click', function () {
            this.remove();
            remove_image(record, _img);
        });
        img_td.appendChild(btn_del);

        // append image to table cell
        img_td.appendChild(_img);
    }
    
    // empty the file input value
    add_img.addEventListener('click', function(){
        this.value = '';
    });
    
    // add change event 
    add_img.addEventListener('change', function () {

        let newImage = document.createElement('td');

        let reader = new FileReader();
        reader.onload = function (readerOnload) {

            let img = new Image();
            img.onload = function () {

                let canvas = document.createElement('canvas'),
                    max_size = 1024,
                    width = img.width,
                    height = img.height;

                // resize
                if (width > height) {
                    if (width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else {
                    if (height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);

                let dataURL = canvas.toDataURL('image/jpeg', 0.5);
                let _img = utils.createElement('img', {
                    src: dataURL
                });
                _img.style.border = '3px solid #090';

                // add delete button / control
                let btn_del = utils.createElement('button', {
                    title: 'Delete image',
                    className: 'btn_del',
                    innerHTML: '<i class="material-icons">delete_forever</i>'
                });
                btn_del.addEventListener('click', function () {
                    newImage.remove();
                });
                newImage.appendChild(btn_del);
                    
                // add save button / control
                let btn_save = utils.createElement('button', {
                    title: 'Save image',
                    className: 'btn_save',
                    innerHTML: '<i class="material-icons">cloud_upload</i>'
                });
                btn_save.addEventListener('click', function () {
                    btn_del.remove();
                    btn_save.remove();
                    upload_image(record, _img, utils.dataURLToBlob(dataURL));
                });
                newImage.appendChild(btn_save);

                newImage.appendChild(_img);

            }

            img.src = readerOnload.target.result;

        }
        reader.readAsDataURL(this.files[0]);

        // insert new image before last image
        img_tr.insertBefore(newImage, img_tr.childNodes[1]);
    });

    return img_container;
}

function upload_image(record, img, blob) {

    let xhr = new XMLHttpRequest();
    xhr.open('POST', host + 'api/images/new?' + utils.paramString({
        dbs: record.location.dbs,
        table: record.location.table,
        qID: record.location.qID,
        id: record.location.id
    }));
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.onload = function () {
        if (this.status === 200) {
            
            let json = JSON.parse(this.responseText);
                        
            img.style.border = '3px solid #eee';
            img.id = json.image_id;
            img.src = json.image_url;

            // add delete button / control
            let btn_del = utils.createElement('button', {
                title: 'Delete image',
                className: 'btn_del',
                innerHTML: '<i class="material-icons">delete_forever</i>'
            });
            btn_del.addEventListener('click', function () {
                this.remove();
                remove_image(record, img);
            });
            img.parentElement.appendChild(btn_del);
        }
    }
    img.style.opacity = '0'
    xhr.onprogress = function (e) {
        if (e.lengthComputable) {
            img.style.opacity = e.loaded / e.total;
        }
    }
    xhr.send(blob);
}

function remove_image(record, img) {
    
    document.getElementById(img.id).remove();
    
    let xhr = new XMLHttpRequest();
    xhr.open('GET', host + 'api/images/delete?' + utils.paramString({
        dbs: record.location.dbs,
        table: record.location.table,
        qID: record.location.qID,
        id: record.location.id,
        image_id: img.id,
        image_src: encodeURIComponent(img.src)
    }));
    xhr.onload = function () {
        if (this.status === 200) {
            //console.log(this.responseText);
        }
    }
    xhr.send();
}

module.exports = {
    addImages: addImages
}