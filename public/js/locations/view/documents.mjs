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

	// Add docs if any
	for(let doc of entry.value){

		_td.appendChild(_xyz.utils.wire()`
		<div class="item">
		${(entry.edit) && _xyz.utils.wire()`
		<button
			class="xyz-icon icon-trash link-remove"
			data-name=${doc.replace(/^.*[\\\/]/, '')}
			data-href=${doc}
			onclick=${e => removeDocument(e)}>
		</button>`}		
		<a href=${doc}>${decodeURIComponent(decodeURIComponent(doc.split('/').pop()))}`)

	}

	if (!entry.edit) return;

	// Add document control.
	_td.appendChild(_xyz.utils.wire()`
	<div class="add xyz-icon icon-cloud-upload off-black-filter">
	<input
	type="file"
	accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document;"
	onchange=${e=>{

		const reader = new FileReader();

		const file = e.target.files[0];

		if (!file) return;

		const placeholder = _xyz.utils.wire()`<div class="item"><div class="xyz-icon loader">`;

		_td.insertBefore(placeholder, _td.childNodes[_td.childNodes.length - 1]); 

        reader.onload = readerOnload => {
			
			const xhr = new XMLHttpRequest();

			xhr.open('POST', _xyz.host +
				'/api/location/edit/documents/upload?' + _xyz.utils.paramString({
				locale: _xyz.workspace.locale.key,
				layer: entry.location.layer.key,
				table: entry.location.table,
				field: entry.field,
				qID: entry.location.qID,
				id: entry.location.id,
				public_id: file.name,
				token: _xyz.token
			}));
		  
			xhr.setRequestHeader('Content-Type', 'application/octet-stream');
		  
			xhr.onload = e => {
				
				if (e.target.status !== 200) return console.log('document_upload failed');

				const json = JSON.parse(e.target.responseText);

				_xyz.utils.bind(placeholder)`
				<div class="item">
				${(entry.edit) && _xyz.utils.wire()`
				<button
					class="xyz-icon icon-trash link-remove"
					data-name=${json.doc_id.replace(/^.*[\\\/]/, '')}
					data-href=${json.doc_url}
					onclick=${e => removeDocument(e)}>
				</button>`}
				<a href=${json.doc_url}>${json.doc_id.split('/').pop()}`
		  
			};
		  
			xhr.send(readerOnload.target.result);
        };

		reader.readAsDataURL(file);
		
		e.target.value = '';
	}}>`)

	function removeDocument(e) {

		if (!confirm('Remove document link?')) return;

		const doc = e.target;

		const xhr = new XMLHttpRequest();

		xhr.open('GET', _xyz.host +
			'/api/location/edit/documents/delete?' + _xyz.utils.paramString({
			locale: _xyz.workspace.locale.key,
			layer: entry.location.layer.key,
			table: entry.location.table,
			field: entry.field,
			id: entry.location.id,
			doc_id: doc.dataset.name,
			doc_src: encodeURIComponent(doc.dataset.href),
			token: _xyz.token
		}));
	
		xhr.onload = e => {
			if (e.target.status !== 200) return;
			doc.parentNode.remove();
		};
	
		xhr.send();
	}

}