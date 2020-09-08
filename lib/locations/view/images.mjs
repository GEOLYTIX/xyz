export default _xyz => entry => {

  if (!(entry.value || []).length && !entry.edit) return entry.title_div.remove();

  if(entry.title_div) entry.title_div.style.gridColumn = "1 / 3";

  let images_grid = _xyz.utils.html.node`
  <div class="images-grid" style="position: relative; display: flex; flex-wrap: wrap; grid-column: 1 / 3; max-height: 400px; overflow-y: scroll;"
  >`;

  entry.listview.appendChild(images_grid);

  // add images if there are any
  for (let image of entry.value) {

      images_grid.appendChild(_xyz.utils.html.node`
      <div
        class="${entry.class || ''}" style="position: relative; width: 90px; height: 90px; flex-grow: 1;">
        <img src=${image} style="width: 100%; height: 100%; object-fit: cover; padding: 2px; border-radius: 2px;"
        onclick=${ e => {

          if(!document.getElementById('modalOverlay')) return;
        
          document.getElementById('modalOverlay').style.display = 'block';

          document.getElementById('modalOverlay').childNodes[entry.value.indexOf(e.target.src) + 1].scrollIntoView();

          }
        }
        >
        ${(entry.edit) && _xyz.utils.html.node`
        <button
          class="xyz-icon icon-trash img-remove"
          data-name=${image.replace(/.*\//, '').replace(/\.([\w-]{3})/, '')}
          data-src=${image}
          onclick=${e => removeDocument(e)}>
        </button>`}`)
  }

  if (!entry.edit) return;

  if(document.getElementById('modalOverlay')) {

    document.getElementById('modalOverlay').appendChild(_xyz.utils.html.node`
      <span onclick=${
        e => {
          document.getElementById('modalOverlay').style.display = 'none';
        }
      }
      >&times;`);

    for(let img of entry.value) {
      document.getElementById('modalOverlay').appendChild(
        _xyz.utils.html.node`
        <div><img style="padding-top: 40px;" src=${img}>
        `);
    }
  }


    // Add document control.
  entry.listview.appendChild(_xyz.utils.html.node`
    <div class="list" style="grid-column: 1 / 3;">
    <div class="add xyz-icon icon-add-photo off-black-filter">
    <input
      type="file"
      accept="image/*;capture=camera"
      onchange=${e => {
        
        const reader = new FileReader();
      
        const file = e.target.files[0];
      
        if (!file) return;

        const placeholder = _xyz.utils.html.node`
          <div
          class="${entry.class || ''}" 
          style="position: relative; width: 90px; height: 90px; flex-grow: 1;"
          onclick=${
            e => {

              if(!document.getElementById('modalOverlay')) return;

              document.getElementById('modalOverlay').style.display = 'block';

              Array.from(document.querySelectorAll('#modalOverlay img')).some(node => {
                if(node.src === e.target.src) return node.scrollIntoView();
              });

            }
          }
          >`;

        images_grid.appendChild(placeholder);

        reader.onload = readerOnload => {
          
          const img = new Image();
          
          img.onload = () => {
            
            let
              canvas = _xyz.utils.html.node`<canvas>`,
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
                public_id: file.name.replace(/.*\//, '').replace(/\.([\w-]{3})/, ''),
                resource_type: 'image'
              }));

            xhr.setRequestHeader('Content-Type', 'application/octet-stream');
            xhr.responseType = 'json';

            xhr.onload = e => {

              if (e.target.status > 202) return console.error('image upload failed');

              const secure_url = e.target.response.secure_url;
              const public_id = e.target.response.public_id;//.replace(/.*\//, '').replace(/\.([\w-]{3})/, '');

              const _xhr = new XMLHttpRequest();

              _xhr.open('GET', _xyz.host + '/api/query?' +
              _xyz.utils.paramString({
                template: 'set_field_array',
                locale: _xyz.locale.key,
                layer: entry.location.layer.key,
                table: entry.location.table,
                action: 'append',
                field: entry.field,
                secure_url: secure_url,
                id: entry.location.id
              }));
              _xhr.setRequestHeader('Content-Type', 'application/json');
              _xhr.responseType = 'json';
              _xhr.onload = _e => {
            
                if (_e.target.status > 202) return;
            
                _xyz.utils.bind(placeholder)`
                  <img src=${secure_url} style="width: 100%; height: 100%; object-fit: cover; padding: 2px; border-radius: 2px;">
                    ${(entry.edit) && _xyz.utils.html.node`
                      <button
                        class="xyz-icon icon-trash img-remove"
                        data-name=${public_id}
                        data-src=${secure_url}
                        onclick=${e => removeDocument(e)}>
                      </button>`}`

                if(document.getElementById('modalOverlay')) document.getElementById('modalOverlay').appendChild(_xyz.utils.html.node`<div><img style="padding-top: 40px;" src=${secure_url}>`);
            
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
        public_id: img.dataset.name
      }));

    xhr.onload = e => {
      if (e.target.status > 202) return;

      const _xhr = new XMLHttpRequest();

      _xhr.open('GET', _xyz.host + '/api/query?' +
      _xyz.utils.paramString({
        template: 'set_field_array',
        locale: _xyz.locale.key,
        layer: entry.location.layer.key,
        table: entry.location.table,
        action: 'remove',
        field: entry.field,
        secure_url: img.dataset.src,
        id: entry.location.id
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