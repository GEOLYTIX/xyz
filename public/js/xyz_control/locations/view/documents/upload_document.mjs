export default _xyz => param => {

  const xhr = new XMLHttpRequest();

  xhr.open('POST', _xyz.host + '/api/location/edit/documents/upload?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: param.entry.location.layer.key,
    table: param.entry.location.table,
    field: param.entry.field,
    qID: param.entry.location.qID,
    id: param.entry.location.id,
    public_id: param.public_id,
    token: _xyz.token
  }));

  xhr.setRequestHeader('Content-Type', 'application/octet-stream');

  xhr.onload = e => {
		
    if (e.target.status !== 200) return console.log('document_upload failed');

    const json = JSON.parse(e.target.responseText);

    let public_id = json.doc_id.split('/').pop();

    param.doc.childNodes[0].dataset.name = public_id;
    param.doc.childNodes[0].textContent = public_id;
    param.doc.childNodes[0].href = json.doc_url;

    // add delete control
    param.doc.appendChild(_xyz.utils.wire()`
      <span title="Delete document" class="btn_del"
      onclick=${
        e => {
          e.target.parentNode.remove();
          param.entry.ctrl.delete_document({
            entry: param.entry, doc: param.doc.firstChild
          });
        }
      }
      ><i class="material-icons">clear`);

  };

  xhr.send(param.blob);

};