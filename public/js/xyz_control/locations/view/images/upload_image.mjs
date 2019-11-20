export default _xyz => (entry, img, dataURL) => {

  const blob = _xyz.utils.dataURLtoBlob(dataURL);

  const xhr = new XMLHttpRequest();

  xhr.open('POST', _xyz.host + '/api/location/edit/images/upload?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: entry.location.layer,
    table: entry.location.table,
    field: entry.field,
    id: entry.location.id,
    token: _xyz.token
  }));

  xhr.setRequestHeader('Content-Type', 'application/octet-stream');

  xhr.onload = e => {

    if (e.target.status !== 200) return console.log('image_upload failed');

    const json = JSON.parse(e.target.responseText);

    img.style.opacity = 1;
    img.id = json.image_id;
    img.src = json.image_url;

    _xyz.utils.createElement({
      tag: 'button',
      options: {
        title: 'Delete image',
        className: 'cursor',
        textContent: 'Delete'
      },
      appendTo: img.parentNode,
      eventListener: {
        event: 'click',
        funct: e => {
          e.target.remove();
          entry.ctrl.delete_image(entry, img);
        }
      }
    });

  };

  img.style.opacity = '0';

  xhr.onprogress = e => {
    if (e.lengthComputable) {
      img.style.opacity = e.loaded / e.total;
    }
  };

  xhr.send(blob);
};