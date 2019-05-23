export default _xyz => param => {

	/*
	param => {
		entry: '',
		doc: '',
		public_id: '',
		blob: ''
	}
	*/

	console.log(param);

	const xhr = new XMLHttpRequest();

	let type = param.blob.split(',')[0] + ',';

	xhr.open('POST', _xyz.host + '/api/location/edit/documents/upload?' + _xyz.utils.paramString({
		locale: _xyz.workspace.locale.key,
		layer: param.entry.location.layer,
		table: param.entry.location.table,
		field: param.entry.field,
		qID: param.entry.location.qID,
		id: param.entry.location.id,
		type: param.type,
		public_id: param.public_id,
		token: _xyz.token
	}));

	console.log({
		layer: param.entry.location.layer,
		table: param.entry.location.table,
		field: param.entry.field,
		qID: param.entry.location.qID,
		id: param.entry.location.id,
		type: param.type,
		public_id: param.public_id,
		token: _xyz.token
	});


	xhr.setRequestHeader('Content-Type', 'application/octet-stream');

	xhr.onload = e => {
		
		if (e.target.status !== 200) return console.log('document_upload failed');

		const json = JSON.parse(e.target.responseText);

		param.doc.style.opacity = 1;
		param.doc.childNodes[0].id = json.doc_id;
		//doc.childNodes[0].textContent = decodeURIComponent(json.doc_id.split('/').pop());
		param.doc.childNodes[0].textContent = json.doc_id;
		param.doc.childNodes[0].href = json.doc_url;

		// add delete control
		_xyz.utils.createElement({
			tag: 'span',
			options: {
				title: 'Delete document',
				className: 'btn_del',
				innerHTML: '<i class="material-icons">clear</i>'
			},
			appendTo: param.doc,
			eventListener: {
				event: 'click',
				funct: e => {
					e.target.remove();
					delete_document({entry: entry, doc: doc});
				}
			}
		});
	}

	xhr.send(param.blob);

}