export default _xyz => entry => {

  if (!entry.value.length && !entry.edit) return entry.label_div.remove();

  if(entry.label_div) entry.label_div.style.gridColumn = "1 / 3";

  // add images if there are any
  for (let image of entry.value) {

    entry.listview.appendChild(_xyz.utils.wire()`
      <div
        class="${entry.class || ''}"
        style="grid-column: 1 / 3; position: relative;">
        <img src=${image} style="width:100%;">
        ${(entry.edit) && _xyz.utils.wire()`
        <button
          class="xyz-icon icon-trash img-remove"
          data-name=${image.replace(/.*\//, '').replace(/\.([\w-]{3})/, '')}
          data-src=${image}
          onclick=${e => removeDocument(e)}>
        </button>`}`)
  }

  if (!entry.edit) return;

    // Add document control.
  entry.listview.appendChild(_xyz.utils.wire()`
    <div class="list" style="grid-column: 1 / 3;">
    <div class="add xyz-icon icon-add-photo off-black-filter">
    <input
      type="file"
      accept="image/*;capture=camera"
      onchange=${e => {
        
        const reader = new FileReader();
      
        const file = e.target.files[0];
      
        if (!file) return;
      
        const placeholder = _xyz.utils.wire()`
          <div><div class="xyz-icon loader">`;
      
        entry.listview.insertBefore(placeholder, entry.listview.childNodes[entry.listview.childNodes.length - 1]);

        reader.onload = readerOnload => {
          
          const img = new Image();
          
          img.onload = () => {
            
            let
              canvas = _xyz.utils.wire()`<canvas>`,
              max_size = 1024,
              width = img.width,
              height = img.height;

            // resize
            if (width > height && width > max_size) {
              height *= max_size / width;
              width = max_size;

            } else if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }

            canvas.width = width;
            canvas.height = height;

            canvas.getContext('2d').drawImage(img, 0, 0, width, height);

            const dataURL = canvas.toDataURL('image/jpeg', 0.5);

            const xhr = new XMLHttpRequest();

            xhr.open('POST', _xyz.host + '/api/provider/cloudinary?' +
              _xyz.utils.paramString({
                resource_type: 'image',
                token: _xyz.token,
              }));

            xhr.setRequestHeader('Content-Type', 'application/octet-stream');
            xhr.responseType = 'json';

            xhr.onload = e => {

              if (e.target.status > 202) return console.error('image upload failed');

              const secure_url = e.target.response.secure_url;
              const public_id = e.target.response.public_id.replace(/.*\//, '').replace(/\.([\w-]{3})/, '');

              const _xhr = new XMLHttpRequest();

              _xhr.open('GET', _xyz.host + '/api/query?' +
              _xyz.utils.paramString({
                template: 'set_field_array',
                locale: _xyz.workspace.locale.key,
                layer: entry.location.layer.key,
                table: entry.location.table,
                action: 'append',
                field: entry.field,
                secure_url: secure_url,
                id: entry.location.id,
                token: _xyz.token
              }));
              _xhr.setRequestHeader('Content-Type', 'application/json');
              _xhr.responseType = 'json';
              _xhr.onload = _e => {
            
                if (_e.target.status > 202) return;
            
                _xyz.utils.bind(placeholder)`
                  <img src=${secure_url}>
                    ${(entry.edit) && _xyz.utils.wire()`
                      <button
                        class="xyz-icon icon-trash img-remove"
                        data-name=${public_id}
                        data-src=${secure_url}
                        onclick=${e => removeDocument(e)}>
                      </button>`}`
            
              };
              _xhr.send();

            };

            xhr.send(_xyz.utils.dataURLtoBlob(dataURL));
          };

          img.src = readerOnload.target.result;
        };

        reader.readAsDataURL(file);

        e.target.value = '';
      }}>`);


  function removeDocument(e) {

    if (!confirm('Remove image?')) return;

    const img = e.target;

    const xhr = new XMLHttpRequest();

    xhr.open('GET', _xyz.host + '/api/provider/cloudinary?' +
      _xyz.utils.paramString({
        destroy: true,
        public_id: img.dataset.name,
        token: _xyz.token,
      }));

    xhr.onload = e => {
      if (e.target.status > 202) return;

      const _xhr = new XMLHttpRequest();

      _xhr.open('GET', _xyz.host + '/api/query?' +
      _xyz.utils.paramString({
        template: 'set_field_array',
        locale: _xyz.workspace.locale.key,
        layer: entry.location.layer.key,
        table: entry.location.table,
        action: 'remove',
        field: entry.field,
        secure_url: img.dataset.src,
        id: entry.location.id,
        token: _xyz.token
      }));
      _xhr.setRequestHeader('Content-Type', 'application/json');
      _xhr.responseType = 'json';
      _xhr.onload = _e => {
    
        if (_e.target.status > 202) return;
    
        img.parentNode.remove();
    
      };
      _xhr.send();
      
    }

    xhr.send()
  }

}