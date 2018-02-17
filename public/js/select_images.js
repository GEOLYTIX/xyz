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
        className: 'material-icons cursor',
        textContent: 'add_a_photo'
    });
    add_img_label.appendChild(add_img_icon);

    let add_img = utils.createElement('input', {
        id: 'addImage_' + record.letter,
        type: 'file',
        accept: 'images/*'
    });
    img_td.appendChild(add_img);

    // add images if there are any
    for (let image of images) {
        img_td = document.createElement('td');
        img_tr.appendChild(img_td);
        img_td.appendChild(utils.createElement('img', {
            id: image,
            src: localhost + 'images/' + image
        }));
    }

    // add change event 
    add_img.addEventListener('change', function () {

        // image actions to cloud save or delete an image
        let img_actions = utils.createElement('div', {
            className: 'img-actions'
        });

        let btn_save = utils.createElement('button', {
            title: 'Save image',
            innerHTML: '<i class="material-icons">cloud_upload</i>'
        });
        img_actions.appendChild(btn_save);

        let btn_del = utils.createElement('button', {
            title: 'Delete image',
            innerHTML: '<i class="material-icons">delete_forever</i>'
        });
        img_actions.appendChild(btn_del);

        let newImage = document.createElement('td');
        newImage.appendChild(img_actions);

        // display selected image
        let reader = new FileReader();
        reader.onload = function (_re) {

            let img = new Image();
            img.onload = function (_ie) {

                let canvas = document.createElement('canvas'),
                    max_size = _xyz.layers.image_max_size,
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

                let dataURL = canvas.toDataURL('image/*'),
                    blob = utils.dataURLToBlob(dataURL);

                _xyz.select.blob = blob;

                newImage.appendChild(utils.createElement('img', {
                    src: dataURL
                }));
            }

            img.src = _re.target.result;

        }
        this.files[0].size < (1024 * 1024 * 50) ?
            reader.readAsDataURL(this.files[0]) :
            alert('Selected image is too large.');


        // insert new image before last image
        img_tr.insertBefore(newImage, img_tr.childNodes[1]);

        // delete latest image 
        btn_del.addEventListener('click', function () {
            let _img_row = document.getElementById('img-container_' + id),
                _input = document.getElementById('images_' + id);

            // remove image
            _img_row.removeChild(_img_row.childNodes[0]);
            //enable file input
            _input.disabled = false;
            // clear file list
            _input.value = '';
        });

        // save image
        btn_save.addEventListener('click', function () {
            upload_image(_xyz.select.blob);
        });

        function upload_image(blob) {
            let xhr = new XMLHttpRequest(),
                feature = record.layer.id,
                dbs = _xyz.countries[_xyz.country].layers[record.layer.layer].dbs,
                params = utils.paramString({
                    dbs: dbs,
                    feature: feature,
                    type: blob.type
                }),
                url = localhost + 'q_images?' + params;

            xhr.open("POST", url);
            xhr.setRequestHeader("Content-Type", "application/octet-stream");
            xhr.onload = function () {
                if (this.status === 200) {
                    // remove cloud upload button here <<<<
                    console.log(this.response);
                }
            }
            xhr.send(blob);
        }

    });

    return img_container;
}

module.exports = {
    addImages: addImages
}