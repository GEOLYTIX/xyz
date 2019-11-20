export default _xyz => entry => {

  if (!entry.value.length && !entry.edit) return entry.row.remove();

  if (entry.label_td) {
    entry.label_td.colSpan = '2';
  } else {
    entry.row.remove();
  }

  let _tr = _xyz.utils.wire()`<tr colSpan=2>`;

  entry.listview.appendChild(_tr);

  let _td = _xyz.utils.wire()`<td colSpan=2 class="list">`;

  _tr.appendChild(_td);

  // add images if there are any
  for (let image of entry.value) {

    _td.appendChild(_xyz.utils.wire()`
      <div class="item">
      <img src=${image}>
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
  _td.appendChild(_xyz.utils.wire()`
	<div class="add xyz-icon icon-add-photo off-black-filter">
	<input
    type="file"
    accept="image/*;capture=camera"
    onchange=${e => {
      
      const reader = new FileReader();
    
      const file = e.target.files[0];
    
      if (!file) return;
    
      const placeholder = _xyz.utils.wire()`<div class="item"><div class="xyz-icon loader">`;
    
      _td.insertBefore(placeholder, _td.childNodes[_td.childNodes.length - 1]);
    
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

          xhr.open('POST', _xyz.host +
            '/api/location/edit/images/upload?' + _xyz.utils.paramString({
              locale: _xyz.workspace.locale.key,
              layer: entry.location.layer.key,
              table: entry.location.table,
              field: entry.field,
              id: entry.location.id,
              token: _xyz.token
            }));

          xhr.setRequestHeader('Content-Type', 'application/octet-stream');

          xhr.onload = e => {

            if (e.target.status !== 200) return console.log('image_upload failed');

            const json = JSON.parse(e.target.responseText);

            _xyz.utils.bind(placeholder)`
            <div class="item">
            <img src=${json.image_url}>
            ${(entry.edit) && _xyz.utils.wire()`
            <button
              class="xyz-icon icon-trash img-remove"
              data-name=${json.image_id}
              data-src=${json.image_url}
              onclick=${e => removeDocument(e)}>
            </button>`}`

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

    xhr.open('GET', _xyz.host +
      '/api/location/edit/images/delete?' + _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: entry.location.layer.key,
        table: entry.location.table,
        field: entry.field,
        id: entry.location.id,
        image_id: img.dataset.name,
        image_src: encodeURIComponent(img.dataset.src),
        token: _xyz.token
      }));

    xhr.onload = e => {

      if (e.target.status !== 200) return;

      img.parentNode.remove();
    };

    xhr.send();
  }

};