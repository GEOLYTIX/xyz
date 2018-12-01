import _xyz from '../../../_xyz.mjs';

export default (record, entry, img) => {

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/location/edit/images/delete?' + _xyz.utils.paramString({
    locale: _xyz.locale,
    layer: record.location.layer,
    table: record.location.table,
    field: entry.field,
    id: record.location.id,
    image_id: img.id,
    image_src: encodeURIComponent(img.src),
    token: _xyz.token
  }));

  xhr.onload = e => {

    if (e.target.status !== 200) return;

    document.getElementById(img.id).remove();
  };

  xhr.send();
};