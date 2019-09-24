export default _xyz => (entry, img) => {

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/location/edit/images/delete?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: entry.location.layer.key,
    table: entry.location.table,
    field: entry.field,
    id: entry.location.id,
    image_id: img.id,
    image_src: encodeURIComponent(img.src),
    token: _xyz.token
  }));

  xhr.onload = e => {

    if (e.target.status !== 200) return;

    document.getElementById(img.id).parentNode.remove();
  };

  xhr.send();
};