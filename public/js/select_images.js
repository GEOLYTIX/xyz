function addImages(record, key, table){
    //console.log(record);
    let id = record.letter,
        feature = record.layer.qID,
        images = record.layer.infoj[key].value.reverse() || [];
    
    //console.log(record);
    
    let _tr = document.createElement('tr'),
        _img_tr = document.createElement('tr'),
        _td = document.createElement('td'),
        _div = document.createElement('div');
    
    _img_tr.id = 'img-container_' + id;
    _div.classList = 'img-container';
    _td.classList = 'lv-0';
    _td.colSpan = '2';
    
    // add images if there are any
    if(images.length){
        for(let image of images){
            let _img_td = document.createElement('td'),
                _img = document.createElement('img');
            
            _img.src =  localhost + 'images/' + image;
            _img_td.appendChild(_img);
            _img_tr.appendChild(_img_td);
        }
    }
    // add image picker
    let add_img = document.createElement('input'),
        add_td = document.createElement('td'),
        add_tr = document.createElement('tr');
    
    add_img.type = 'file';
    add_img.id = 'images_' + id;
    add_img.name = 'images_' + id;
    add_img.accept = 'images/*';
    
    add_td.colSpan = '2';
    
    add_td.appendChild(add_img);
    add_tr.appendChild(add_td);
    
    _div.appendChild(_img_tr);
    _td.appendChild(_div);
    _tr.appendChild(_td);
    table.appendChild(_tr);
    
    table.appendChild(add_tr);
    
    // add change event 
    document.getElementById('images_' + id).addEventListener('change', function(){
        this.disabled = true;
        _xyz.select.upload = this.files;
        
        let img_actions = document.createElement('div'),
            new_td = document.createElement('td'),
            
            btn_add = document.createElement('button'),
            btn_save = document.createElement('button'), 
            btn_del = document.createElement('button');
        
        // name buttons
        btn_add.title = 'Replace image';
        btn_save.title = 'Save image';
        btn_del.title = 'Delete image';
        // set ids for buttons
        btn_add.id = 'img-add';
        btn_save.id = 'img-save';
        btn_del.id = 'img-del';
        // set icons for buttons
        btn_add.innerHTML = '<i class="material-icons">camera_alt</i>';
        btn_save.innerHTML = '<i class="material-icons">cloud_upload</i>';
        btn_del.innerHTML = '<i class="material-icons">delete_forever</i>';
        
        img_actions.classList = 'img-actions';
        
        img_actions.appendChild(btn_save);
        img_actions.appendChild(btn_add);
        img_actions.appendChild(btn_del);
        // add image actions
        new_td.appendChild(img_actions);
        // display selected image
        display_image(_xyz.select.upload);
        
        function display_image(fileObject){
            let _reader = new FileReader(),
                _new_img = document.createElement('img'),
                _input = document.getElementById('images_' + id);
            
            _reader.onload = function(_re){
                let _imageObj = new Image();
                
                _imageObj.onload = function(_ie){
                    let _canvas = document.createElement('canvas'),
                        max_size = _xyz.layers.image_max_size,
                        width = _imageObj.width,
                        height = _imageObj.height;
                    
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
                    _canvas.width = width;
                    _canvas.height = height;
                    _canvas.getContext('2d').drawImage(_imageObj, 0, 0, width, height);
                    
                    let dataURL = _canvas.toDataURL('image/*'),
                        blob = utils.dataURLToBlob(dataURL);
                    
                    //console.log('width: ' + width);
                    //console.log('height: ' + height);
                    //console.log(blob);
                    _xyz.select.blob = blob;
                    
                    _new_img.src = dataURL;
                    //_new_img.style.height = '160px';
                    
                    //new_td.appendChild(img_actions);
                    new_td.appendChild(_new_img);
        
                    _input.disabled = false;
                    _input.value = '';
                }
                _imageObj.src = _re.target.result;
            }
            if(fileObject[0].size < 1024*1024*50) {
                _reader.readAsDataURL(fileObject[0]);
            } else {
                alert('Selected image is too large.');
            }
        }
        
        let img_container = document.querySelector('div #img-container_' + id);
        img_container.insertBefore(new_td, img_container.childNodes[0]);
        
        // delete latest image 
        document.getElementById('img-del').addEventListener('click', function(){
            let _img_row = document.getElementById('img-container_' + id),
                _input = document.getElementById('images_'+ id);
            
            // remove image
            _img_row.removeChild(_img_row.childNodes[0]);
            //enable file input
            _input.disabled = false;
            // clear file list
            _input.value = '';
        });
        
        // replace newly added image
        document.getElementById('img-add').addEventListener('click', function(){
            let _img_row = document.getElementById('img-container_' + id),
                _input = document.getElementById('images_' + id);
            
            _img_row.removeChild(_img_row.childNodes[0]);
            // clear file list
            _input.value = '';
            // enable file input 
            _input.disabled = false;
            _input.click();
        });
        
        // save image
        document.getElementById('img-save').addEventListener('click', function(){
            upload_image(_xyz.select.blob);
        });
        
        function remove_image_actions(){
            let _container = document.querySelector('div #img-container_' + id + ' .img-actions'),
                _input = document.getElementById('images_' + id);
            
            _container.remove();
            // clear file list
            _input.value = '';
            // enable file input 
            _input.disabled = false;
        }
        
        function upload_image(blob){
            let xhr = new XMLHttpRequest(),
                feature = record.layer.id,
                dbs = _xyz.countries[_xyz.country].layers[record.layer.layer].dbs,
                params = utils.paramString({
                    dbs: dbs,
                    feature: feature,
                    type: blob.type
                }),
                url = localhost + 'q_images?' + params;
            
            //console.log(url);
            
            //console.log(record.layer.layer);
            
            //console.log(_xyz.countries[_xyz.country].layers[record.layer.layer]);
            
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-Type", "application/octet-stream");
            xhr.onload = function(){
                if(this.status === 200){
                    remove_image_actions();
                    console.log(this.response);
                }
            }
            xhr.send(blob);
        }
        
    });
    
}

module.exports = {
    addImages: addImages
}