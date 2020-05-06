export default _xyz => entry => {

	if (!entry.value.length && !entry.edit) return entry.label_div.remove();

	if(entry.label_div) entry.label_div.style.gridColumn = "1 / 3";

	// Add docs if any
	for (let doc of entry.value) {

	    entry.listview.appendChild(_xyz.utils.wire()`
		<div class="item" style="grid-column: 1 / 3;">
		${(entry.edit) && _xyz.utils.wire()`
		<button
			class="xyz-icon icon-trash link-remove"
			data-name=${doc.replace(/.*\//, '').replace(/\.([\w-]{3})/, '')}
			data-href=${doc}
			onclick=${e => removeDocument(e)}>
		</button>`}		
		<a href=${doc}>${decodeURIComponent(decodeURIComponent(doc.split('/').pop()))}`)

	}

	if (!entry.edit) return;

    entry.listview.appendChild(_xyz.utils.wire()`
    <div class="list" style="grid-column: 1 / 3;">
	<div class="add xyz-icon icon-cloud-upload off-black-filter">
	<input
	type="file"
	accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document;"
	onchange=${e => {

			const reader = new FileReader();

			const file = e.target.files[0];

			if (!file) return;

			const placeholder = _xyz.utils.wire()`<div class="item"><div class="xyz-icon loader">`;

			entry.listview.insertBefore(placeholder, entry.listview.childNodes[entry.listview.childNodes.length - 1]);

			reader.onload = readerOnload => {

				const xhr = new XMLHttpRequest();

				xhr.open('POST', _xyz.host + '/api/provider/cloudinary?' +
					_xyz.utils.paramString({
						resource_type: 'raw',
						//public_id: file.name,
						token: _xyz.token,
					}));

				xhr.setRequestHeader('Content-Type', 'application/octet-stream');
				xhr.responseType = 'json';

				xhr.onload = e => {

					if (e.target.status > 202) return console.log('document_upload failed');

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
				<div class="item">
				${(entry.edit) && _xyz.utils.wire()`
				<button
					class="xyz-icon icon-trash link-remove"
					data-name=${public_id}
					data-href=${secure_url}
					onclick=${e => removeDocument(e)}>
				</button>`}
				<a href=${secure_url} target="_blank">${public_id}`

					};
					_xhr.send();

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

		xhr.open('GET', _xyz.host + '/api/provider/cloudinary?' +
			_xyz.utils.paramString({
				destroy: true,
				public_id: doc.dataset.name,
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

				doc.parentNode.remove();

			};
			_xhr.send();

		}

		xhr.send()
	}

}